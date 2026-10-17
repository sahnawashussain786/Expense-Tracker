const { connectDB, isMemoryMode } = require('./db')

const CURRENCY = process.env.CURRENCY || 'INR'

const now = new Date()

function daysAgo(n) {
  const d = new Date(now)
  d.setDate(d.getDate() - n)
  d.setHours(12, 0, 0, 0)
  return d
}

const SEED_EMAILS = ['aarav@kmit.edu', 'priya@stu.ac.in', 'rohan@college.org']
const SEED_PASS = 'SeedPass1'

const USER_DATA = [
  {
    name: 'Aarav Kumar',
    email: 'aarav@kmit.edu',
    phone: '+91-98765-43210',
    monthlyBudget: 25000,
    weeklyBudget: 6000,
    semesterBudget: 45000,
    currency: CURRENCY,
    notificationsEnabled: true,
    autoCategorize: true,
    favoriteCategories: ['Food & Dining', 'Transportation', 'Education'],
  },
  {
    name: 'Priya Sharma',
    email: 'priya@stu.ac.in',
    phone: '+91-87654-32109',
    monthlyBudget: 20000,
    weeklyBudget: 5000,
    semesterBudget: 40000,
    currency: CURRENCY,
    notificationsEnabled: true,
    autoCategorize: true,
    favoriteCategories: ['Shopping', 'Food & Dining', 'Entertainment'],
  },
  {
    name: 'Rohan Verma',
    email: 'rohan@college.org',
    phone: '+91-76543-21098',
    monthlyBudget: 18000,
    weeklyBudget: 4500,
    semesterBudget: 35000,
    currency: CURRENCY,
    notificationsEnabled: true,
    autoCategorize: true,
    favoriteCategories: ['Education', 'Technology', 'Food & Dining'],
  },
]

const TRANSACTIONS = [
  // Aarav
  { email: 'aarav@kmit.edu', description: 'Rameshwaram Diner — breakfast', amount: 280, category: 'Food & Dining', type: 'expense', date: daysAgo(28), paymentMethod: 'Cash', merchant: 'Rameshwaram Cafe', tags: ['breakfast', 'campus'] },
  { email: 'aarav@kmit.edu', description: 'Metro commute to campus', amount: 60, category: 'Transportation', type: 'expense', date: daysAgo(27), paymentMethod: 'Debit Card', merchant: 'Delhi Metro', tags: ['commute'] },
  { email: 'aarav@kmit.edu', description: 'Monthly hostel rent', amount: 8000, category: 'Housing', type: 'expense', date: daysAgo(25), paymentMethod: 'Bank Transfer', merchant: 'Hostel Admin', tags: ['rent', 'housing'], isRecurring: true },
  { email: 'aarav@kmit.edu', description: 'Zomato — lunch delivery', amount: 320, category: 'Food & Dining', type: 'expense', date: daysAgo(24), paymentMethod: 'Credit Card', merchant: 'Zomato', tags: ['lunch'] },
  { email: 'aarav@kmit.edu', description: 'Stationery — exam pads & pens', amount: 450, category: 'Education', type: 'expense', date: daysAgo(22), paymentMethod: 'Debit Card', merchant: 'Max Stationery', tags: ['exams'] },
  { email: 'aarav@kmit.edu', description: 'Disney+ Hotstar premium', amount: 299, category: 'Subscriptions', type: 'expense', date: daysAgo(21), paymentMethod: 'Credit Card', merchant: 'Disney+ Hotstar', tags: ['subscriptions'], isRecurring: true },
  { email: 'aarav@kmit.edu', description: 'Weekly vegetable grocery', amount: 950, category: 'Food & Dining', type: 'expense', date: daysAgo(20), paymentMethod: 'Cash', merchant: 'Local Sabzi Mandi', tags: ['groceries'] },
  { email: 'aarav@kmit.edu', description: 'Uber AUTO to library', amount: 90, category: 'Transportation', type: 'expense', date: daysAgo(19), paymentMethod: 'Credit Card', merchant: 'Uber', tags: ['commute'] },
  { email: 'aarav@kmit.edu', description: 'Myntra — winter jacket', amount: 3500, category: 'Shopping', type: 'expense', date: daysAgo(18), paymentMethod: 'Credit Card', merchant: 'Myntra', tags: ['clothing'] },
  { email: 'aarav@kmit.edu', description: 'Part-time tutoring income', amount: 5000, category: 'Education', type: 'income', date: daysAgo(17), paymentMethod: 'Bank Transfer', merchant: 'Private Tutoring', tags: ['income'] },
  { email: 'aarav@kmit.edu', description: 'Pharmacy — cold medicine', amount: 220, category: 'Healthcare', type: 'expense', date: daysAgo(16), paymentMethod: 'Cash', merchant: 'Local Pharmacy', tags: ['health'] },
  { email: 'aarav@kmit.edu', description: 'Campus canteen — chai & snacks', amount: 120, category: 'Food & Dining', type: 'expense', date: daysAgo(15), paymentMethod: 'Cash', merchant: 'Canteen', tags: ['snacks'] },
  { email: 'aarav@kmit.edu', description: 'Electricity bill (hostel share)', amount: 1200, category: 'Utilities', type: 'expense', date: daysAgo(14), paymentMethod: 'Debit Card', merchant: 'BSES Yamuna', tags: ['utilities'], isRecurring: true },
  { email: 'aarav@kmit.edu', description: 'Amazon — headphones', amount: 1899, category: 'Shopping', type: 'expense', date: daysAgo(13), paymentMethod: 'Debit Card', merchant: 'Amazon', tags: ['electronics'] },
  { email: 'aarav@kmit.edu', description: 'Friend’s birthday gift — book', amount: 350, category: 'Gifts', type: 'expense', date: daysAgo(12), paymentMethod: 'Cash', merchant: 'Crossword', tags: ['gift'] },
  { email: 'aarav@kmit.edu', description: 'Swiggy — dinner', amount: 420, category: 'Food & Dining', type: 'expense', date: daysAgo(11), paymentMethod: 'Credit Card', merchant: 'Swiggy', tags: ['dinner'] },
  { email: 'aarav@kmit.edu', description: 'Metro monthly pass recharge', amount: 1200, category: 'Transportation', type: 'expense', date: daysAgo(10), paymentMethod: 'Debit Card', merchant: 'Delhi Metro', tags: ['commute', 'recurring'], isRecurring: true },
  { email: 'aarav@kmit.edu', description: 'Mess dinner (hostel)', amount: 180, category: 'Food & Dining', type: 'expense', date: daysAgo(9), paymentMethod: 'Cash', merchant: 'Hostel Mess', tags: ['dinner', 'hostel'] },
  { email: 'aarav@kmit.edu', description: 'Tuition fee installment', amount: 12000, category: 'Education', type: 'expense', date: daysAgo(8), paymentMethod: 'Bank Transfer', merchant: 'College Fee Office', tags: ['fees', 'education'] },
  { email: 'aarav@kmit.edu', description: 'Netflix subscription (shared plan)', amount: 299, category: 'Subscriptions', type: 'expense', date: daysAgo(7), paymentMethod: 'Credit Card', merchant: 'Netflix', tags: ['subscriptions'], isRecurring: true },
  { email: 'aarav@kmit.edu', description: 'Photocopying & printing notes', amount: 150, category: 'Education', type: 'expense', date: daysAgo(6), paymentMethod: 'Cash', merchant: 'Xerox Shop', tags: ['exams'] },
  { email: 'aarav@kmit.edu', description: 'Snacks from canteen vending machine', amount: 50, category: 'Food & Dining', type: 'expense', date: daysAgo(5), paymentMethod: 'Cash', merchant: 'Canteen', tags: ['snacks'] },
  { email: 'aarav@kmit.edu', description: 'Ola AUTO home weekend', amount: 180, category: 'Transportation', type: 'expense', date: daysAgo(4), paymentMethod: 'Credit Card', merchant: 'Ola', tags: ['commute', 'weekend'] },
  { email: 'aarav@kmit.edu', description: 'Zomato — weekend dinner with friends', amount: 1200, category: 'Food & Dining', type: 'expense', date: daysAgo(3), paymentMethod: 'Credit Card', merchant: 'Zomato', tags: ['dinner', 'friends'] },
  { email: 'aarav@kmit.edu', description: 'Mobile recharge (Jio)', amount: 399, category: 'Utilities', type: 'expense', date: daysAgo(2), paymentMethod: 'Debit Card', merchant: 'Jio', tags: ['utilities'], isRecurring: true },
  { email: 'aarav@kmit.edu', description: 'Part-time tutoring income — weekend batch', amount: 3500, category: 'Education', type: 'income', date: daysAgo(1), paymentMethod: 'Bank Transfer', merchant: 'Private Tutoring', tags: ['income'] },
  // Priya
  { email: 'priya@stu.ac.in', description: 'Starbucks — morning coffee', amount: 250, category: 'Food & Dining', type: 'expense', date: daysAgo(29), paymentMethod: 'Credit Card', merchant: 'Starbucks', tags: ['coffee'] },
  { email: 'priya@stu.ac.in', description: 'Myntra sale — ethnic wear', amount: 2200, category: 'Shopping', type: 'expense', date: daysAgo(27), paymentMethod: 'Credit Card', merchant: 'Myntra', tags: ['clothing'] },
  { email: 'priya@stu.ac.in', description: 'Netflix subscription', amount: 299, category: 'Subscriptions', type: 'expense', date: daysAgo(26), paymentMethod: 'Credit Card', merchant: 'Netflix', tags: ['subscriptions'], isRecurring: true },
  { email: 'priya@stu.ac.in', description: 'Zomato — lunch', amount: 380, category: 'Food & Dining', type: 'expense', date: daysAgo(25), paymentMethod: 'Credit Card', merchant: 'Zomato', tags: ['lunch'] },
  { email: 'priya@stu.ac.in', description: 'Metro commute', amount: 120, category: 'Transportation', type: 'expense', date: daysAgo(24), paymentMethod: 'Debit Card', merchant: 'Delhi Metro', tags: ['commute'] },
  { email: 'priya@stu.ac.in', description: 'Amazon — books for elective', amount: 780, category: 'Education', type: 'expense', date: daysAgo(23), paymentMethod: 'Debit Card', merchant: 'Amazon', tags: ['books'] },
  { email: 'priya@stu.ac.in', description: 'Hostel mess advance', amount: 3000, category: 'Housing', type: 'expense', date: daysAgo(22), paymentMethod: 'Bank Transfer', merchant: 'Hostel Admin', tags: ['rent', 'hostel'], isRecurring: true },
  { email: 'priya@stu.ac.in', description: 'Swiggy — order for flatmates', amount: 650, category: 'Food & Dining', type: 'expense', date: daysAgo(21), paymentMethod: 'Credit Card', merchant: 'Swiggy', tags: ['dinner', 'flatmates'] },
  { email: 'priya@stu.ac.in', description: 'Salon — haircut & styling', amount: 550, category: 'Personal Care', type: 'expense', date: daysAgo(20), paymentMethod: 'Cash', merchant: 'Local Salon', tags: ['self-care'] },
  { email: 'priya@stu.ac.in', description: 'Part-time content writing', amount: 4000, category: 'Other', type: 'income', date: daysAgo(19), paymentMethod: 'Bank Transfer', merchant: 'Freelance Client', tags: ['income', 'freelance'] },
  { email: 'priya@stu.ac.in', description: 'Daily grocery run', amount: 720, category: 'Food & Dining', type: 'expense', date: daysAgo(18), paymentMethod: 'Cash', merchant: 'Local Kirana', tags: ['groceries'] },
  { email: 'priya@stu.ac.in', description: 'Popcorn & soda — movie night', amount: 450, category: 'Entertainment', type: 'expense', date: daysAgo(17), paymentMethod: 'Cash', merchant: 'PVR Cinemas', tags: ['movies'] },
  { email: 'priya@stu.ac.in', description: 'Uber to project meetup', amount: 140, category: 'Transportation', type: 'expense', date: daysAgo(16), paymentMethod: 'Credit Card', merchant: 'Uber', tags: ['commute', 'project'] },
  { email: 'priya@stu.ac.in', description: 'Repairs — phone screen protector', amount: 350, category: 'Personal Care', type: 'expense', date: daysAgo(15), paymentMethod: 'Debit Card', merchant: 'Mobile Shop', tags: ['phone'] },
  { email: 'priya@stu.ac.in', description: 'Canteen — evening chai', amount: 90, category: 'Food & Dining', type: 'expense', date: daysAgo(14), paymentMethod: 'Cash', merchant: 'Canteen', tags: ['snacks'] },
  { email: 'priya@stu.ac.in', description: 'Electricity bill share', amount: 900, category: 'Utilities', type: 'expense', date: daysAgo(13), paymentMethod: 'Debit Card', merchant: 'BSES Yamuna', tags: ['utilities'], isRecurring: true },
  { email: 'priya@stu.ac.in', description: 'Shein — accessories', amount: 890, category: 'Shopping', type: 'expense', date: daysAgo(12), paymentMethod: 'Credit Card', merchant: 'Shein', tags: ['accessories'] },
  { email: 'priya@stu.ac.in', description: 'Café — group study coffee', amount: 320, category: 'Food & Dining', type: 'expense', date: daysAgo(11), paymentMethod: 'Credit Card', merchant: 'Starbucks', tags: ['study'] },
  { email: 'priya@stu.ac.in', description: 'Photocopying notes', amount: 120, category: 'Education', type: 'expense', date: daysAgo(10), paymentMethod: 'Cash', merchant: 'Xerox Shop', tags: ['exams'] },
  { email: 'priya@stu.ac.in', description: 'Amazon Prime add-on', amount: 149, category: 'Subscriptions', type: 'expense', date: daysAgo(9), paymentMethod: 'Credit Card', merchant: 'Amazon Prime', tags: ['subscriptions'] },
  { email: 'priya@stu.ac.in', description: 'Metro weekend trip', amount: 200, category: 'Transportation', type: 'expense', date: daysAgo(8), paymentMethod: 'Debit Card', merchant: 'Delhi Metro', tags: ['weekend'] },
  { email: 'priya@stu.ac.in', description: 'Zomato — birthday treat for friend', amount: 1500, category: 'Food & Dining', type: 'expense', date: daysAgo(7), paymentMethod: 'Credit Card', merchant: 'Zomato', tags: ['birthday', 'dinner'] },
  { email: 'priya@stu.ac.in', description: 'Groceries weekend', amount: 1100, category: 'Food & Dining', type: 'expense', date: daysAgo(6), paymentMethod: 'Cash', merchant: 'BigBasket', tags: ['groceries'] },
  { email: 'priya@stu.ac.in', description: 'Phone recharge (Airtel)', amount: 359, category: 'Utilities', type: 'expense', date: daysAgo(5), paymentMethod: 'Debit Card', merchant: 'Airtel', tags: ['utilities'], isRecurring: true },
  { email: 'priya@stu.ac.in', description: 'Freelance payout — editorial', amount: 3000, category: 'Other', type: 'income', date: daysAgo(4), paymentMethod: 'Bank Transfer', merchant: 'Editorial Client', tags: ['income', 'freelance'] },
  { email: 'priya@stu.ac.in', description: 'Vending machine snack', amount: 40, category: 'Food & Dining', type: 'expense', date: daysAgo(3), paymentMethod: 'Cash', merchant: 'Canteen', tags: ['snacks'] },
  { email: 'priya@stu.ac.in', description: 'Ola auto — late night return', amount: 160, category: 'Transportation', type: 'expense', date: daysAgo(2), paymentMethod: 'Credit Card', merchant: 'Ola', tags: ['commute', 'night'] },
  { email: 'priya@stu.ac.in', description: 'Dinner at Italian place', amount: 1800, category: 'Food & Dining', type: 'expense', date: daysAgo(1), paymentMethod: 'Credit Card', merchant: 'Pizza Hut', tags: ['dinner', 'friends'] },
  // Rohan
  { email: 'rohan@college.org', description: 'Canteen — breakfast toast', amount: 90, category: 'Food & Dining', type: 'expense', date: daysAgo(30), paymentMethod: 'Cash', merchant: 'Canteen', tags: ['breakfast'] },
  { email: 'rohan@college.org', description: 'Delhi Metro — daily pass', amount: 600, category: 'Transportation', type: 'expense', date: daysAgo(29), paymentMethod: 'Debit Card', merchant: 'Delhi Metro', tags: ['commute'], isRecurring: true },
  { email: 'rohan@college.org', description: 'Udemy course — Python advanced', amount: 699, category: 'Education', type: 'expense', date: daysAgo(28), paymentMethod: 'Credit Card', merchant: 'Udemy', tags: ['courses', 'tech'] },
  { email: 'rohan@college.org', description: 'Zomato — lunch delivery', amount: 280, category: 'Food & Dining', type: 'expense', date: daysAgo(27), paymentMethod: 'Credit Card', merchant: 'Zomato', tags: ['lunch'] },
  { email: 'rohan@college.org', description: 'Amazon — external SSD 1TB', amount: 3999, category: 'Shopping', type: 'expense', date: daysAgo(26), paymentMethod: 'Debit Card', merchant: 'Amazon', tags: ['electronics', 'storage'] },
  { email: 'rohan@college.org', description: 'Hostel mess — monthly advance', amount: 2500, category: 'Housing', type: 'expense', date: daysAgo(25), paymentMethod: 'Bank Transfer', merchant: 'Hostel Admin', tags: ['hostel', 'mess'], isRecurring: true },
  { email: 'rohan@college.org', description: 'Netflix shared plan', amount: 299, category: 'Subscriptions', type: 'expense', date: daysAgo(24), paymentMethod: 'Credit Card', merchant: 'Netflix', tags: ['subscriptions'], isRecurring: true },
  { email: 'rohan@college.org', description: 'Graphics textbook', amount: 1200, category: 'Education', type: 'expense', date: daysAgo(23), paymentMethod: 'Debit Card', merchant: 'Amazon', tags: ['books', 'graphics'] },
  { email: 'rohan@college.org', description: 'Phone recharge (Vi)', amount: 359, category: 'Utilities', type: 'expense', date: daysAgo(22), paymentMethod: 'Debit Card', merchant: 'Vi', tags: ['utilities'], isRecurring: true },
  { email: 'rohan@college.org', description: 'Swiggy — late-night coding snack', amount: 220, category: 'Food & Dining', type: 'expense', date: daysAgo(21), paymentMethod: 'Credit Card', merchant: 'Swiggy', tags: ['snacks', 'coding'] },
  { email: 'rohan@college.org', description: 'Gaming — in-game purchase (Riot points)', amount: 999, category: 'Entertainment', type: 'expense', date: daysAgo(20), paymentMethod: 'Debit Card', merchant: 'Riot Games', tags: ['gaming'] },
  { email: 'rohan@college.org', description: 'Canteen — chai x2', amount: 100, category: 'Food & Dining', type: 'expense', date: daysAgo(19), paymentMethod: 'Cash', merchant: 'Canteen', tags: ['snacks'] },
  { email: 'rohan@college.org', description: 'Electricity bill share', amount: 800, category: 'Utilities', type: 'expense', date: daysAgo(18), paymentMethod: 'Debit Card', merchant: 'BSES Yamuna', tags: ['utilities'], isRecurring: true },
  { email: 'rohan@college.org', description: 'Ola AUTO to lab', amount: 70, category: 'Transportation', type: 'expense', date: daysAgo(17), paymentMethod: 'Credit Card', merchant: 'Ola', tags: ['commute', 'lab'] },
  { email: 'rohan@college.org', description: 'Canteen dinner', amount: 160, category: 'Food & Dining', type: 'expense', date: daysAgo(16), paymentMethod: 'Cash', merchant: 'Canteen', tags: ['dinner', 'hostel'] },
  { email: 'rohan@college.org', description: 'Coding competition entry fee', amount: 500, category: 'Education', type: 'expense', date: daysAgo(15), paymentMethod: 'Debit Card', merchant: 'Tech Contest', tags: ['competition', 'tech'] },
  { email: 'rohan@college.org', description: 'Groceries — milk, eggs, bread', amount: 450, category: 'Food & Dining', type: 'expense', date: daysAgo(14), paymentMethod: 'Cash', merchant: 'Local Kirana', tags: ['groceries'] },
  { email: 'rohan@college.org', description: 'Amazon — mechanical keyboard', amount: 2499, category: 'Shopping', type: 'expense', date: daysAgo(13), paymentMethod: 'Debit Card', merchant: 'Amazon', tags: ['electronics', 'keyboard'] },
  { email: 'rohan@college.org', description: 'Spotify premium', amount: 119, category: 'Subscriptions', type: 'expense', date: daysAgo(12), paymentMethod: 'Credit Card', merchant: 'Spotify', tags: ['subscriptions', 'music'], isRecurring: true },
  { email: 'rohan@college.org', description: 'Metro weekend outing', amount: 100, category: 'Transportation', type: 'expense', date: daysAgo(11), paymentMethod: 'Debit Card', merchant: 'Delhi Metro', tags: ['weekend'] },
  { email: 'rohan@college.org', description: 'Zomato — biryani night', amount: 550, category: 'Food & Dining', type: 'expense', date: daysAgo(10), paymentMethod: 'Credit Card', merchant: 'Zomato', tags: ['dinner'] },
  { email: 'rohan@college.org', description: 'Printer ink cartridge', amount: 650, category: 'Education', type: 'expense', date: daysAgo(9), paymentMethod: 'Debit Card', merchant: 'Stationery Shop', tags: ['printing'] },
  { email: 'rohan@college.org', description: 'Snacks vending machine', amount: 45, category: 'Food & Dining', type: 'expense', date: daysAgo(8), paymentMethod: 'Cash', merchant: 'Canteen', tags: ['snacks'] },
  { email: 'rohan@college.org', description: 'Ola — trip to coaching center', amount: 150, category: 'Transportation', type: 'expense', date: daysAgo(7), paymentMethod: 'Credit Card', merchant: 'Ola', tags: ['commute', 'coaching'] },
  { email: 'rohan@college.org', description: 'Dinner with classmates', amount: 900, category: 'Food & Dining', type: 'expense', date: daysAgo(6), paymentMethod: 'Credit Card', merchant: 'Dominos', tags: ['dinner', 'friends'] },
  { email: 'rohan@college.org', description: 'Mobile data top-up', amount: 199, category: 'Utilities', type: 'expense', date: daysAgo(5), paymentMethod: 'Debit Card', merchant: 'Jio', tags: ['utilities'], isRecurring: true },
  { email: 'rohan@college.org', description: 'Canteen — breakfast', amount: 80, category: 'Food & Dining', type: 'expense', date: daysAgo(4), paymentMethod: 'Cash', merchant: 'Canteen', tags: ['breakfast'] },
  { email: 'rohan@college.org', description: 'Metro to library', amount: 60, category: 'Transportation', type: 'expense', date: daysAgo(3), paymentMethod: 'Debit Card', merchant: 'Delhi Metro', tags: ['commute', 'library'] },
  { email: 'rohan@college.org', description: 'Zomato — lunch with project team', amount: 780, category: 'Food & Dining', type: 'expense', date: daysAgo(2), paymentMethod: 'Credit Card', merchant: 'Zomato', tags: ['lunch', 'project'] },
  { email: 'rohan@college.org', description: 'Udemy sale — React course', amount: 499, category: 'Education', type: 'expense', date: daysAgo(1), paymentMethod: 'Credit Card', merchant: 'Udemy', tags: ['courses', 'tech'] },
]

const BUDGETS = [
  // Aarav
  { email: 'aarav@kmit.edu', name: 'Monthly Food', amount: 6000, period: 'monthly', category: 'Food & Dining', color: '#10B981', alertThreshold: 80 },
  { email: 'aarav@kmit.edu', name: 'Monthly Transport', amount: 1500, period: 'monthly', category: 'Transportation', color: '#3B82F6', alertThreshold: 80 },
  { email: 'aarav@kmit.edu', name: 'Monthly Shopping', amount: 4000, period: 'monthly', category: 'Shopping', color: '#14B8A6', alertThreshold: 75 },
  { email: 'aarav@kmit.edu', name: 'Weekly Hostel', amount: 1500, period: 'weekly', category: 'Housing', color: '#8B5CF6', alertThreshold: 90 },
  { email: 'aarav@kmit.edu', name: 'Semester Education', amount: 20000, period: 'semester', category: 'Education', color: '#6366F1', alertThreshold: 70 },
  { email: 'aarav@kmit.edu', name: 'Monthly Entertainment', amount: 1000, period: 'monthly', category: 'Entertainment', color: '#EC4899', alertThreshold: 80 },
  // Priya
  { email: 'priya@stu.ac.in', name: 'Monthly Food & Dining', amount: 5000, period: 'monthly', category: 'Food & Dining', color: '#10B981', alertThreshold: 80 },
  { email: 'priya@stu.ac.in', name: 'Monthly Shopping', amount: 3000, period: 'monthly', category: 'Shopping', color: '#14B8A6', alertThreshold: 75 },
  { email: 'priya@stu.ac.in', name: 'Weekly Fun', amount: 1500, period: 'weekly', category: 'Entertainment', color: '#EC4899', alertThreshold: 85 },
  { email: 'priya@stu.ac.in', name: 'Semester Study', amount: 5000, period: 'semester', category: 'Education', color: '#6366F1', alertThreshold: 70 },
  // Rohan
  { email: 'rohan@college.org', name: 'Monthly Food', amount: 4500, period: 'monthly', category: 'Food & Dining', color: '#10B981', alertThreshold: 80 },
  { email: 'rohan@college.org', name: 'Monthly Transport', amount: 1200, period: 'monthly', category: 'Transportation', color: '#3B82F6', alertThreshold: 80 },
  { email: 'rohan@college.org', name: 'Monthly Tech & Shopping', amount: 5000, period: 'monthly', category: 'Shopping', color: '#14B8A6', alertThreshold: 75 },
  { email: 'rohan@college.org', name: 'Semester Education', amount: 18000, period: 'semester', category: 'Education', color: '#6366F1', alertThreshold: 70 },
  { email: 'rohan@college.org', name: 'Monthly Entertainment', amount: 1500, period: 'monthly', category: 'Entertainment', color: '#EC4899', alertThreshold: 80 },
]

const GOALS = [
  { email: 'aarav@kmit.edu', name: 'Laptop Upgrade Fund', targetAmount: 50000, currentAmount: 18000, deadline: new Date(now.getFullYear() + 1, 0, 1), category: 'Shopping', color: '#3B82F6' },
  { email: 'aarav@kmit.edu', name: 'Semester Trip to Goa', targetAmount: 12000, currentAmount: 3200, deadline: new Date(now.getFullYear(), now.getMonth() + 3, 15), category: 'Travel', color: '#8B5CF6' },
  { email: 'aarav@kmit.edu', name: 'Emergency Buffer', targetAmount: 10000, currentAmount: 4500, deadline: null, category: 'Other', color: '#10B981' },
  { email: 'priya@stu.ac.in', name: 'Winter Jacket Collection', targetAmount: 8000, currentAmount: 2500, deadline: new Date(now.getFullYear(), now.getMonth() + 2, 1), category: 'Shopping', color: '#EC4899' },
  { email: 'priya@stu.ac.in', name: 'Study Abroad Application Fund', targetAmount: 25000, currentAmount: 7000, deadline: new Date(now.getFullYear() + 1, 6, 1), category: 'Education', color: '#6366F1' },
  { email: 'priya@stu.ac.in', name: 'Fest Costume & Prep', targetAmount: 3000, currentAmount: 900, deadline: new Date(now.getFullYear(), now.getMonth() + 1, 20), category: 'Entertainment', color: '#F43F5E' },
  { email: 'rohan@college.org', name: 'Mechanical Keyboard Fund', targetAmount: 15000, currentAmount: 4200, deadline: new Date(now.getFullYear(), now.getMonth() + 4, 1), category: 'Shopping', color: '#14B8A6' },
  { email: 'rohan@college.org', name: 'Coding Bootcamp Savings', targetAmount: 30000, currentAmount: 8000, deadline: new Date(now.getFullYear() + 1, 3, 1), category: 'Education', color: '#6366F1' },
  { email: 'rohan@college.org', name: 'Weekend Outing Buffer', targetAmount: 2000, currentAmount: 600, deadline: null, category: 'Entertainment', color: '#F59E0B' },
]

async function run() {
  await connectDB()

  if (isMemoryMode) {
    console.log('ℹ️  In-memory mode detected. To seed the in-memory store, run: node seed.js')
    console.log('   (seed-mongo.js is for MongoDB / Atlas only.)')
    return
  }

  const User = require('./models/User')
  const Transaction = require('./models/Transaction')
  const Budget = require('./models/Budget')


  // Wipe any previous seed runs for these emails (idempotent reruns).
  // Goals are embedded in User, so deleting users also cleans their goals.
  await User.deleteMany({ email: { $in: SEED_EMAILS } })

  console.log('🌱 Seeding MongoDB (Atlas)')
  console.log(`  Currency: ${CURRENCY}`)
  console.log('')

  // ---------- Users ----------
  const createdUsers = []
  for (const data of USER_DATA) {
    const user = await User.create({ ...data, password: SEED_PASS })
    createdUsers.push(user)
    console.log(`  User: ${user.email} (${user.name}) — id=${user._id}`)
  }

  const userById = {}
  for (const u of createdUsers) {
    userById[u.email] = u
  }

  // ---------- Transactions ----------
  const txDocs = TRANSACTIONS.map(t => ({
    user: userById[t.email]._id,
    description: t.description,
    amount: t.amount,
    category: t.category,
    type: t.type,
    date: t.date,
    paymentMethod: t.paymentMethod,
    note: '',
    tags: t.tags || [],
    isRecurring: t.isRecurring || false,
    merchant: t.merchant || '',
  }))
  const txResult = await Transaction.insertMany(txDocs)
  console.log('')
  console.log(`  Transactions: ${txResult.length} inserted`)

  // ---------- Budgets ----------
  const budgetDocs = BUDGETS.map(b => ({
    user: userById[b.email]._id,
    name: b.name,
    amount: b.amount,
    period: b.period,
    category: b.category,
    startDate: now,
    endDate: null,
    alertThreshold: b.alertThreshold,
    color: b.color,
    notes: '',
    isActive: true,
  }))
  const budgetResult = await Budget.insertMany(budgetDocs)
  console.log(`  Budgets: ${budgetResult.length} inserted`)

  // ---------- Goals (embedded in User.goals) ----------
  for (const g of GOALS) {
    const userId = userById[g.email]._id
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          goals: {
            name: g.name,
            targetAmount: g.targetAmount,
            currentAmount: g.currentAmount,
            deadline: g.deadline,
            category: g.category,
            color: g.color,
          }
        }
      }
    )
  }
  console.log(`  Goals: ${GOALS.length} pushed into user documents`)

  console.log('')
  console.log('✅ MongoDB seed complete')
  console.log('')
  console.log('Login credentials for seed users:')
  for (const u of createdUsers) {
    console.log(`  ${u.email}  /  ${SEED_PASS}`)
  }
}

run().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
