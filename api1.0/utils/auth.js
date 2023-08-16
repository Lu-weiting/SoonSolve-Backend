const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const errorMsg = require('../utils/error')

dotenv.config();

// Generate JWT token
exports.generateJWTToken= (userId) => {
    const secretKey = process.env.SECRET; // Replace with your secret key
    const payload = { id: userId };
    //console.log(payload);
    const token = jwt.sign(payload, secretKey, { expiresIn: '8h' }); // Expires in 8 hour
    return token;
}

// Middleware for verifying JWT token
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return errorMsg.noToken(res);
  }

  try {
    const pureToken = token.split(' ')[1];
    const decodedToken = jwt.verify(pureToken, process.env.SECRET);
    req.decodedToken = decodedToken;
    //console.log(decodedToken);
    next();
  } catch (error) {
    console.error(error);
    return errorMsg.wrongToken(res);
  }
};

