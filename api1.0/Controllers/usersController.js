// 引入資料庫連線
const tasksModel = require('../utils/usersModel');
const errorMsg = require('../utils/error');

module.exports = {
  getRecords: async (req, res) => {
    try {
      const my_id = req.decoded.id;
      const type = req.params.type;
      if (type != 'Released' || type != 'Accepted') return error_message.input(res);
      await usersModel.tasksRecord(my_id, type);
    } catch (error) {
      console.error(error);
      errorMsg.dbConnection(res);
    }
  }
}
