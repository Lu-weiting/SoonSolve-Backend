const tasksReqModel = require('../Models/tasksReqModel');
const errorMsg = require('../utils/error');
module.exports = {
    sendRequest: async(req,res)=>{
        try{
            const userId = req.decodedToken.id;
            const taskId = Number(req.params.task_id);
            const result = await tasksReqModel.sendRequest(res,taskId,userId);
            res.status(200).json(result);
        }catch (error) {
            errorMsg.dbConnection(res);
        }
        
    }

}