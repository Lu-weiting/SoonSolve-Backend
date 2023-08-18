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
    updateTaskReq: async (req,res)=>{
      try {
        const status = req.params.status;
        const user_taskId = Number(req.params.user_task_id);
        if (status != 'Accepted' && type != 'Finished') return errorMsg.inputEmpty(res);
        const result = await tasksReqModel.updateTaskReq(res, status, user_taskId);
        res.status(200).json(result);
      } catch (error) {
        console.error(error);
        errorMsg.dbConnection(res);
      }
    }
}