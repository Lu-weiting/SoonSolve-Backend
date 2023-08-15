// 引入資料庫連線
const tasksModel = require('../Models/tasksModel');
const error = require('../Others/error');

module.exports = {
  getDetail: async (req, res) => {
    try {
      const postId = Number(req.params.id);
      await tasksModel.tasksDetail(postId);
    } catch (errorMsg) {
      console.error(errorMsg);
      error.dbConnection(res);
    }
  }
}
