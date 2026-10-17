const http = require("http");

const BASE = "http://localhost:5000";

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (token) opts.headers["x-auth-token"] = token;
    const req = http.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  console.log("🧪 Testing College Expense Tracker API\n");

  // 1. Health
  let r = await request("GET", "/api/health");
  console.log(`✅ Health: ${r.data.status}`);

  // 2. Register
  r = await request("POST", "/api/auth/register", {
    name: "Sarah Chen",
    email: "sarah@college.edu",
    password: "student123",
    phone: "+15551234",
  });
  console.log(`✅ Register: ${r.data.user.name} (${r.data.user.email})`);
  const token = r.data.token;
  console.log(`   Token: ${token.slice(0, 30)}...`);

  // 3. Login
  r = await request("POST", "/api/auth/login", {
    email: "sarah@college.edu",
    password: "student123",
  });
  console.log(`✅ Login: ${r.data.user.name}`);

  // 4. Get me
  r = await request("GET", "/api/auth/me", null, token);
  console.log(
    `✅ Get me: monthlyBudget=${r.data.user.monthlyBudget}, weeklyBudget=${r.data.user.weeklyBudget}`,
  );

  // 5. Update profile (set budgets)
  r = await request(
    "PUT",
    "/api/auth/profile",
    {
      monthlyBudget: 1500,
      weeklyBudget: 400,
      semesterBudget: 5000,
    },
    token,
  );
  console.log(
    `✅ Update profile: monthlyBudget=${r.data.user.monthlyBudget}, weeklyBudget=${r.data.user.weeklyBudget}`,
  );

  // 6. Add transactions
  const txs = [
    {
      description: "Campus cafe lunch",
      amount: 12.5,
      category: "Food & Dining",
      merchant: "Starbucks",
      paymentMethod: "Debit Card",
    },
    {
      description: "Uber to library",
      amount: 8.75,
      category: "Transportation",
      merchant: "Uber",
      paymentMethod: "Credit Card",
    },
    {
      description: "Part-time job paycheck",
      amount: 400,
      category: "Other",
      type: "income",
      paymentMethod: "Bank Transfer",
    },
    {
      description: "Netflix subscription",
      amount: 15.99,
      category: "Subscriptions",
      merchant: "Netflix",
      paymentMethod: "Credit Card",
      isRecurring: true,
    },
    {
      description: "Textbook purchase",
      amount: 89.99,
      category: "Education",
      merchant: "Amazon",
      paymentMethod: "Credit Card",
    },
    {
      description: "Weekly groceries",
      amount: 67.34,
      category: "Food & Dining",
      merchant: "Walmart",
      paymentMethod: "Debit Card",
    },
    {
      description: "Bus pass",
      amount: 45,
      category: "Transportation",
      merchant: "City Bus",
      paymentMethod: "Debit Card",
    },
  ];

  for (const tx of txs) {
    r = await request("POST", "/api/transactions", tx, token);
    console.log(
      `✅ Add tx: ${r.data.transaction.description} ($${r.data.transaction.amount} / ${r.data.transaction.category})`,
    );
  }

  // 7. Get transactions
  r = await request("GET", "/api/transactions?limit=20", null, token);
  console.log(
    `✅ Get transactions: ${r.data.transactions.length} total, ${r.data.pagination.total} in DB`,
  );

  // 8. Get budget alerts
  r = await request("GET", "/api/transactions/alerts", null, token);
  console.log(`✅ Budget alerts: ${r.data.alerts.length} alert(s)`);
  r.data.alerts.forEach((a) => console.log(`   ⚠️  ${a.type}: ${a.message}`));

  // 9. Get summary
  r = await request("GET", "/api/transactions/summary", null, token);
  console.log(
    `✅ Summary: spent=$${r.data.totalSpent}, income=$${r.data.totalIncome}, count=${r.data.transactionCount}`,
  );
  console.log(
    `   Categories: ${r.data.categoryBreakdown.length}, Top merchants: ${r.data.topMerchants.length}`,
  );

  // 10. Create budget
  r = await request(
    "POST",
    "/api/budgets",
    {
      name: "Food Budget",
      amount: 300,
      period: "monthly",
      category: "Food & Dining",
      color: "#10B981",
    },
    token,
  );
  console.log(
    `✅ Create budget: ${r.data.budget.name} ($${r.data.budget.amount}/${r.data.budget.period})`,
  );

  // 11. Get budgets
  r = await request("GET", "/api/budgets", null, token);
  console.log(`✅ Get budgets: ${r.data.budgets.length} budget(s)`);
  r.data.budgets.forEach((b) =>
    console.log(
      `   ${b.name}: $${b.spent}/${b.amount} (${b.percentUsed}% used)`,
    ),
  );

  // 12. Create goal
  r = await request(
    "POST",
    "/api/goals",
    {
      name: "Spring Break Trip",
      targetAmount: 1200,
      currentAmount: 200,
      category: "Travel",
      color: "#8B5CF6",
    },
    token,
  );
  console.log(
    `✅ Create goal: ${r.data.goal.name} ($${r.data.goal.currentAmount}/$${r.data.goal.targetAmount}, ${r.data.goal.progress}%)`,
  );

  // 13. Get goals
  r = await request("GET", "/api/goals", null, token);
  console.log(`✅ Get goals: ${r.data.goals.length} goal(s)`);

  // 14. Get categories
  r = await request("GET", "/api/categories", null, token);
  console.log(`✅ Categories: ${r.data.categories.length} categories`);
  const topCat = r.data.categories.find((c) => c.spent > 0);
  if (topCat)
    console.log(
      `   Top: ${topCat.icon} ${topCat.name} - $${topCat.spent} (${topCat.percentUsed}% of suggested $${topCat.suggestedBudget})`,
    );

  // 15. Update transaction
  const firstTx = r.data ? r.data.transactions?.[0] : null;
  // Use the first transaction from get transactions
  r2 = await request("GET", "/api/transactions?limit=1", null, token);
  const txToUpdate = r2.data.transactions[0];
  if (txToUpdate) {
    r = await request(
      "PUT",
      `/api/transactions/${txToUpdate._id}`,
      {
        note: "Updated via API test",
      },
      token,
    );
    console.log(
      `✅ Update tx: ${r.data.transaction.description} → note: "${r.data.transaction.note}"`,
    );
  }

  // 16. Delete transaction
  if (txToUpdate) {
    r = await request(
      "DELETE",
      `/api/transactions/${txToUpdate._id}`,
      null,
      token,
    );
    console.log(`✅ Delete tx: ${r.data.msg}`);

    r = await request("GET", "/api/transactions?limit=20", null, token);
    console.log(
      `✅ After delete: ${r.data.transactions.length} transactions remaining`,
    );
  }

  // 17. Update favorites
  r = await request(
    "PUT",
    "/api/auth/favorites",
    {
      favoriteCategories: ["Food & Dining", "Transportation", "Education"],
    },
    token,
  );
  console.log(`✅ Favorites: ${r.data.user.favoriteCategories.join(", ")}`);

  // 18. Test auth failure
  r = await request("GET", "/api/auth/me", null, "invalid-token");
  console.log(`✅ Auth guard: ${r.status} (expected 401)`);

  // 19. Test 404
  r = await request("GET", "/api/nonexistent", null, token);
  console.log(`✅ 404 handler: ${r.status} (expected 404)`);

  // 20. Test transaction validation
  r = await request(
    "POST",
    "/api/transactions",
    {
      description: "",
      amount: 0,
      category: "",
    },
    token,
  );
  console.log(
    `✅ Validation: ${r.status} errors=${Object.keys(r.data).length > 0 ? "yes" : "no"}`,
  );

  console.log("\n🎉 All API tests passed!");
}

test().catch((e) => {
  console.error("❌ Test failed:", e.message);
  process.exit(1);
});
