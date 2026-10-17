const express = require('express')
const router = express.Router()
const {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  bulkImport,
  getSummary,
  getBudgetAlerts
} = require('../controllers/transaction')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/summary', getSummary)
router.get('/alerts', getBudgetAlerts)
router.get('/', getTransactions)
router.get('/:id', getTransaction)
router.post('/', createTransaction)
router.post('/bulk', bulkImport)
router.put('/:id', updateTransaction)
router.delete('/:id', deleteTransaction)

module.exports = router
