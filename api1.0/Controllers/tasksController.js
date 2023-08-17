const tasksModel = require('../Models/tasksModel');
const errorMsg = require('../utils/error');
module.exports = {
    createTask: async (req, res) => {
      try{
        const userId = req.decodedToken.id;
        const context = req.body;
        console.log(context);
        if(context){
          const result = await tasksModel.createTask(res, userId, context);
          res.status(200).json(result);
        }else {
          errorMsg.inputEmpty(res);
        }
      }catch (error) {
          errorMsg.dbConnection(res);
          console.error(error);
      }
    },
    deletetask: async (req, res) => {
      try{
        const taskId = Number(req.params.id);
        const {userId} = req.decodedToken;
        if(!isNaN(taskId)){
          const result = await tasksModel.deletetask(res, taskId, userId);
          res.status(200).json(result);
        }else {
          errorMsg.inputEmpty(res);
        }
      }catch (error) {
          errorMsg.dbConnection(res);
      }
    },
    homeSearch: async (req, res) => {
        try{
          const my_id = req.decodedToken.id;
            const { location,friend,title, cursor } = req.query;
            // const {redisClient} = req;
            
            const result = await tasksModel.homeSearch(res,cursor ? cursor: null ,location ? location: null,friend ? Number(friend) : null,title ? title:null,my_id);
            res.status(200).json(result);
        }catch (error) {
            errorMsg.dbConnection(res);
        }
    },
    tasksDetail: async (req, res) => {
        try {
          const taskId = Number(req.params.id);
          if (!taskId) return errorMsg.inputEmpty(res);
    
          const result = await tasksModel.tasksDetail(res, taskId);
          res.status(200).json(result);
        } catch (error) {
          console.error(error);
          errorMsg.dbConnection(res);
        }
    },
    updateTask: async (req,res)=>{
      try {
        if (req.headers['content-type'] != 'application/json') return errorMsg.contentType(res);
        const requestBody = req.body;
        const taskId = Number(req.params.task_id);
        const my_id = req.decodedToken.id;
        if (!taskId) return errorMsg.inputEmpty(res);
        const result = await tasksModel.updateTask(res,requestBody,taskId,my_id);
        res.status(200).json(result);
      } catch (error) {
        console.error(error);
        errorMsg.dbConnection(res);
      }
    }
}