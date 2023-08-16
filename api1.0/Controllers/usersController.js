// 引入資料庫連線
const tasksModel = require('../utils/usersModel');
const errorMsg = require('../utils/error');

module.exports = {
  getRecords: async (req, res) => {
    try {
      const my_id = req.decodedToken.id;
      const type = req.params.type;
      let limit = 10;
      if (type != 'Released' || type != 'Accepted') return errorMsg.inputEmpty(res);
      await tasksModel.tasksRecord(my_id, type, limit);
    } catch (error) {
      console.error(error);
      errorMsg.dbConnection(res);
    }
  }
}
