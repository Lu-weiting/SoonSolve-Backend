const tasksModel = require('../Models/tasksModel');
const errorMsg = require('../utils/error');
module.exports = {
    createTask: async (req, res) => {
      try{
        const userId = req.decodedToken.id;
        const context = req.body;
        if(context){
          const result = await tasksModel.createTask(res, userId, context);
          res.status(200).json(result);
        }else {
          errorMsg.inputEmpty(res);
        }
      }
      catch (error) {
          errorMsg.controllerProblem(res);
          console.error(error);
      }
    },
    deletetask: async (req, res) => {
      try{
        const taskId = Number(req.params.id);
        const userId = req.decodedToken.id;
        if(!isNaN(taskId)){
          const result = await tasksModel.deletetask(res, taskId, userId);
          res.status(200).json(result);
        }
        else {
          errorMsg.inputEmpty(res);
        }
      }
      catch (error) {
          errorMsg.controllerProblem(res);
          console.error(error);
      }
    },
    homeSearch: async (req, res) => {
        try{
          const my_id = req.decodedToken.id;
          console.log(my_id);
          const { location, friend, title, cursor, sex } = req.query;
          // const {redisClient} = req;
          
          const result = await tasksModel.homeSearch(res,cursor ? cursor: null ,location ? location: null,friend ? Number(friend) : null,title ? title:null,sex ? Number(sex) : null,my_id);
          res.status(200).json(result);
        }
        catch (error) {
          errorMsg.controllerProblem(res);
          console.error(error);
        }
    },
    tasksDetail: async (req, res) => {
        try {
          const taskId = Number(req.params.id);
          if (!taskId) return errorMsg.inputEmpty(res);
    
          const result = await tasksModel.tasksDetail(res, taskId);
          return res.status(200).json(result);
        } 
        catch (error) {
          errorMsg.controllerProblem(res);
          console.error(error);
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
      } 
      catch (error) {
        errorMsg.controllerProblem(res);
        console.error(error);
      }
    },
    updateTaskstatus: async (req, res) => {
      try{
        const status = req.params.status;
        const taskId = Number(req.params.id);
        if(!status) return errorMsg.inputEmpty(res);
        if(status !== 'pending' && status !== 'processing' && status !== 'commenting' && status !== 'finished') return errorMsg.wronginput(res);
        const result = await tasksModel.updateTaskstatus(res, status, taskId);
        res.status(200).json(result);
      }
      catch(error){
        errorMsg.controllerProblem(res);
        console.error(error);
      }
    }
}