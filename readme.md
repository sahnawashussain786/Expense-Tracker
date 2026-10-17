# College Expense Tracker

A full-stack expense and budget tracker built for students. The app provides a React dashboard for recording income and expenses, setting budgets and savings goals, and reviewing spending insights. The API is built with Express and supports MongoDB through Mongoose, with an in-memory development fallback.

## Features

- **Dashboard:** Monthly income and spending totals, recent transactions, budget progress, and quick transaction entry.
- **Transactions:** Create, view, edit, and delete income or expense records. Filter by type, category, date range, and amount; search entries; sort and paginate results; import and export CSV files.
- **Budgets:** Set daily, weekly, monthly, semester, or yearly spending limits. Budgets can apply to all categories or one category, have configurable alert thresholds, and include usage history.
- **Savings goals:** Set a target amount, current saved amount, optional deadline and category, and track progress.
- **Insights:** Review spending by category, payment method, and day of the week, along with monthly trends and top merchants.
- **Account settings:** Update profile details, weekly/monthly/semester budget defaults, favorite categories, notification preferences, and password. Account deletion is also available.
- **Authentication:** Register and sign in with email and password. Passwords are hashed with bcrypt, and API sessions use JSON Web Tokens.
- **Categories:** Transactions use a built-in set of 15 expense categories. The API also provides category spending summaries and suggested budgets.

Recurring transactions are stored as a transaction flag; the app does not currently schedule or generate recurring entries automatically. Email notifications are marked as coming soon in Settings.

## Technology

- **Client:** React 18, Vite, React Router, Axios, Recharts, Tailwind CSS, and Lucide icons
- **Server:** Node.js, Express, Mongoose, MongoDB, JWT, and bcryptjs
- **Development:** Concurrently runs the client and server from the repository root

## Project structure

```text
.
├── client/
│   ├── src/
│   │   ├── components/   # Forms and shared application layout
│   │   ├── context/      # Authentication state
│   │   ├── pages/        # Dashboard, transactions, budgets, goals, insights, settings
│   │   └── utils/        # API client and formatting/category helpers
│   └── vite.config.js    # Client dev server and /api proxy
├── server/
│   ├── config.js         # API port, JWT, and MongoDB defaults
│   ├── controllers/      # API request handlers
│   ├── middleware/       # JWT authentication
│   ├── models/           # User, transaction, and budget schemas
│   ├── routes/           # Authentication and resource routes
│   ├── db.js             # MongoDB connection and memory fallback
│   └── index.js          # Express API entry point
├── .env.example          # Example environment values
├── package.json          # Root development scripts
└── readme.md
```

Goals are stored as part of a user's profile rather than in a separate Mongoose model.

## Requirements

- Node.js 18 or newer and npm
- MongoDB for persistent storage (optional for temporary local development)

## Install dependencies

From the project root, install the root, server, and client dependencies:

```bash
npm install
npm run install-all
```

## Configuration

The API reads `PORT`, `MONGO_URI`, `JWT_SECRET`, and `NODE_ENV` from its process environment. The defaults are port `5000`, an in-memory store when `MONGO_URI` is not set, and a development JWT secret. Set a unique, strong `JWT_SECRET` and a MongoDB URI for any deployment or persistent local use.

The repository includes `.env.example` as a reference, but the current server code does not load `.env` files automatically. Set environment variables in the shell or process manager used to start the app. For example, in PowerShell:

```powershell
$env:PORT = "5000"
$env:MONGO_URI = "mongodb://localhost:27017/college-expense-tracker"
$env:JWT_SECRET = "replace-with-a-long-random-secret"
npm run dev
```

If `MONGO_URI` is omitted or the MongoDB connection fails, the server falls back to an in-memory store. That data is cleared when the server restarts. Keep MongoDB running and set `MONGO_URI` when you want users, transactions, budgets, and goals to persist.

## Run the app

From the project root:

```bash
npm run dev
```

This starts the API on `http://localhost:5000` and the Vite client on `http://localhost:3000`. The client proxies `/api` requests to the API. Open `http://localhost:3000` in a browser.

You can also start each process separately in its own terminal:

```bash
npm run server
npm run client
```

### Current startup issue

The checked-in `server/index.js` calls `app.use(...)` and `app.listen(...)` without first defining `app` (for example, with `const app = express()`). As currently written, the API process will fail at startup, so the run commands above will not work until that server entry-point issue is fixed.

## Using the app

1. Register an account or sign in.
2. Add income and expenses from the Dashboard or Transactions page.
3. Create budgets and optional savings goals to track limits and targets.
4. Use Insights to explore spending patterns over a selected time range.
5. Adjust budget defaults, favorite categories, and account preferences in Settings.

Transaction categories are: Food & Dining, Transportation, Housing, Utilities, Entertainment, Shopping, Education, Healthcare, Subscriptions, Travel, Personal Care, Gifts, Insurance, Bank Fees, and Other.

## API overview

The API base path is `/api`. The health check is `GET /api/health`. All endpoints below require authentication unless marked **Public**. Send the JWT returned by registration or login in the `x-auth-token` request header.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account (**Public**) |
| `POST` | `/api/auth/login` | Sign in (**Public**) |
| `GET` | `/api/auth/me` | Get the current account |
| `PUT` | `/api/auth/profile` | Update profile and budget preferences |
| `PUT` | `/api/auth/password` | Change password |
| `PUT` | `/api/auth/favorites` | Save favorite categories |
| `DELETE` | `/api/auth/account` | Delete account and associated data |
| `GET` | `/api/transactions` | List transactions with filters, sorting, and pagination |
| `POST` | `/api/transactions` | Create a transaction |
| `GET` | `/api/transactions/summary` | Get spending and income summaries |
| `GET` | `/api/transactions/alerts` | Get budget alerts |
| `POST` | `/api/transactions/bulk` | Import multiple transactions |
| `GET`, `PUT`, `DELETE` | `/api/transactions/:id` | Read, update, or delete one transaction |
| `GET`, `POST` | `/api/budgets` | List or create budgets |
| `GET`, `PUT`, `DELETE` | `/api/budgets/:id` | Read, update, or delete one budget |
| `GET` | `/api/budgets/:id/history` | Get a budget's spending history |
| `GET`, `POST` | `/api/goals` | List or create savings goals |
| `PUT`, `DELETE` | `/api/goals/:id` | Update or delete a savings goal |
| `GET` | `/api/categories` | List categories with current spending summaries |
| `GET` | `/api/categories/list` | List categories without spending summaries |

`GET /api/transactions` accepts `page`, `limit`, `type`, `category`, `startDate`, `endDate`, `minAmount`, `maxAmount`, `search`, `sortBy`, and `sortOrder` query parameters. The summary endpoint accepts optional `startDate` and `endDate` parameters.

Transaction fields include `description`, `amount`, `category`, `type` (`expense` or `income`), `date`, `paymentMethod`, `merchant`, `note`, `tags`, and `isRecurring`. For bulk import, send a JSON object with a `transactions` array. The Transactions page also provides CSV import/export controls.

## Notes

- The client uses a fixed `/api` base path and Vite proxies it to `http://localhost:5000` by default.
- The server's CORS middleware is enabled. The `CLIENT_URL` value shown in `.env.example` is not currently used by the server code.
- No automated test or lint scripts are defined in the package manifests.
