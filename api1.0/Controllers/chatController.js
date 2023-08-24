const chatModel = require('../Models/chatModel');
const tool = require('../utils/tool')
const errorMsg = require('../utils/error');


module.exports = {
  getMessage: async (req, res) => {
    try{
        const roomId = req.params.room_id;
        console.log(roomId+"!!");
        const result = await chatModel.getMessage(res, roomId);
        return res.json(result);
    }
    catch(error){
      errorMsg.controllerProblem(res);
      console.error(error);
    }
  },
  deleteMessage: async (req, res) => {
    try{
      const roomId = Number(req.params.room_id);
      const response = await chatModel.deleteMessage(res, roomId);
      return res.json(response);
    }
    catch(error){
      errorMsg.controllerProblem(res);
      console.error(error);
    }
  }
}