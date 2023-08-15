// 引入資料庫連線
const tasksModel = require('../Models/tasksModel');
const error = require('../utils/error');

module.exports = {
  getDetail: async (req, res) => {
    try {
      const taskId = Number(req.params.id);
      if (!taskId) return error_message.input(res);

      const response = await tasksModel.tasksDetail(taskId);
      return res.status(200).json(response);
    } catch (errorMsg) {
      console.error(errorMsg);
      error.dbConnection(res);
    }
  }
}
