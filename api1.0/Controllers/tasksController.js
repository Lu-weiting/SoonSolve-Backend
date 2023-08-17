const task = require('../Models/tasksModel');
const errorMsg = require('../utils/error');
module.exports = {
    createTask: async (req, res) => {
      try{
        const {userId} = req.decodedToken;
        const {context} = req.body;
        if(context){
          const result = await task.createTask(res, userId, context);
          res.status(200).json(result);
        }else {
          errorMsg.inputEmpty(res);
        }
      }catch (error) {
          errorMsg.dbConnection(res);
      }
    },
    deletetask: async (req, res) => {
      try{
        const taskId = Number(req.params.id);
        const {userId} = req.decodedToken;
        if(!isNaN(taskId)){
          const result = await task.deletetask(res, taskId, userId);
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
            const {userId}=req.decodedToken;
            const { location,friend,title, cursor } = req.query;
            // const {redisClient} = req;
            
            const result = await task.homeSearch(res,cursor ? cursor: null ,location ? location: null,friend ? Number(friend) : null,title ? title:null,userId);
            res.status(200).json(result);
        }catch (error) {
            errorMsg.dbConnection(res);
        }
    },
    tasksDetail: async (req, res) => {
        try {
          const taskId = Number(req.params.id);
          if (!taskId) return error_message.input(res);
    
          const result = await task.tasksDetail(res, taskId);
          res.status(200).json(result);
        } catch (error) {
          console.error(error);
          errorMsg.dbConnection(res);
        }
     }
}