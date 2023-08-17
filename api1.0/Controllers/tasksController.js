const task = require('../Models/tasksModel');
const errorMsg = require('../utils/error');
module.exports = {
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
    getDetail: async (req, res) => {
        try {
          const taskId = Number(req.params.id);
          if (!taskId) return errorMsg.inputEmpty(res);
    
          const response = await task.tasksDetail(res, taskId);
          res.status(200).json(response);
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
        const result = await task.updateTask(res,requestBody,taskId,my_id);
        res.status(200).json(result);
      } catch (error) {
        console.error(error);
        errorMsg.dbConnection(res);
      }
    }
}