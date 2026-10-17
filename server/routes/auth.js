const express = require('express')
const router = express.Router()
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  deleteAccount,
  updateFavorites
} = require('../controllers/auth')
const auth = require('../middleware/auth')

router.post('/register', register)
router.post('/login', login)
router.get('/me', auth, getMe)
router.put('/profile', auth, updateProfile)
router.put('/password', auth, updatePassword)
router.delete('/account', auth, deleteAccount)
router.put('/favorites', auth, updateFavorites)

module.exports = router
