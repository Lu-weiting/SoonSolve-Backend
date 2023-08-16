const jwt = require('jsonwebtoken');
const errorMsg = require('../utils/error');
//import dotenv from 'dotenv'
const dotenv = require('dotenv');
dotenv.config()

// Generate JWT token
exports.generateJWTToken= (userId) => {
    const secretKey = process.env.SECRET; // Replace with your secret key
    console.log(secretKey);
    const payload = { id: userId };
    //console.log(payload);
    const token = jwt.sign(payload, secretKey, { expiresIn: '8h' }); // Expires in 8 hour
    return token;
}

// Middleware for verifying JWT token
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  try {
    if (!token) {
      return errorMsg.noToken(res);
    }
    const pureToken = token.split(' ')[1];
    const decodedToken = jwt.verify(pureToken, process.env.SECRET);
    req.decodedToken = decodedToken;
    next();
  } catch (error) {
    console.error(error);
    return errorMsg.wrongToken(res);
  }
};

