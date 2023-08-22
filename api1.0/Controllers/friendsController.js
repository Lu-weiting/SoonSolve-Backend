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
    getPending: async (req, res, friendshipStatus) => {
        try{
            const receiverId = req.decodedToken.id;
            const result = await friendsModel.getPending(res, friendshipStatus, receiverId);
            res.status(200).json(result);
            
        }
        catch (error) {
            errorMsg.controllerProblem(res);
            console.error(error);
        }
    },
    sendFriendRequest: async (req, res, friendshipStatus) => {
        try{
            const senderId = req.decodedToken.id;
            const receiverId = Number(req.params.user_id);
            if (!isNaN(receiverId)) {
                const result = await friendsModel.friendRequest(res, friendshipStatus, senderId, receiverId);
                
                res.status(200).json(result);
            }else {
                errorMsg.userNotFound(res);
            }
            
        }
        catch (error) {
            errorMsg.controllerProblem(res);
            console.error(error);
        }
    },
    agreeFriendRequest: async (req, res) => {
        try{
            const friendshipId = Number(req.params.friendship_id);
            if (!isNaN(friendshipId)) {
                const result = await friendsModel.agreeFriendRequest(res, friendshipId);
                res.status(200).json(result);
            }else {
                errorMsg.friendshipNotFound(res);
            }
            
        }
        catch (error) {
            errorMsg.controllerProblem(res);
            console.error(error);
        }
    },
    deleteFriendRequest: async (req, res) => {
        try{
            const friendshipId = Number(req.params.friendship_id);
            if (!isNaN(friendshipId)) {
                const result = await friendsModel.deleteFriendRequest(res, friendshipId);
                res.status(200).json(result);
            }else {
                errorMsg.friendshipNotFound(res);
            }
        }
        catch (error) {
            errorMsg.controllerProblem(res);
            console.error(error);
        }
    }
}