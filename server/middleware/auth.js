const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const { isMemoryMode, memory } = require('../db')

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token')

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || require('../config').jwtSecret)
    req.user = decoded.user

    // Normalize req.user.id to a real ObjectId when connected to MongoDB.
    // This is required so Mongoose aggregates ($match: { user: req.user.id })
    // match the ObjectId-stored values; find()/deleteMany() coerce strings but
    // aggregates do not. In in-memory mode the store is string-keyed, so leave
    // the id as-is there (Map.get uses strict identity).
    if (!isMemoryMode && req.user && typeof req.user.id === 'string') {
      try {
        req.user.id = new mongoose.Types.ObjectId(req.user.id)
      } catch {
        // leave as string if it isn't a valid ObjectId
      }
    }

    // In memory mode, verify token is registered
    if (isMemoryMode && !memory.tokenUsers.has(token)) {
      return res.status(401).json({ msg: 'Token is not valid' })
    }

    next()
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' })
  }
}
