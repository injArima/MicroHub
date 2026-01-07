
// DEPLOYMENT INSTRUCTIONS:
// 1. Paste this code into a new Google Apps Script project.
// 2. Deploy as Web App -> Execute as: Me -> Access: Anyone.

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(30000);

  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    const sheetId = params.sheetId;

    if (!sheetId) throw new Error("Missing Sheet ID");
    const ss = SpreadsheetApp.openById(sheetId);

    let result;
    switch (action) {
      case 'check_status':
        result = handleCheckStatus(ss);
        break;
      case 'setup_new_user':
        result = handleSetupNewUser(ss, params.userName);
        break;
      case 'login':
        result = handleLogin(ss, params.authKey);
        break;
      case 'reset_sheet':
        // No key required for reset (User lost key scenario)
        result = handleResetSheet(ss);
        break;
      case 'sync_sheet':
        result = handleSyncSheet(ss, params.authKey, params.targetSheetName, params.data);
        break;
      default:
        result = response({ status: 'error', message: 'Invalid action' });
    }
    
    SpreadsheetApp.flush();
    return result;

  } catch (err) {
    return response({ status: 'error', message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    const sheetId = e.parameter.sheetId;
    const authKey = e.parameter.authKey;

    if (!sheetId || !authKey) throw new Error("Missing parameters");
    const ss = SpreadsheetApp.openById(sheetId);
    
    // Verify Key
    if (!verifyKey(ss, authKey)) throw new Error("Invalid Credentials");

    return handleSyncPull(ss);

  } catch (err) {
    return response({ status: 'error', message: err.toString() });
  }
}

// --- CORE HANDLERS ---

function handleCheckStatus(ss) {
  const configSheet = ss.getSheetByName('App_Config');
  // If config sheet exists and has a hash in B3, it's a returning user
  if (configSheet && configSheet.getRange('B3').getValue() !== "") {
    const userName = configSheet.getRange('B2').getValue();
    return response({ status: 'returning_user', userName: userName || 'User' });
  } else {
    // Check if it's a completely empty default sheet (clean slate)
    return response({ status: 'new_user' });
  }
}

function handleSetupNewUser(ss, userName) {
  // 1. Generate 6-digit Key
  const rawKey = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedKey = hashString(rawKey);

  // 2. Setup Config Sheet
  let configSheet = ss.getSheetByName('App_Config');
  if (!configSheet) {
    // Try to rename the first sheet if it exists to avoid clutter
    const sheets = ss.getSheets();
    if (sheets.length > 0) {
      configSheet = sheets[0];
      configSheet.setName('App_Config');
    } else {
      configSheet = ss.insertSheet('App_Config');
    }
  }
  
  configSheet.clear();
  configSheet.appendRow(['Parameter', 'Value']);
  configSheet.appendRow(['User Name', userName]);
  configSheet.appendRow(['Auth Hash', hashedKey]); // B3 is the Hash
  configSheet.appendRow(['Created At', new Date().toISOString()]);
  
  // Style config
  configSheet.getRange('A1:B1').setFontWeight('bold').setBackground('#f3f4f6');
  configSheet.setColumnWidth(1, 150);
  configSheet.setColumnWidth(2, 300);

  // 3. Initialize Data Sheets
  setupSubSheets(ss);

  // Return the RAW key to the user ONLY ONCE
  return response({ status: 'success', rawKey: rawKey });
}

function handleResetSheet(ss) {
  // WIPE LOGIC - NO KEY REQUIRED
  // We cannot delete the last sheet.
  // 1. Insert a temp sheet.
  let temp = ss.getSheetByName('Temp_Reset_Placeholder');
  if (!temp) temp = ss.insertSheet('Temp_Reset_Placeholder');

  // 2. Delete all other sheets
  const sheets = ss.getSheets();
  sheets.forEach(s => {
    if (s.getName() !== 'Temp_Reset_Placeholder') {
      try { ss.deleteSheet(s); } catch(e) {}
    }
  });

  // 3. Rename Temp to App_Config and leave empty
  temp.setName('App_Config');
  temp.clear();

  return response({ status: 'success', message: 'Sheet reset complete.' });
}

function handleLogin(ss, providedKey) {
  if (verifyKey(ss, providedKey)) {
    return response({ status: 'success' });
  }
  return response({ status: 'error', message: 'Invalid Access Key' });
}

function handleSyncSheet(ss, providedKey, targetSheetName, data) {
  if (!verifyKey(ss, providedKey)) throw new Error("Unauthorized");

  // Schema Definitions
  let headers = [];
  let mapper = null;

  if (targetSheetName === 'Task_Tracker') {
    headers = ['ID', 'Title', 'Description', 'Priority', 'Status', 'Created At', 'Completed At'];
    mapper = t => [t.id, t.title, t.description, t.priority, t.status, t.createdAt, t.completedAt || ''];
  } 
  else if (targetSheetName === 'Journal_Notes') {
    headers = ['ID', 'Date', 'Title', 'Content', 'Tags'];
    mapper = j => [j.id, j.date, j.title, j.content, Array.isArray(j.tags) ? j.tags.join(',') : j.tags];
  } 
  else if (targetSheetName === 'Cinema_Log') {
    headers = ['ID', 'Title', 'Year', 'Director', 'Genre', 'Status', 'Poster URL', 'Score', 'Episodes'];
    mapper = m => [
      m.id, 
      m.title, 
      m.year, 
      m.director, 
      Array.isArray(m.genre) ? m.genre.join(',') : m.genre, 
      m.status, 
      m.posterUrl || '',
      m.score || '',
      m.episodeCount ? m.episodeCount.toString() : ''
    ];
  } 
  else {
    throw new Error("Unknown Target Sheet: " + targetSheetName);
  }

  updateSheetData(ss, targetSheetName, headers, data, mapper);
  return response({ status: 'success' });
}

function handleSyncPull(ss) {
  const tasks = readSheetData(ss, 'Task_Tracker', ['id', 'title', 'description', 'priority', 'status', 'createdAt', 'completedAt']);
  const journal = readSheetData(ss, 'Journal_Notes', ['id', 'date', 'title', 'content', 'tags']);
  const movies = readSheetData(ss, 'Cinema_Log', ['id', 'title', 'year', 'director', 'genre', 'status', 'posterUrl', 'score', 'episodeCount']);
  
  // Get User Name from Config
  const configSheet = ss.getSheetByName('App_Config');
  const storedName = configSheet ? configSheet.getRange('B2').getValue() : 'Traveler';

  // Data Clean up (Strings to Arrays)
  const formattedJournal = journal.map(j => ({...j, tags: j.tags ? j.tags.toString().split(',') : []}));
  const formattedMovies = movies.map(m => ({
    ...m, 
    genre: m.genre ? m.genre.toString().split(',') : [], 
    posterUrl: m.posterUrl || '',
    score: m.score || '',
    episodeCount: m.episodeCount ? parseInt(m.episodeCount) : undefined
  }));
  
  return response({
    status: 'success',
    data: {
      tasks: tasks,
      journal: formattedJournal,
      movies: formattedMovies,
      user: { name: storedName }
    }
  });
}

// --- HELPERS ---

function setupSubSheets(ss) {
  const definitions = [
    { name: 'Task_Tracker', headers: ['ID', 'Title', 'Description', 'Priority', 'Status', 'Created At', 'Completed At'] },
    { name: 'Journal_Notes', headers: ['ID', 'Date', 'Title', 'Content', 'Tags'] },
    { name: 'Cinema_Log', headers: ['ID', 'Title', 'Year', 'Director', 'Genre', 'Status', 'Poster URL', 'Score', 'Episodes'] }
  ];

  definitions.forEach(def => {
    let sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
      sheet.appendRow(def.headers);
      sheet.getRange(1, 1, 1, def.headers.length).setFontWeight('bold').setBackground('#e5e7eb');
    }
  });
}

function updateSheetData(ss, sheetName, headers, dataArray, mapper) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
  }

  // Clear existing data (preserve header)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }

  if (!dataArray || dataArray.length === 0) return;

  const rows = dataArray.map(mapper);
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
}

function readSheetData(ss, sheetName, keys) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  
  return data.map(row => {
    let obj = {};
    keys.forEach((key, index) => {
      let val = row[index];
      // Convert Google Script Date objects to ISO strings if needed
      if (Object.prototype.toString.call(val) === '[object Date]') {
         val = val.toISOString();
      }
      obj[key] = val;
    });
    return obj;
  });
}

function verifyKey(ss, providedKey) {
  const config = ss.getSheetByName('App_Config');
  if (!config) return false;
  // Hash the provided key and compare with stored hash in B3
  const storedHash = config.getRange('B3').getValue();
  const providedHash = hashString(providedKey);
  return storedHash === providedHash;
}

function hashString(str) {
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str.toString());
  let txtHash = '';
  for (let i = 0; i < rawHash.length; i++) {
    let hashVal = rawHash[i];
    if (hashVal < 0) {
      hashVal += 256;
    }
    if (hashVal.toString(16).length == 1) {
      txtHash += '0';
    }
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}

function response(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
