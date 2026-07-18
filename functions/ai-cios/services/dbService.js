const fs = require('fs');
const path = require('path');
const catalyst = require('zcatalyst-sdk-node');

const DATA_DIR = path.join(__dirname, '..', 'data');

// In-memory fallback database
const MEMORY_DB = {
  firs: [],
  officers: [],
  audit_logs: [],
  reports: []
};

// Bootstrap in-memory database with pre-seeded files on startup (if they exist)
function bootstrapTable(tableName) {
  const filePath = path.join(DATA_DIR, `${tableName}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      MEMORY_DB[tableName] = JSON.parse(data);
    } catch (error) {
      console.error(`Error bootstrapping memory table ${tableName}:`, error);
    }
  }
}

// Bootstrap default tables
bootstrapTable('firs');
bootstrapTable('officers');

function readTable(tableName) {
  if (!MEMORY_DB[tableName]) {
    MEMORY_DB[tableName] = [];
  }
  return MEMORY_DB[tableName];
}

function writeTable(tableName, data) {
  MEMORY_DB[tableName] = data;
}

function generateId() {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

function normalizeRow(row) {
  if (!row) return row;
  const rowId = row.ROWID || row.id;
  return {
    ...row,
    ROWID: rowId,
    id: rowId
  };
}

function formatCatalystDate(val) {
  if (typeof val !== 'string') return val;
  const isoPattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)?$/;
  if (isoPattern.test(val)) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      const hh = String(d.getUTCHours()).padStart(2, '0');
      const min = String(d.getUTCMinutes()).padStart(2, '0');
      const ss = String(d.getUTCSeconds()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    }
  }
  return val;
}

function logDebug(message) {
  try {
    fs.appendFileSync(path.join(DATA_DIR, 'debug_db.log'), `[${new Date().toISOString()}] ${message}\n`);
  } catch (e) {
    console.error("Failed to write debug log:", e);
  }
}

function getApp(req) {
  if (req && req.res && req.res.locals && req.res.locals.catalyst) {
    return req.res.locals.catalyst;
  }
  try {
    return catalyst.initialize(req);
  } catch (e) {
    // Standalone / local script fallback
    if (process.env.CATALYST_PROJECT_ID || process.env.PROJECT_ID) {
      return catalyst.initializeApp({
        project_id: process.env.CATALYST_PROJECT_ID || process.env.PROJECT_ID,
        project_key: process.env.CATALYST_PROJECT_KEY || process.env.PROJECT_KEY,
        environment: process.env.CATALYST_ENVIRONMENT || 'Development'
      });
    }
    return null;
  }
}

async function getAllRows(req, tableName) {
  const app = getApp(req);
  logDebug(`getAllRows called for table '${tableName}'. App resolved: ${!!app}`);
  if (app && process.env.DISABLE_CATALYST_STORE !== 'true') {
    try {
      const zcql = app.zcql();
      const query = `SELECT * FROM ${tableName}`;
      const queryResult = await zcql.executeZCQLQuery(query);
      logDebug(`ZCQL query succeeded for table '${tableName}'. Row count: ${queryResult.length}`);
      return queryResult.map(row => normalizeRow(row[tableName]));
    } catch (error) {
      logDebug(`[WARN] ZCQL query failed for table '${tableName}': ${error.message}`);
    }
  }
  logDebug(`Falling back to local JSON for table '${tableName}'`);
  return readTable(tableName).map(normalizeRow);
}

async function getRow(req, tableName, rowId) {
  const app = getApp(req);
  if (app && process.env.DISABLE_CATALYST_STORE !== 'true') {
    try {
      const table = app.datastore().table(tableName);
      const row = await table.getRow(rowId);
      return normalizeRow(row);
    } catch (error) {
      logDebug(`[WARN] Datastore getRow failed for table '${tableName}' (id: ${rowId}): ${error.message}`);
    }
  }
  const tableData = readTable(tableName);
  const localRow = tableData.find(r => r.ROWID === rowId || r.id === rowId) || null;
  return normalizeRow(localRow);
}

async function insertRow(req, tableName, rowData) {
  const app = getApp(req);
  logDebug(`insertRow called for table '${tableName}'. App resolved: ${!!app}`);
  if (app && process.env.DISABLE_CATALYST_STORE !== 'true') {
    try {
      const table = app.datastore().table(tableName);
      const { ROWID, id, ...cleanData } = rowData;
      
      const formattedData = {};
      for (const [key, val] of Object.entries(cleanData)) {
        if (val !== null && typeof val === 'object') {
          formattedData[key] = JSON.stringify(val);
        } else {
          formattedData[key] = formatCatalystDate(val);
        }
      }

      logDebug(`Attempting Datastore insert for '${tableName}' with: ${JSON.stringify(formattedData)}`);
      const insertedRow = await table.insertRow(formattedData);
      logDebug(`Datastore insert succeeded for '${tableName}'. Inserted ROWID: ${insertedRow.ROWID}`);
      return normalizeRow(insertedRow);
    } catch (error) {
      logDebug(`[WARN] Datastore insertRow failed for table '${tableName}': ${error.stack || error.message}`);
    }
  }
  logDebug(`Falling back to local JSON insert for table '${tableName}'`);
  const tableData = readTable(tableName);
  const newRecord = { ROWID: generateId(), ...rowData };
  tableData.push(newRecord);
  writeTable(tableName, tableData);
  return normalizeRow(newRecord);
}

async function updateRow(req, tableName, rowData) {
  const app = getApp(req);
  if (app && process.env.DISABLE_CATALYST_STORE !== 'true') {
    try {
      const table = app.datastore().table(tableName);
      const rowId = rowData.ROWID || rowData.id;
      if (!rowId) {
        throw new Error('ROWID is required for Datastore update');
      }

      const formattedData = { ROWID: rowId };
      for (const [key, val] of Object.entries(rowData)) {
        if (key === 'ROWID' || key === 'id') continue;
        if (val !== null && typeof val === 'object') {
          formattedData[key] = JSON.stringify(val);
        } else {
          formattedData[key] = formatCatalystDate(val);
        }
      }

      const updatedRow = await table.updateRow(formattedData);
      return normalizeRow(updatedRow);
    } catch (error) {
      logDebug(`[WARN] Datastore updateRow failed for table '${tableName}': ${error.message}`);
    }
  }
  const tableData = readTable(tableName);
  const index = tableData.findIndex(r => r.ROWID === rowData.ROWID || r.id === rowData.ROWID);
  
  if (index !== -1) {
    tableData[index] = { ...tableData[index], ...rowData };
    writeTable(tableName, tableData);
    return normalizeRow(tableData[index]);
  }
  throw new Error('Row not found in fallback store');
}

async function deleteRow(req, tableName, rowId) {
  const app = getApp(req);
  if (app && process.env.DISABLE_CATALYST_STORE !== 'true') {
    try {
      const table = app.datastore().table(tableName);
      await table.deleteRow(rowId);
      return normalizeRow({ ROWID: rowId });
    } catch (error) {
      logDebug(`[WARN] Datastore deleteRow failed for table '${tableName}' (id: ${rowId}): ${error.message}`);
    }
  }
  const tableData = readTable(tableName);
  const index = tableData.findIndex(r => r.ROWID === rowId || r.id === rowId);
  
  if (index !== -1) {
    const deleted = tableData.splice(index, 1);
    writeTable(tableName, tableData);
    return normalizeRow(deleted[0]);
  }
  throw new Error('Row not found in fallback store');
}

module.exports = {
  getAllRows,
  getRow,
  insertRow,
  updateRow,
  deleteRow
};
