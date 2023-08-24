const express = require('express');
const router = express.Router();
const mapController = require('../Controllers/mapController');
const auth = require('../utils/auth');
const tool = require('../utils/tool');

router.get('/', auth.verifyToken, mapController.getRegion);

module.exports = router;