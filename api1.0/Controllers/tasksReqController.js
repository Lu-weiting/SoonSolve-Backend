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
            errorMsg.dbConnection(res);
        }
        
    }

}