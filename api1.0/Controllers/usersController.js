// 引入資料庫連線
const usersModel = require('../Models/usersModel');
const errorMsg = require('../utils/error');

module.exports = {
  getRecords: async (req, res) => {
    try {
      const my_id = req.decodedToken.id;
      const type = req.params.type;
      let limit = 10;
      if (type != 'Released' || type != 'Accepted') return errorMsg.inputEmpty(res);
      const result = await usersModel.tasksRecord(res, my_id, type, cursor ? cursor: null , limit);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      errorMsg.dbConnection(res);
    }
  }
}
