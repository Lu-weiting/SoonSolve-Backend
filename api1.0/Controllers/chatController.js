const chatModel = require('../Models/chatModel');
const tool = require('../utils/tool')
const errorMsg = require('../utils/error');


module.exports = {
    getMessage: async (req, res) => {
    try{
        const roomId = Number(req.params.room_id);
        const roomMsg = await chatModel.getMessage(res, roomId);
        
      const response = {
        "data": {
          "events": notification_result
        }
      };
      return res.json(response);
    }
    catch(error){
      errorMsg.controllerProblem(res);
      console.error(error);
    }
  }
}