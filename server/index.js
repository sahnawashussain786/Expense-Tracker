const express = require('express')
const cors = require('cors')
const connectDB = require('./db')
const config = require('./config')

// Start DB connection first. Routes must be mounted after in-memory overrides
// are in place, otherwise Mongoose model methods won't be replaced and every
// controller will 500 in dev mode when MONGO_URI is unset.
connectDB().then(() => {
  const app = express()

  // Middleware
  app.use(cors())
  app.use(express.json({ extended: false }))

  // Routes
  app.use('/api/auth', require('./routes/auth'))
  app.use('/api/transactions', require('./routes/transactions'))
  app.use('/api/budgets', require('./routes/budgets'))
  app.use('/api/goals', require('./routes/goals'))
  app.use('/api/categories', require('./routes/categories'))

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack)
    res.status(500).json({ msg: 'Server Error', error: process.env.NODE_ENV === 'production' ? {} : err.message })
  })

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ msg: 'Endpoint not found' })
  })

  const PORT = config.port
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Health check: http://localhost:${PORT}/api/health`)
  })

  module.exports = app
}).catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
