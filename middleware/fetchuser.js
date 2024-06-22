const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './backend/.env' });
const secretKey = process.env.JWT_SECRET;

const fetchuser =  (req, res, next) => {
  let success = false;
  const token = req.header('auth-token');

  if (!token) {
    return res.status(401).json({ success, error: 'No token found!' });
  }

  try {
    const data = jwt.verify(token, secretKey);
    req.user = data.user;
    success = true;
    
    next();
  } catch (error) {
    return res.status(400).json({ success, error: 'Interval server error occured' });
  }
}

module.exports = fetchuser;