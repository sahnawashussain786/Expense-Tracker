module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'college-expense-tracker-secret-key-2024',
  jwtExpiresIn: '7d',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/college-expense-tracker'
}
