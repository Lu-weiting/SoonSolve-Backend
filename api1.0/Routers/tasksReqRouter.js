const express = require('express');
const router = express.Router();
const tasksReqController = require('../Controllers/tasksReqController');
const auth = require('../utils/auth');

// User get search tasks API
router.get('/',auth.verifyToken,tasksReqController.getTaskReqList);

// User get search tasks API
router.put('/update/:status',auth.verifyToken,tasksReqController.updateTaskReq);

module.exports = router;