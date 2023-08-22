const chatModel = require('../Models/chatModel');
const tool = require('../utils/tool')
const errorMsg = require('../utils/error');


module.exports = {
    getMessage: async (req, res) => {
    try{
        const roomId = Number(req.params.room_id);
        const result = await chatModel.getMessage(res, roomId);
        return res.json(result);
    }
    catch(error){
      errorMsg.controllerProblem(res);
      console.error(error);
    }
  }
}