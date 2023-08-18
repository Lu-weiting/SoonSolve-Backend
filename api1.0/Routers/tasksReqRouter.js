const express = require('express');
const router = express.Router();
const tasksReqController = require('../Controllers/tasksReqController');
const auth = require('../utils/auth');

// User get search tasks API
router.get('/',auth.verifyToken,tasksReqController.getTaskReqList);


module.exports = router;