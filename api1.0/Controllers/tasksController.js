const task = require('../Models/tasksModel');
const errorMsg = require('../utils/error');
module.exports = {
    search: async (req, res) => {
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
    }
}