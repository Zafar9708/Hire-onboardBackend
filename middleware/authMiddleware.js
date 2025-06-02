
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; 
      console.log("Token received on server:", token); 

      const decoded = jwt.verify(token, process.env.JWT_SECRET); 

      req.user = await User.findById(decoded.id).select('-password');
      console.log("User found:", req.user);  
      next();
    } catch (err) {
      console.error("Error verifying token:", err);
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};

module.exports = { protect };
