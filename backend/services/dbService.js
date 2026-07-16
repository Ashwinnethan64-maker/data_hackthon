const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(tableName) {
  return path.join(DATA_DIR, `${tableName}.json`);
}

function readTable(tableName) {
  const filePath = getFilePath(tableName);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${tableName}.json:`, error);
    return [];
  }
}

function writeTable(tableName, data) {
  const filePath = getFilePath(tableName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${tableName}.json:`, error);
  }
}

function generateId() {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

async function getAllRows(req, tableName) {
  return readTable(tableName);
}

async function getRow(req, tableName, rowId) {
  const tableData = readTable(tableName);
  return tableData.find(r => r.ROWID === rowId || r.id === rowId) || null;
}

async function insertRow(req, tableName, rowData) {
  const tableData = readTable(tableName);
  const newRecord = { ROWID: generateId(), ...rowData };
  tableData.push(newRecord);
  writeTable(tableName, tableData);
  return newRecord;
}

async function updateRow(req, tableName, rowData) {
  const tableData = readTable(tableName);
  const index = tableData.findIndex(r => r.ROWID === rowData.ROWID || r.id === rowData.ROWID);
  
  if (index !== -1) {
    tableData[index] = { ...tableData[index], ...rowData };
    writeTable(tableName, tableData);
    return tableData[index];
  }
  throw new Error('Row not found in fallback store');
}

async function deleteRow(req, tableName, rowId) {
  const tableData = readTable(tableName);
  const index = tableData.findIndex(r => r.ROWID === rowId || r.id === rowId);
  
  if (index !== -1) {
    const deleted = tableData.splice(index, 1);
    writeTable(tableName, tableData);
    return deleted[0];
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
