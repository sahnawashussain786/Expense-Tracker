const { memory } = require('./db')

const seedUserIds = new Set(['mem_seed_aarav', 'mem_seed_priya', 'mem_seed_rohan'])

const users = [...memory.users.values()].filter(u => seedUserIds.has(u._id))
const transactions = [...memory.transactions.values()].filter(t => seedUserIds.has(t.user))
const budgets = [...memory.budgets.values()].filter(b => seedUserIds.has(b.user))
const goals = [...memory.goals.values()].filter(g => seedUserIds.has(g.user))

console.log('🌱 In-memory seed verification')
console.log(`  Users:        ${users.length}  (${users.map(u => u.email).join(', ')})`)
console.log(`  Transactions: ${transactions.length}  (INR-denominated)`)
console.log(`  Budgets:      ${budgets.length}`)
console.log(`  Goals:        ${goals.length}`)

// Show currency and a couple sample transactions
console.log('')
console.log('Sample transactions:')
transactions.slice(0, 3).forEach((t, i) => {
  console.log(`  [${i + 1}] ${t.description} — Rs.${t.amount} (${t.category}, ${t.type})`)
})
console.log('')
console.log('Sample budgets:')
budgets.slice(0, 3).forEach((b, i) => {
  console.log(`  [${i + 1}] ${b.name} — Rs.${b.amount}/${b.period}${b.category ? ' (' + b.category + ')' : ''}`)
})
console.log('')
console.log('Sample goals:')
goals.slice(0, 3).forEach((g, i) => {
  console.log(`  [${i + 1}] ${g.name} — Rs.${g.currentAmount}/${g.targetAmount} (${g.category})`)
})

// Sanity: currency consistency
const currencies = new Set(users.map(u => u.currency))
console.log('')
console.log(`Currency on seed users: ${[...currencies].join(', ') || 'none'}`)
