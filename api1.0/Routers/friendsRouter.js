const express = require('express');
const router = express.Router();
const friendsController = require('../Controllers/friendsController');
const auth = require('../utils/auth');
const tool = require('../utils/tool');

// Friends API
router.get('/', auth.verifyToken, (req, res) => {
    const status = 'friend'; 
    friendsController.getFriends(req, res, status);
});
// Friends Pending API
router.get('/pending', auth.verifyToken, (req, res) => {
    const status = 'pending';
    friendsController.getPending(req, res, status);
});
// Friends Request API
router.post('/:user_id/request', auth.verifyToken, (req, res) => {
    const status = 'requested';
    friendsController.sendFriendRequest(req, res, status);
});

// Friends Agree API
router.post('/:friendship_id/agree', auth.verifyToken, friendsController.agreeFriendRequest);

// Friends Delete API
router.delete('/:friendship_id', auth.verifyToken, friendsController.deleteFriendRequest);


module.exports = router;
