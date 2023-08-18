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
        }catch (error) {
            console.error(error);
            errorMsg.dbConnection(res);
        }
    },
    deleteRequest: async(req,res)=>{
        try{
            const user_taskId = Number(req.params.user_task_id);
            if(!user_taskId) return errorMsg.inputEmpty(res);
            const result = await tasksReqModel.deleteRequest(res,user_taskId);
            res.status(200).json(result);
        }catch (error) {
            console.error(error);
            errorMsg.dbConnection(res);
        }
    }

}