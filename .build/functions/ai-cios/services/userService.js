const catalyst = require('zcatalyst-sdk-node');

const TABLE_NAME = 'users';

const getApp = (req) => {
    try {
        // AdvancedIO (Express) initialization
        return catalyst.initialize(req);
    } catch (e) {
        // Fallback for standalone script/local
        return catalyst.initializeApp({ 
            project_id: process.env.PROJECT_ID || '123',
            project_key: process.env.PROJECT_KEY || 'abc',
            environment: 'Development'
        });
    }
};

async function getAllUsers(req) {
    const app = getApp(req);
    const zcql = app.zcql();
    const query = `SELECT * FROM ${TABLE_NAME}`;
    
    const result = await zcql.executeZCQLQuery(query);
    if (result && result.length > 0 && result[0][TABLE_NAME]) {
        return result.map(row => row[TABLE_NAME]);
    }
    return [];
}

async function findUserByUsername(req, username) {
    const users = await getAllUsers(req);
    return users.find(u => u.username === username);
}

async function findUserById(req, id) {
    const app = getApp(req);
    const table = app.datastore().table(TABLE_NAME);
    return await table.getRowPromise(id);
}

async function updateUser(req, rowData) {
    const app = getApp(req);
    const table = app.datastore().table(TABLE_NAME);
    return await table.updateRowPromise(rowData);
}

module.exports = {
    getAllUsers,
    findUserByUsername,
    findUserById,
    updateUser
};
