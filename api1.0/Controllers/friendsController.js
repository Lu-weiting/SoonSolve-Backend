const friendsModel = require('../Models/friendsModel');
const auth = require('../utils/auth')
const tool = require('../utils/tool')
const crypto = require('crypto'); // 引入 crypto 套件，用於加密處理
const errorMsg = require('../utils/error');


module.exports = {
    getFriends: async (req, res, friendshipStatus) => {
        try{
            const userId = req.decodedToken.id;
            const result = await friendsModel.getFriends(res, friendshipStatus, userId);
            res.status(200).json(result);
            
        }
        catch (error) {
            errorMsg.controllerProblem(res);
            console.error(error);
        }
      },
}