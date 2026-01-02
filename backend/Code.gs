// DEPLOYMENT INSTRUCTIONS:
// 1. Paste this code into a new Google Apps Script project.
// 2. Deploy as Web App -> Execute as: Me -> Access: Anyone.

function doPost(e) {
  const lock = LockService.getScriptLock();
  // Wait up to 30 seconds for other processes to finish.
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
      case 'wipe_and_reset':
        result = handleWipeAndReset(ss, params.userName);
        break;
      case 'sync_push':
        result = handleSyncPush(ss, params.authKey, params.data);
        break;
      default:
        result = response({ status: 'error', message: 'Invalid action' });
    }
    
    // Ensure all changes are committed before returning
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
    
    if (!verifyKey(ss, authKey)) throw new Error("Invalid Credentials");

    return handleSyncPull(ss);

  } catch (err) {
    return response({ status: 'error', message: err.toString() });
  }
}

// --- CORE HANDLERS ---

function handleCheckStatus(ss) {
  const configSheet = ss.getSheetByName('App_Config');
  if (configSheet) {
    const userName = configSheet.getRange('B2').getValue();
    return response({ status: 'returning_user', userName: userName });
  } else {
    return response({ status: 'new_user' });
  }
}

function handleSetupNewUser(ss, userName) {
  // 1. Generate Key
  const rawKey = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedKey = hashString(rawKey);

  // 2. Setup Config Sheet
  let configSheet = ss.getSheetByName('App_Config');
  if (!configSheet) {
    const sheets = ss.getSheets();
    if (sheets.length > 0) {
      sheets[0].setName('App_Config');
      configSheet = sheets[0];
    } else {
      configSheet = ss.insertSheet('App_Config');
    }
  }
  
  configSheet.clear();
  configSheet.appendRow(['Parameter', 'Value']); // Headers
  configSheet.appendRow(['User Name', userName]);
  configSheet.appendRow(['Auth Hash', hashedKey]);
  configSheet.appendRow(['Created At', new Date().toISOString()]);
  
  // Style Config
  configSheet.getRange('A1:B1').setFontWeight('bold').setBackground('#f3f4f6');
  configSheet.setColumnWidth(1, 150);
  configSheet.setColumnWidth(2, 300);

  // 3. Create Sub-Sheets structure
  setupSubSheets(ss);

  return response({ status: 'success', rawKey: rawKey });
}

function handleLogin(ss, providedKey) {
  if (verifyKey(ss, providedKey)) {
    return response({ status: 'success' });
  }
  return response({ status: 'error', message: 'Invalid Access Key' });
}

function handleWipeAndReset(ss, userName) {
  // 1. Delete all sheets except a temp one to avoid "All sheets removed" error
  const sheets = ss.getSheets();
  let temp = ss.insertSheet('TEMP_WIPE_' + Date.now());
  
  sheets.forEach(s => {
    try { ss.deleteSheet(s); } catch(e) {}
  });

  // CRITICAL: Flush to ensure deletions are registered before re-creation
  SpreadsheetApp.flush();

  // 2. Call setup logic
  const resultObj = handleSetupNewUser(ss, userName);
  // Extract content to verify success before deleting temp
  const result = JSON.parse(resultObj.getContent());

  // 3. Remove temp
  if (result.status === 'success') {
      try { ss.deleteSheet(temp); } catch(e) {}
      SpreadsheetApp.flush();
      return resultObj;
  } else {
      throw new Error("Re-initialization failed");
  }
}

function handleSyncPush(ss, providedKey, data) {
  if (!verifyKey(ss, providedKey)) throw new Error("Unauthorized");

  // Update Task Tracker
  if (data.tasks) updateSheetData(ss, 'Task_Tracker', ['ID', 'Title', 'Date', 'Time', 'Priority', 'Status'], data.tasks);
  
  // Update Journal
  if (data.journal) updateSheetData(ss, 'Journal_Notes', ['ID', 'Date', 'Title', 'Content', 'Tags'], data.journal);
  
  // Update Cinema Log
  if (data.movies) updateSheetData(ss, 'Cinema_Log', ['ID', 'Title', 'Year', 'Director', 'Genre', 'Status'], data.movies);

  return response({ status: 'success' });
}

function handleSyncPull(ss) {
  const tasks = readSheetData(ss, 'Task_Tracker', ['id', 'title', 'date', 'time', 'priority', 'colorTheme']);
  const journal = readSheetData(ss, 'Journal_Notes', ['id', 'date', 'title', 'content', 'tags']);
  const movies = readSheetData(ss, 'Cinema_Log', ['id', 'title', 'year', 'director', 'genre', 'status', 'posterUrl']);

  // Post-process arrays back to specific formats if needed (e.g. tags split)
  const formattedJournal = journal.map(j => ({...j, tags: j.tags ? j.tags.toString().split(',') : []}));
  const formattedMovies = movies.map(m => ({...m, genre: m.genre ? m.genre.toString().split(',') : [], posterUrl: m.posterUrl || ''}));
  const formattedTasks = tasks.map(t => ({...t, team: [], colorTheme: t.colorTheme || 'yellow'})); // Defaults

  return response({
    status: 'success',
    data: {
      tasks: formattedTasks,
      journal: formattedJournal,
      movies: formattedMovies
    }
  });
}

// --- HELPERS ---

function setupSubSheets(ss) {
  const definitions = [
    { name: 'Task_Tracker', headers: ['ID', 'Title', 'Date', 'Time', 'Priority', 'Status'] },
    { name: 'Journal_Notes', headers: ['ID', 'Date', 'Title', 'Content', 'Tags'] },
    { name: 'Cinema_Log', headers: ['ID', 'Title', 'Year', 'Director', 'Genre', 'Status', 'Poster URL'] }
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

function updateSheetData(ss, sheetName, headers, dataArray) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
  }

  // Clear existing content (keep headers)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }

  if (!dataArray || dataArray.length === 0) return;

  // Transform objects to 2D array based on sheet type
  const rows = dataArray.map(item => {
    if (sheetName === 'Task_Tracker') return [item.id, item.title, item.date, item.time, item.priority, item.colorTheme];
    if (sheetName === 'Journal_Notes') return [item.id, item.date, item.title, item.content, Array.isArray(item.tags) ? item.tags.join(',') : item.tags];
    if (sheetName === 'Cinema_Log') return [item.id, item.title, item.year, item.director, Array.isArray(item.genre) ? item.genre.join(',') : item.genre, item.status, item.posterUrl];
    return [];
  });

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
      obj[key] = row[index];
    });
    return obj;
  });
}

function verifyKey(ss, providedKey) {
  const config = ss.getSheetByName('App_Config');
  if (!config) return false;
  const storedHash = config.getRange('B3').getValue(); // Assuming B3 is Auth Hash
  const providedHash = hashString(providedKey);
  return storedHash === providedHash;
}

function hashString(str) {
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str);
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