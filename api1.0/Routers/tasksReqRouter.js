const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const tasksReqController = require('../Controllers/tasksReqController');
router.post('/:task_id/request', auth.verifyToken, tasksReqController.sendRequest);
// 
router.delete('/:user_task_id', auth.verifyToken, tasksReqController.deleteRequest);

// User get search tasks API
router.get('/',auth.verifyToken,tasksReqController.getTaskReqList);

// User get search tasks API
router.put('/update/:status/:user_task_id',auth.verifyToken,tasksReqController.updateTaskReq);



module.exports = router;