const express = require('express');
const router = express.Router();
const tasksController = require('../Controllers/tasksController');
const auth = require('../utils/auth');
router.get('/search',auth.verifyToken,tasksController.homeSearch);

module.exports = router;