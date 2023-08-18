const tasksReqModel = require('../Models/tasksReqModel');
const errorMsg = require('../utils/error');
module.exports = {
    sendRequest: async(req,res)=>{
        try{
            const userId = req.decodedToken.id;
            const taskId = Number(req.params.task_id);
            const {ask_count} = req.body;
            if(!taskId) return errorMsg.inputEmpty(res);
            if(!ask_count) return errorMsg.inputEmpty(res);
            const result = await tasksReqModel.sendRequest(res,ask_count,taskId,userId);
            res.status(200).json(result);
        }
        catch (error) {
            errorMsg.controllerProblem(res);
            console.error(error);
        }
    },
    deleteRequest: async(req,res)=>{
        try{
            const user_taskId = Number(req.params.user_task_id);
            if(!user_taskId) return errorMsg.inputEmpty(res);
            const result = await tasksReqModel.deleteRequest(res,user_taskId);
            res.status(200).json(result);
        }
        catch (error) {
            errorMsg.controllerProblem(res);
            console.error(error);
        }
    },
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