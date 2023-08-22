const express = require('express');
const router = express.Router();
const eventsController = require('../Controllers/eventsController');
const auth = require('../utils/auth');


router.get('/', auth.verifyToken, );



module.exports = router;
