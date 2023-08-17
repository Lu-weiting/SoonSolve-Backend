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
          const my_id = req.decodedToken.id;
            const { location,friend,title, cursor } = req.query;
            // const {redisClient} = req;
            
            const result = await task.homeSearch(res,cursor ? cursor: null ,location ? location: null,friend ? Number(friend) : null,title ? title:null,my_id);
            res.status(200).json(result);
        }catch (error) {
            errorMsg.dbConnection(res);
        }
    },
    tasksDetail: async (req, res) => {
        try {
          const taskId = Number(req.params.id);
          if (!taskId) return errorMsg.inputEmpty(res);
    
<<<<<<< HEAD
          const result = await task.tasksDetail(res, taskId);
          res.status(200).json(result);
=======
          const response = await task.tasksDetail(res, taskId);
          res.status(200).json(response);
>>>>>>> 9be1c5b0de94544ef9bddabcb3593695b01d308d
        } catch (error) {
          console.error(error);
          errorMsg.dbConnection(res);
        }
<<<<<<< HEAD
     }
=======
    },
    updateTask: async (req,res)=>{
      try {
        if (req.headers['content-type'] != 'application/json') return errorMsg.contentType(res);
        const requestBody = req.body;
        const taskId = Number(req.params.task_id);
        const my_id = req.decodedToken.id;
        if (!taskId) return errorMsg.inputEmpty(res);
        const result = await task.updateTask(res,requestBody,taskId,my_id);
        res.status(200).json(result);
      } catch (error) {
        console.error(error);
        errorMsg.dbConnection(res);
      }
    }
>>>>>>> 9be1c5b0de94544ef9bddabcb3593695b01d308d
}