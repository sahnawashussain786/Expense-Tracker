const express = require('express')
const router = express.Router()
const {
  createBudget,
  getBudgets,
  getBudget,
  updateBudget,
  deleteBudget,
  getBudgetHistory
} = require('../controllers/budget')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', getBudgets)
router.get('/:id', getBudget)
router.get('/:id/history', getBudgetHistory)
router.post('/', createBudget)
router.put('/:id', updateBudget)
router.delete('/:id', deleteBudget)

module.exports = router
