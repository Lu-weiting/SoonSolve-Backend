const express = require('express');
const router = express.Router();
const chatController = require('../Controllers/chatController');
const auth = require('../utils/auth');

router.get('/:room_id', auth.verifyToken, chatController.getMessage);
router.delete('/:room_id', auth.verifyToken, chatController.deleteMessage);

module.exports = router;