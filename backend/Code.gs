// DEPLOYMENT INSTRUCTIONS:
// 1. Paste this code into a new Google Apps Script project (script.google.com).
// 2. Click "Deploy" > "New deployment".
// 3. Select type: "Web app".
// 4. Description: "MicroHub Backend".
// 5. Execute as: "Me" (your email).
// 6. Who has access: "Anyone".
// 7. Click "Deploy".
// 8. Copy the "Web App URL" and paste it into the MicroHub settings.

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    const sheetId = params.sheetId;

    if (!sheetId) throw new Error("Missing Sheet ID");

    const ss = SpreadsheetApp.openById(sheetId);
    
    if (action === 'init') {
      return handleInit(ss);
    } else if (action === 'login') {
      return handleLogin(ss, params.authKey);
    } else if (action === 'sync') {
      return handleSync(ss, params.authKey, params.data);
    }

    return response({ status: 'error', message: 'Invalid action' });

  } catch (err) {
    return response({ status: 'error', message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  // Handle retrieving data
  try {
    const sheetId = e.parameter.sheetId;
    const authKey = e.parameter.authKey;

    if (!sheetId || !authKey) throw new Error("Missing parameters");

    const ss = SpreadsheetApp.openById(sheetId);
    if (!isAuthenticated(ss, authKey)) {
      throw new Error("Invalid Authenticator Key");
    }

    const storageSheet = ss.getSheetByName('App_Storage');
    if (!storageSheet) throw new Error("Storage sheet missing");

    const data = storageSheet.getRange('A1').getValue();
    
    return response({ status: 'success', data: data ? JSON.parse(data) : {} });

  } catch (err) {
    return response({ status: 'error', message: err.toString() });
  }
}

// --- Handlers ---

function handleInit(ss) {
  let identitySheet = ss.getSheetByName('App_Identity');
  let storageSheet = ss.getSheetByName('App_Storage');
  let isNew = false;
  let authKey;

  // Create Identity Sheet if missing
  if (!identitySheet) {
    identitySheet = ss.insertSheet('App_Identity');
    // Generate 6-digit key
    authKey = Math.floor(100000 + Math.random() * 900000).toString();
    identitySheet.getRange('A1').setValue('Auth_Key');
    identitySheet.getRange('B1').setValue(authKey);
    identitySheet.hideSheet(); // Hide for slight obscurity
    isNew = true;
  } else {
    // Already exists, we don't return the key, user must know it
    isNew = false;
  }

  // Create Storage Sheet if missing
  if (!storageSheet) {
    storageSheet = ss.insertSheet('App_Storage');
    storageSheet.getRange('A1').setValue('{}'); // Init empty JSON
  }

  if (isNew) {
    return response({ status: 'created', authKey: authKey });
  } else {
    return response({ status: 'existing' });
  }
}

function handleLogin(ss, providedKey) {
  if (isAuthenticated(ss, providedKey)) {
    return response({ status: 'success' });
  } else {
    return response({ status: 'error', message: 'Invalid Key' });
  }
}

function handleSync(ss, providedKey, data) {
  if (!isAuthenticated(ss, providedKey)) {
     throw new Error("Unauthorized");
  }

  const storageSheet = ss.getSheetByName('App_Storage');
  // Store entire app state in A1 as JSON string
  storageSheet.getRange('A1').setValue(JSON.stringify(data));
  
  return response({ status: 'success' });
}

// --- Helpers ---

function isAuthenticated(ss, providedKey) {
  const identitySheet = ss.getSheetByName('App_Identity');
  if (!identitySheet) return false;
  
  const storedKey = identitySheet.getRange('B1').getValue().toString();
  return String(storedKey) === String(providedKey);
}

function response(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}