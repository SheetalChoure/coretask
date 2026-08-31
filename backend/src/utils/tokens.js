const jwt = require("jsonwebtoken");
const config = require("../config/env");

function signToken(payload) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

function verifyToken(token) {
  // Throws JsonWebTokenError / TokenExpiredError on failure — caller handles it.
  return jwt.verify(token, config.jwt.secret);
}

module.exports = { signToken, verifyToken };
