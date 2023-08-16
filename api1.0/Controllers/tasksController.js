const task = require('../Models/tasksModel');
const errorMsg = require('../utils/error');
module.exports = {
    homeSearch: async (req, res) => {
        try{
            const {userId}=req.decodedToken;
            const { location,friend,title, cursor } = req.query;
            // const {redisClient} = req;
            
            const result = await task.homeSearch(res,cursor ? cursor: null ,location ? location: null,friend ? Number(friend) : null,title ? title:null,userId);
            res.status(200).json({
                ...result
            });
        }catch (error) {
            errorMsg.dbConnection(res);
        }
    },
    getDetail: async (req, res) => {
        try {
          const taskId = Number(req.params.id);
          if (!taskId) return error_message.input(res);
    
          const response = await tasksModel.tasksDetail(taskId);
          return res.status(200).json(response);
        } catch (error) {
          console.error(error);
          errorMsg.dbConnection(res);
        }
      }
}