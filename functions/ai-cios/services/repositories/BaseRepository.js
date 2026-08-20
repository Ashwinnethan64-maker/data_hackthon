class BaseRepository {
  async getAllRows(_req, _tableName) {
    throw new Error('Method getAllRows() must be implemented.');
  }

  async getRow(_req, _tableName, _rowId) {
    throw new Error('Method getRow() must be implemented.');
  }

  async insertRow(_req, _tableName, _rowData) {
    throw new Error('Method insertRow() must be implemented.');
  }

  async updateRow(_req, _tableName, _rowData) {
    throw new Error('Method updateRow() must be implemented.');
  }

  async deleteRow(_req, _tableName, _rowId) {
    throw new Error('Method deleteRow() must be implemented.');
  }
}

module.exports = BaseRepository;
