const { connectDB, isMemoryMode, memory, generateId } = require('./db')

// Only seed the in-memory store. When the server has a real MONGO_URI set,
// use seed-mongo.js instead (this file is for in-memory dev mode only).

const CURRENCY = process.env.CURRENCY || 'INR'

const now = new Date()

function daysAgo(n) {
  const d = new Date(now)
  d.setDate(d.getDate() - n)
  d.setHours(12, 0, 0, 0)
  return d
}

async function run() {
  await connectDB()
  if (!isMemoryMode) {
    console.log('ℹ️  Server is connected to MongoDB (not in-memory mode).')
    console.log('   To seed MongoDB directly, run: node seed-mongo.js')
    console.log('   (In-memory seed skipped so it does not sit unused in db.memory.*')
    console.log('    while the API reads from MongoDB.)')
    return
  }

  // In-memory mode: write directly into db.memory, then the controllers will read it.
  const seedUserIds = new Set(['mem_seed_aarav', 'mem_seed_priya', 'mem_seed_rohan'])

  // Clear previous seed runs of these users
  for (const [id, u] of memory.users) {
    if (seedUserIds.has(id)) memory.users.delete(id)
  }
  for (const [id, t] of memory.transactions) {
    if (seedUserIds.has(t.user)) memory.transactions.delete(id)
  }
  for (const [id, b] of memory.budgets) {
    if (seedUserIds.has(b.user)) memory.budgets.delete(id)
  }
  for (const [id, g] of memory.goals) {
    if (seedUserIds.has(g.user)) memory.goals.delete(id)
  }

  const makeUser = (id, data) => ({
    _id: id,
    ...data,
    createdAt: now,
    updatedAt: now,
    toObject: function () { return { ...this } },
    toJSON: function () { const o = this.toObject(); delete o.password; return o }
  })

  const aaravId = 'mem_seed_aarav'
  const priyaId = 'mem_seed_priya'
  const rohanId = 'mem_seed_rohan'

  memory.users.set(aaravId, makeUser(aaravId, {
    name: 'Aarav Kumar',
    email: 'aarav@kmit.edu',
    password: 'SeedPass1',
    phone: '+91-98765-43210',
    monthlyBudget: 25000,
    weeklyBudget: 6000,
    semesterBudget: 45000,
    currency: CURRENCY,
    notificationsEnabled: true,
    autoCategorize: true,
    favoriteCategories: ['Food & Dining', 'Transportation', 'Education'],
    goals: []
  }))

  memory.users.set(priyaId, makeUser(priyaId, {
    name: 'Priya Sharma',
    email: 'priya@stu.ac.in',
    password: 'SeedPass1',
    phone: '+91-87654-32109',
    monthlyBudget: 20000,
    weeklyBudget: 5000,
    semesterBudget: 40000,
    currency: CURRENCY,
    notificationsEnabled: true,
    autoCategorize: true,
    favoriteCategories: ['Shopping', 'Food & Dining', 'Entertainment'],
    goals: []
  }))

  memory.users.set(rohanId, makeUser(rohanId, {
    name: 'Rohan Verma',
    email: 'rohan@college.org',
    password: 'SeedPass1',
    phone: '+91-76543-21098',
    monthlyBudget: 18000,
    weeklyBudget: 4500,
    semesterBudget: 35000,
    currency: CURRENCY,
    notificationsEnabled: true,
    autoCategorize: true,
    favoriteCategories: ['Education', 'Technology', 'Food & Dining'],
    goals: []
  }))

  // ---------- Transactions ----------
  const transactions = [
    // Aarav — expenses (last ~30 days)
    { user: aaravId, description: 'Rameshwaram Diner — breakfast', amount: 280, category: 'Food & Dining', type: 'expense', date: daysAgo(28), paymentMethod: 'Cash', merchant: 'Rameshwaram Cafe', tags: ['breakfast', 'campus'] },
    { user: aaravId, description: 'Metro commute to campus', amount: 60, category: 'Transportation', type: 'expense', date: daysAgo(27), paymentMethod: 'Debit Card', merchant: 'Delhi Metro', tags: ['commute'] },
    { user: aaravId, description: 'Monthly hostel rent', amount: 8000, category: 'Housing', type: 'expense', date: daysAgo(25), paymentMethod: 'Bank Transfer', merchant: 'Hostel Admin', tags: ['rent', 'housing'], isRecurring: true },
    { user: aaravId, description: 'Zomato — lunch delivery', amount: 320, category: 'Food & Dining', type: 'expense', date: daysAgo(24), paymentMethod: 'Credit Card', merchant: 'Zomato', tags: ['lunch'] },
    { user: aaravId, description: 'Stationery — exam pads & pens', amount: 450, category: 'Education', type: 'expense', date: daysAgo(22), paymentMethod: 'Debit Card', merchant: 'Max Stationery', tags: ['exams'] },
    { user: aaravId, description: 'Disney+ Hotstar premium', amount: 299, category: 'Subscriptions', type: 'expense', date: daysAgo(21), paymentMethod: 'Credit Card', merchant: 'Disney+ Hotstar', tags: ['subscriptions'], isRecurring: true },
    { user: aaravId, description: 'Weekly vegetable grocery', amount: 950, category: 'Food & Dining', type: 'expense', date: daysAgo(20), paymentMethod: 'Cash', merchant: 'Local Sabzi Mandi', tags: ['groceries'] },
    { user: aaravId, description: 'Uber AUTO to library', amount: 90, category: 'Transportation', type: 'expense', date: daysAgo(19), paymentMethod: 'Credit Card', merchant: 'Uber', tags: ['commute'] },
    { user: aaravId, description: 'Myntra — winter jacket', amount: 3500, category: 'Shopping', type: 'expense', date: daysAgo(18), paymentMethod: 'Credit Card', merchant: 'Myntra', tags: ['clothing'] },
    { user: aaravId, description: 'Part-time tutoring income', amount: 5000, category: 'Education', type: 'income', date: daysAgo(17), paymentMethod: 'Bank Transfer', merchant: 'Private Tutoring', tags: ['income'] },
    { user: aaravId, description: 'Pharmacy — cold medicine', amount: 220, category: 'Healthcare', type: 'expense', date: daysAgo(16), paymentMethod: 'Cash', merchant: 'Local Pharmacy', tags: ['health'] },
    { user: aaravId, description: 'Campus canteen — chai & snacks', amount: 120, category: 'Food & Dining', type: 'expense', date: daysAgo(15), paymentMethod: 'Cash', merchant: 'Canteen', tags: ['snacks'] },
    { user: aaravId, description: 'Electricity bill (hostel share)', amount: 1200, category: 'Utilities', type: 'expense', date: daysAgo(14), paymentMethod: 'Debit Card', merchant: 'BSES Yamuna', tags: ['utilities'], isRecurring: true },
    { user: aaravId, description: 'Amazon — headphones', amount: 1899, category: 'Shopping', type: 'expense', date: daysAgo(13), paymentMethod: 'Debit Card', merchant: 'Amazon', tags: ['electronics'] },
    { user: aaravId, description: 'Friend’s birthday gift — book', amount: 350, category: 'Gifts', type: 'expense', date: daysAgo(12), paymentMethod: 'Cash', merchant: 'Crossword', tags: ['gift'] },
    { user: aaravId, description: 'Swiggy — dinner', amount: 420, category: 'Food & Dining', type: 'expense', date: daysAgo(11), paymentMethod: 'Credit Card', merchant: 'Swiggy', tags: ['dinner'] },
    { user: aaravId, description: 'Metro monthly pass recharge', amount: 1200, category: 'Transportation', type: 'expense', date: daysAgo(10), paymentMethod: 'Debit Card', merchant: 'Delhi Metro', tags: ['commute', 'recurring'], isRecurring: true },
    { user: aaravId, description: 'Mess dinner (hostel)', amount: 180, category: 'Food & Dining', type: 'expense', date: daysAgo(9), paymentMethod: 'Cash', merchant: 'Hostel Mess', tags: ['dinner', 'hostel'] },
    { user: aaravId, description: 'Tuition fee installment', amount: 12000, category: 'Education', type: 'expense', date: daysAgo(8), paymentMethod: 'Bank Transfer', merchant: 'College Fee Office', tags: ['fees', 'education'] },
    { user: aaravId, description: 'Netflix subscription (shared plan)', amount: 299, category: 'Subscriptions', type: 'expense', date: daysAgo(7), paymentMethod: 'Credit Card', merchant: 'Netflix', tags: ['subscriptions'], isRecurring: true },
    { user: aaravId, description: 'Photocopying & printing notes', amount: 150, category: 'Education', type: 'expense', date: daysAgo(6), paymentMethod: 'Cash', merchant: 'Xerox Shop', tags: ['exams'] },
    { user: aaravId, description: 'Snacks from canteen vending machine', amount: 50, category: 'Food & Dining', type: 'expense', date: daysAgo(5), paymentMethod: 'Cash', merchant: 'Canteen', tags: ['snacks'] },
    { user: aaravId, description: 'Ola AUTO home weekend', amount: 180, category: 'Transportation', type: 'expense', date: daysAgo(4), paymentMethod: 'Credit Card', merchant: 'Ola', tags: ['commute', 'weekend'] },
    { user: aaravId, description: 'Zomato — weekend dinner with friends', amount: 1200, category: 'Food & Dining', type: 'expense', date: daysAgo(3), paymentMethod: 'Credit Card', merchant: 'Zomato', tags: ['dinner', 'friends'] },
    { user: aaravId, description: 'Mobile recharge (Jio)', amount: 399, category: 'Utilities', type: 'expense', date: daysAgo(2), paymentMethod: 'Debit Card', merchant: 'Jio', tags: ['utilities'], isRecurring: true },
    { user: aaravId, description: 'Part-time tutoring income — weekend batch', amount: 3500, category: 'Education', type: 'income', date: daysAgo(1), paymentMethod: 'Bank Transfer', merchant: 'Private Tutoring', tags: ['income'] },

    // Priya — expenses + income
    { user: priyaId, description: 'Starbucks — morning coffee', amount: 250, category: 'Food & Dining', type: 'expense', date: daysAgo(29), paymentMethod: 'Credit Card', merchant: 'Starbucks', tags: ['coffee'] },
    { user: priyaId, description: 'Myntra sale — ethnic wear', amount: 2200, category: 'Shopping', type: 'expense', date: daysAgo(27), paymentMethod: 'Credit Card', merchant: 'Myntra', tags: ['clothing'] },
    { user: priyaId, description: 'Netflix subscription', amount: 299, category: 'Subscriptions', type: 'expense', date: daysAgo(26), paymentMethod: 'Credit Card', merchant: 'Netflix', tags: ['subscriptions'], isRecurring: true },
    { user: priyaId, description: 'Zomato — lunch', amount: 380, category: 'Food & Dining', type: 'expense', date: daysAgo(25), paymentMethod: 'Credit Card', merchant: 'Zomato', tags: ['lunch'] },
    { user: priyaId, description: 'Metro commute', amount: 120, category: 'Transportation', type: 'expense', date: daysAgo(24), paymentMethod: 'Debit Card', merchant: 'Delhi Metro', tags: ['commute'] },
    { user: priyaId, description: 'Amazon — books for elective', amount: 780, category: 'Education', type: 'expense', date: daysAgo(23), paymentMethod: 'Debit Card', merchant: 'Amazon', tags: ['books'] },
    { user: priyaId, description: 'Hostel mess advance', amount: 3000, category: 'Housing', type: 'expense', date: daysAgo(22), paymentMethod: 'Bank Transfer', merchant: 'Hostel Admin', tags: ['rent', 'hostel'], isRecurring: true },
    { user: priyaId, description: 'Swiggy — order for flatmates', amount: 650, category: 'Food & Dining', type: 'expense', date: daysAgo(21), paymentMethod: 'Credit Card', merchant: 'Swiggy', tags: ['dinner', 'flatmates'] },
    { user: priyaId, description: 'Salon — haircut & styling', amount: 550, category: 'Personal Care', type: 'expense', date: daysAgo(20), paymentMethod: 'Cash', merchant: 'Local Salon', tags: ['self-care'] },
    { user: priyaId, description: 'Part-time content writing', amount: 4000, category: 'Other', type: 'income', date: daysAgo(19), paymentMethod: 'Bank Transfer', merchant: 'Freelance Client', tags: ['income', 'freelance'] },
    { user: priyaId, description: 'Daily grocery run', amount: 720, category: 'Food & Dining', type: 'expense', date: daysAgo(18), paymentMethod: 'Cash', merchant: 'Local Kirana', tags: ['groceries'] },
    { user: priyaId, description: 'Popcorn & soda — movie night', amount: 450, category: 'Entertainment', type: 'expense', date: daysAgo(17), paymentMethod: 'Cash', merchant: 'PVR Cinemas', tags: ['movies'] },
    { user: priyaId, description: 'Uber to project meetup', amount: 140, category: 'Transportation', type: 'expense', date: daysAgo(16), paymentMethod: 'Credit Card', merchant: 'Uber', tags: ['commute', 'project'] },
    { user: priyaId, description: 'Repairs — phone screen protector', amount: 350, category: 'Personal Care', type: 'expense', date: daysAgo(15), paymentMethod: 'Debit Card', merchant: 'Mobile Shop', tags: ['phone'] },
    { user: priyaId, description: 'Canteen — evening chai', amount: 90, category: 'Food & Dining', type: 'expense', date: daysAgo(14), paymentMethod: 'Cash', merchant: 'Canteen', tags: ['snacks'] },
    { user: priyaId, description: 'Electricity bill share', amount: 900, category: 'Utilities', type: 'expense', date: daysAgo(13), paymentMethod: 'Debit Card', merchant: 'BSES Yamuna', tags: ['utilities'], isRecurring: true },
    { user: priyaId, description: 'Shein — accessories', amount: 890, category: 'Shopping', type: 'expense', date: daysAgo(12), paymentMethod: 'Credit Card', merchant: 'Shein', tags: ['accessories'] },
    { user: priyaId, description: 'Café — group study coffee', amount: 320, category: 'Food & Dining', type: 'expense', date: daysAgo(11), paymentMethod: 'Credit Card', merchant: 'Starbucks', tags: ['study'] },
    { user: priyaId, description: 'Photocopying notes', amount: 120, category: 'Education', type: 'expense', date: daysAgo(10), paymentMethod: 'Cash', merchant: 'Xerox Shop', tags: ['exams'] },
    { user: priyaId, description: 'Amazon Prime add-on', amount: 149, category: 'Subscriptions', type: 'expense', date: daysAgo(9), paymentMethod: 'Credit Card', merchant: 'Amazon Prime', tags: ['subscriptions'] },
    { user: priyaId, description: 'Metro weekend trip', amount: 200, category: 'Transportation', type: 'expense', date: daysAgo(8), paymentMethod: 'Debit Card', merchant: 'Delhi Metro', tags: ['weekend'] },
    { user: priyaId, description: 'Zomato — birthday treat for friend', amount: 1500, category: 'Food & Dining', type: 'expense', date: daysAgo(7), paymentMethod: 'Credit Card', merchant: 'Zomato', tags: ['birthday', 'dinner'] },
    { user: priyaId, description: 'Groceries weekend', amount: 1100, category: 'Food & Dining', type: 'expense', date: daysAgo(6), paymentMethod: 'Cash', merchant: 'BigBasket', tags: ['groceries'] },
    { user: priyaId, description: 'Phone recharge (Airtel)', amount: 359, category: 'Utilities', type: 'expense', date: daysAgo(5), paymentMethod: 'Debit Card', merchant: 'Airtel', tags: ['utilities'], isRecurring: true },
    { user: priyaId, description: 'Freelance payout — editorial', amount: 3000, category: 'Other', type: 'income', date: daysAgo(4), paymentMethod: 'Bank Transfer', merchant: 'Editorial Client', tags: ['income', 'freelance'] },
    { user: priyaId, description: 'Vending machine snack', amount: 40, category: 'Food & Dining', type: 'expense', date: daysAgo(3), paymentMethod: 'Cash', merchant: 'Canteen', tags: ['snacks'] },
    { user: priyaId, description: 'Ola auto — late night return', amount: 160, category: 'Transportation', type: 'expense', date: daysAgo(2), paymentMethod: 'Credit Card', merchant: 'Ola', tags: ['commute', 'night'] },
    { user: priyaId, description: 'Dinner at Italian place', amount: 1800, category: 'Food & Dining', type: 'expense', date: daysAgo(1), paymentMethod: 'Credit Card', merchant: 'Pizza Hut', tags: ['dinner', 'friends'] },

    // Rohan — more education/tech heavy
    { user: rohanId, description: 'Canteen — breakfast toast', amount: 90, category: 'Food & Dining', type: 'expense', date: daysAgo(30), paymentMethod: 'Cash', merchant: 'Canteen', tags: ['breakfast'] },
    { user: rohanId, description: 'Delhi Metro — daily pass', amount: 600, category: 'Transportation', type: 'expense', date: daysAgo(29), paymentMethod: 'Debit Card', merchant: 'Delhi Metro', tags: ['commute'], isRecurring: true },
    { user: rohanId, description: 'Udemy course — Python advanced', amount: 699, category: 'Education', type: 'expense', date: daysAgo(28), paymentMethod: 'Credit Card', merchant: 'Udemy', tags: ['courses', 'tech'] },
    { user: rohanId, description: 'Zomato — lunch delivery', amount: 280, category: 'Food & Dining', type: 'expense', date: daysAgo(27), paymentMethod: 'Credit Card', merchant: 'Zomato', tags: ['lunch'] },
    { user: rohanId, description: 'Amazon — external SSD 1TB', amount: 3999, category: 'Shopping', type: 'expense', date: daysAgo(26), paymentMethod: 'Debit Card', merchant: 'Amazon', tags: ['electronics', 'storage'] },
    { user: rohanId, description: 'Hostel mess — monthly advance', amount: 2500, category: 'Housing', type: 'expense', date: daysAgo(25), paymentMethod: 'Bank Transfer', merchant: 'Hostel Admin', tags: ['hostel', 'mess'], isRecurring: true },
    { user: rohanId, description: 'Netflix shared plan', amount: 299, category: 'Subscriptions', type: 'expense', date: daysAgo(24), paymentMethod: 'Credit Card', merchant: 'Netflix', tags: ['subscriptions'], isRecurring: true },
    { user: rohanId, description: 'Graphics textbook', amount: 1200, category: 'Education', type: 'expense', date: daysAgo(23), paymentMethod: 'Debit Card', merchant: 'Amazon', tags: ['books', 'graphics'] },
    { user: rohanId, description: 'Phone recharge (Vi)', amount: 359, category: 'Utilities', type: 'expense', date: daysAgo(22), paymentMethod: 'Debit Card', merchant: 'Vi', tags: ['utilities'], isRecurring: true },
    { user: rohanId, description: 'Swiggy — late-night coding snack', amount: 220, category: 'Food & Dining', type: 'expense', date: daysAgo(21), paymentMethod: 'Credit Card', merchant: 'Swiggy', tags: ['snacks', 'coding'] },
    { user: rohanId, description: 'Gaming — in-game purchase (Riot points)', amount: 999, category: 'Entertainment', type: 'expense', date: daysAgo(20), paymentMethod: 'Debit Card', merchant: 'Riot Games', tags: ['gaming'] },
    { user: rohanId, description: 'Canteen — chai x2', amount: 100, category: 'Food & Dining', type: 'expense', date: daysAgo(19), paymentMethod: 'Cash', merchant: 'Canteen', tags: ['snacks'] },
    { user: rohanId, description: 'Electricity bill share', amount: 800, category: 'Utilities', type: 'expense', date: daysAgo(18), paymentMethod: 'Debit Card', merchant: 'BSES Yamuna', tags: ['utilities'], isRecurring: true },
    { user: rohanId, description: 'Ola AUTO to lab', amount: 70, category: 'Transportation', type: 'expense', date: daysAgo(17), paymentMethod: 'Credit Card', merchant: 'Ola', tags: ['commute', 'lab'] },
    { user: rohanId, description: 'Canteen dinner', amount: 160, category: 'Food & Dining', type: 'expense', date: daysAgo(16), paymentMethod: 'Cash', merchant: 'Canteen', tags: ['dinner', 'hostel'] },
    { user: rohanId, description: 'Coding competition entry fee', amount: 500, category: 'Education', type: 'expense', date: daysAgo(15), paymentMethod: 'Debit Card', merchant: 'Tech Contest', tags: ['competition', 'tech'] },
    { user: rohanId, description: 'Groceries — milk, eggs, bread', amount: 450, category: 'Food & Dining', type: 'expense', date: daysAgo(14), paymentMethod: 'Cash', merchant: 'Local Kirana', tags: ['groceries'] },
    { user: rohanId, description: 'Amazon — mechanical keyboard', amount: 2499, category: 'Shopping', type: 'expense', date: daysAgo(13), paymentMethod: 'Debit Card', merchant: 'Amazon', tags: ['electronics', 'keyboard'] },
    { user: rohanId, description: 'Spotify premium', amount: 119, category: 'Subscriptions', type: 'expense', date: daysAgo(12), paymentMethod: 'Credit Card', merchant: 'Spotify', tags: ['subscriptions', 'music'], isRecurring: true },
    { user: rohanId, description: 'Metro weekend outing', amount: 100, category: 'Transportation', type: 'expense', date: daysAgo(11), paymentMethod: 'Debit Card', merchant: 'Delhi Metro', tags: ['weekend'] },
    { user: rohanId, description: 'Zomato — biryani night', amount: 550, category: 'Food & Dining', type: 'expense', date: daysAgo(10), paymentMethod: 'Credit Card', merchant: 'Zomato', tags: ['dinner'] },
    { user: rohanId, description: 'Printer ink cartridge', amount: 650, category: 'Education', type: 'expense', date: daysAgo(9), paymentMethod: 'Debit Card', merchant: 'Stationery Shop', tags: ['printing'] },
    { user: rohanId, description: 'Snacks vending machine', amount: 45, category: 'Food & Dining', type: 'expense', date: daysAgo(8), paymentMethod: 'Cash', merchant: 'Canteen', tags: ['snacks'] },
    { user: rohanId, description: 'Ola — trip to coaching center', amount: 150, category: 'Transportation', type: 'expense', date: daysAgo(7), paymentMethod: 'Credit Card', merchant: 'Ola', tags: ['commute', 'coaching'] },
    { user: rohanId, description: 'Dinner with classmates', amount: 900, category: 'Food & Dining', type: 'expense', date: daysAgo(6), paymentMethod: 'Credit Card', merchant: 'Dominos', tags: ['dinner', 'friends'] },
    { user: rohanId, description: 'Mobile data top-up', amount: 199, category: 'Utilities', type: 'expense', date: daysAgo(5), paymentMethod: 'Debit Card', merchant: 'Jio', tags: ['utilities'], isRecurring: true },
    { user: rohanId, description: 'Canteen — breakfast', amount: 80, category: 'Food & Dining', type: 'expense', date: daysAgo(4), paymentMethod: 'Cash', merchant: 'Canteen', tags: ['breakfast'] },
    { user: rohanId, description: 'Metro to library', amount: 60, category: 'Transportation', type: 'expense', date: daysAgo(3), paymentMethod: 'Debit Card', merchant: 'Delhi Metro', tags: ['commute', 'library'] },
    { user: rohanId, description: 'Zomato — lunch with project team', amount: 780, category: 'Food & Dining', type: 'expense', date: daysAgo(2), paymentMethod: 'Credit Card', merchant: 'Zomato', tags: ['lunch', 'project'] },
    { user: rohanId, description: 'Udemy sale — React course', amount: 499, category: 'Education', type: 'expense', date: daysAgo(1), paymentMethod: 'Credit Card', merchant: 'Udemy', tags: ['courses', 'tech'] },
  ]

  for (const t of transactions) {
    const id = generateId()
    const created = new Date(t.date)
    memory.transactions.set(id, {
      _id: id,
      user: t.user,
      description: t.description,
      amount: t.amount,
      category: t.category,
      type: t.type,
      date: created,
      paymentMethod: t.paymentMethod,
      note: '',
      tags: t.tags || [],
      isRecurring: t.isRecurring || false,
      merchant: t.merchant || '',
      createdAt: created,
      updatedAt: created,
      toObject: function () { return { ...this } }
    })
    memory.counters.transactions++
  }

  // ---------- Budgets ----------
  const budgets = [
    // Aarav
    { user: aaravId, name: 'Monthly Food', amount: 6000, period: 'monthly', category: 'Food & Dining', color: '#10B981', alertThreshold: 80 },
    { user: aaravId, name: 'Monthly Transport', amount: 1500, period: 'monthly', category: 'Transportation', color: '#3B82F6', alertThreshold: 80 },
    { user: aaravId, name: 'Monthly Shopping', amount: 4000, period: 'monthly', category: 'Shopping', color: '#14B8A6', alertThreshold: 75 },
    { user: aaravId, name: 'Weekly Hostel', amount: 1500, period: 'weekly', category: 'Housing', color: '#8B5CF6', alertThreshold: 90 },
    { user: aaravId, name: 'Semester Education', amount: 20000, period: 'semester', category: 'Education', color: '#6366F1', alertThreshold: 70 },
    { user: aaravId, name: 'Monthly Entertainment', amount: 1000, period: 'monthly', category: 'Entertainment', color: '#EC4899', alertThreshold: 80 },
    // Priya
    { user: priyaId, name: 'Monthly Food & Dining', amount: 5000, period: 'monthly', category: 'Food & Dining', color: '#10B981', alertThreshold: 80 },
    { user: priyaId, name: 'Monthly Shopping', amount: 3000, period: 'monthly', category: 'Shopping', color: '#14B8A6', alertThreshold: 75 },
    { user: priyaId, name: 'Weekly Fun', amount: 1500, period: 'weekly', category: 'Entertainment', color: '#EC4899', alertThreshold: 85 },
    { user: priyaId, name: 'Semester Study', amount: 5000, period: 'semester', category: 'Education', color: '#6366F1', alertThreshold: 70 },
    // Rohan
    { user: rohanId, name: 'Monthly Food', amount: 4500, period: 'monthly', category: 'Food & Dining', color: '#10B981', alertThreshold: 80 },
    { user: rohanId, name: 'Monthly Transport', amount: 1200, period: 'monthly', category: 'Transportation', color: '#3B82F6', alertThreshold: 80 },
    { user: rohanId, name: 'Monthly Tech & Shopping', amount: 5000, period: 'monthly', category: 'Shopping', color: '#14B8A6', alertThreshold: 75 },
    { user: rohanId, name: 'Semester Education', amount: 18000, period: 'semester', category: 'Education', color: '#6366F1', alertThreshold: 70 },
    { user: rohanId, name: 'Monthly Entertainment', amount: 1500, period: 'monthly', category: 'Entertainment', color: '#EC4899', alertThreshold: 80 },
  ]

  for (const b of budgets) {
    const id = generateId()
    const created = new Date()
    memory.budgets.set(id, {
      _id: id,
      user: b.user,
      name: b.name,
      amount: b.amount,
      period: b.period,
      category: b.category,
      startDate: created,
      endDate: null,
      alertThreshold: b.alertThreshold,
      color: b.color,
      notes: '',
      isActive: true,
      createdAt: created,
      updatedAt: created,
    })
    memory.counters.budgets++
  }

  // ---------- Goals ----------
  const goals = [
    { user: aaravId, name: 'Laptop Upgrade Fund', targetAmount: 50000, currentAmount: 18000, deadline: new Date(now.getFullYear() + 1, 0, 1), category: 'Shopping', color: '#3B82F6' },
    { user: aaravId, name: 'Semester Trip to Goa', targetAmount: 12000, currentAmount: 3200, deadline: new Date(now.getFullYear(), now.getMonth() + 3, 15), category: 'Travel', color: '#8B5CF6' },
    { user: aaravId, name: 'Emergency Buffer', targetAmount: 10000, currentAmount: 4500, deadline: null, category: 'Other', color: '#10B981' },
    { user: priyaId, name: 'Winter Jacket Collection', targetAmount: 8000, currentAmount: 2500, deadline: new Date(now.getFullYear(), now.getMonth() + 2, 1), category: 'Shopping', color: '#EC4899' },
    { user: priyaId, name: 'Study Abroad Application Fund', targetAmount: 25000, currentAmount: 7000, deadline: new Date(now.getFullYear() + 1, 6, 1), category: 'Education', color: '#6366F1' },
    { user: priyaId, name: 'Fest Costume & Prep', targetAmount: 3000, currentAmount: 900, deadline: new Date(now.getFullYear(), now.getMonth() + 1, 20), category: 'Entertainment', color: '#F43F5E' },
    { user: rohanId, name: 'Mechanical Keyboard Fund', targetAmount: 15000, currentAmount: 4200, deadline: new Date(now.getFullYear(), now.getMonth() + 4, 1), category: 'Shopping', color: '#14B8A6' },
    { user: rohanId, name: 'Coding Bootcamp Savings', targetAmount: 30000, currentAmount: 8000, deadline: new Date(now.getFullYear() + 1, 3, 1), category: 'Education', color: '#6366F1' },
    { user: rohanId, name: 'Weekend Outing Buffer', targetAmount: 2000, currentAmount: 600, deadline: null, category: 'Entertainment', color: '#F59E0B' },
  ]

  for (const g of goals) {
    const id = generateId()
    memory.goals.set(id, {
      _id: id,
      user: g.user,
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      deadline: g.deadline,
      category: g.category,
      color: g.color,
      createdAt: now,
    })
    memory.counters.goals++
    // also attach into user.goals for the /auth/me response shape used by controllers
    const user = memory.users.get(g.user)
    if (user) {
      user.goals.push({
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        deadline: g.deadline,
        category: g.category,
        color: g.color,
        createdAt: now,
      })
    }
  }

  const counts = {
    users: [...memory.users.values()].filter(u => seedUserIds.has(u._id)).length,
    transactions: [...memory.transactions.values()].filter(t => seedUserIds.has(t.user)).length,
    budgets: [...memory.budgets.values()].filter(b => seedUserIds.has(b.user)).length,
    goals: [...memory.goals.values()].filter(g => seedUserIds.has(g.user)).length,
  }

  console.log('🌱 In-memory seed complete')
  console.log(`  Users:        ${counts.users}  (aarav@kmit.edu, priya@stu.ac.in, rohan@college.org)`)
  console.log(`  Transactions: ${counts.transactions}  (INR-denominated, last ~30 days)`)
  console.log(`  Budgets:      ${counts.budgets}`)
  console.log(`  Goals:        ${counts.goals}`)
  console.log(`  Currency:     ${CURRENCY}`)
  console.log('')
  console.log('Login credentials for seed users (use these emails to call /api/auth/login):')
  console.log('  aarav@kmit.edu  /  SeedPass1')
  console.log('  priya@stu.ac.in  /  SeedPass1')
  console.log('  rohan@college.org  /  SeedPass1')
}

run().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
