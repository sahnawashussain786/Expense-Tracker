const jwt = require('jsonwebtoken')
const { isMemoryMode, memory } = require('../db')

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token')

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || require('../config').jwtSecret)
    req.user = decoded.user

    // In memory mode, verify token is registered
    if (isMemoryMode && !memory.tokenUsers.has(token)) {
      return res.status(401).json({ msg: 'Token is not valid' })
    }

    next()
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' })
  }
}
