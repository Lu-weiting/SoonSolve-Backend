const tasksReqModel = require('../Models/tasksReqModel');
const errorMsg = require('../utils/error');

module.exports = {
    getTaskReqList: async (req, res) => {
        try {
          const userId = req.decodedToken.id;
          const cursor = req.query.cursor;
          let limit = 10;
          const result = await tasksReqModel.getTaskReqList(res, userId, cursor ? cursor : null, limit);
          return res.status(200).json(result);
        } catch (error) {
          console.error(error);
          errorMsg.dbConnection(res);
        }
    },
}