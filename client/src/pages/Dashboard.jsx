import { useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import TransactionForm from "../components/TransactionForm";
import {
  DollarSign,
  TrendingDown,
  CreditCard,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Receipt,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getCategoryColor,
  getCategoryIcon,
  CATEGORIES,
  DAYS_OF_WEEK,
  MONTHS,
} from "../utils/helpers";

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newTx, setNewTx] = useState(null);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tx, sum, cat] = await Promise.all([
        api.get("/transactions?limit=10&sortBy=date&sortOrder=desc"),
        api.get("/transactions/summary"),
        api.get("/categories"),
      ]);
      setTransactions(tx.data.transactions);
      setSummary(sum.data);
      setCategories(cat.data.categories);
    } catch (err) {
      console.error("Dashboard load error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (data) => {
    try {
      const res = await api.post("/transactions", data);
      setNewTx(null);
      setShowQuickAdd(false);
      loadData();
      if (res.data.alerts?.length) {
        const a = res.data.alerts[0];
        setAlertMsg(a.message);
        setAlertType(a.severity);
        setTimeout(() => setAlertMsg(""), 5000);
      }
    } catch (err) {
      alert("Failed: " + (err.response?.data?.msg || err.message));
    }
  };

  const totalSpent = summary?.totalSpent || 0;
  const totalIncome = summary?.totalIncome || 0;
  const net = totalIncome - totalSpent;
  const avgTx = summary?.averageTransaction || 0;
  const txCount = summary?.transactionCount || 0;

  const mBgt = user?.monthlyBudget || 0;
  const wBgt = user?.weeklyBudget || 0;
  const mPct =
    mBgt > 0 ? Math.min(100, Math.round((totalSpent / mBgt) * 100)) : 0;
  const wPct =
    wBgt > 0 ? Math.min(100, Math.round((totalSpent / wBgt) * 100)) : 0;
  const mRemain = Math.max(0, mBgt - totalSpent);
  const wRemain = Math.max(0, wBgt - totalSpent);

  const severity =
    mPct >= 90
      ? "danger"
      : mPct >= 70
        ? "warning"
        : mPct >= 50
          ? "info"
          : "success";

  const trend = summary?.monthlyTrend || [];
  const hasTrend = trend.length >= 2;
  const trendChange = hasTrend
    ? ((trend[0].total - trend[1].total) / trend[1].total) * 100
    : 0;
  const trendUp = trendChange < 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="h-8 w-8 animate-spin text-primary-600"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}{" "}
            overview
          </p>
        </div>
        <button
          onClick={() => setShowQuickAdd(true)}
          className="btn btn-primary btn-lg flex items-center gap-2"
        >
          <Plus className="h-5 w-5" /> Quick Add
        </button>
      </div>

      {alertMsg && (
        <div
          className={`rounded-xl p-4 flex items-start gap-3 border ${alertType !== "success" ? "bg-danger-50 border-danger-200 text-danger-800" : "bg-primary-50 border-primary-200 text-primary-800"}`}
        >
          <AlertTriangle
            className={`h-5 w-5 flex-shrink-0 mt-0.5 ${alertType !== "success" ? "text-danger-500" : "text-primary-500"}`}
          />
          <p className="text-sm font-medium flex-1">{alertMsg}</p>
          <button
            onClick={() => setAlertMsg("")}
            className="text-current opacity-60 hover:opacity-100"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {(mBgt > 0 || wBgt > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mBgt > 0 && (
            <div
              className={`rounded-xl p-5 border ${mPct >= 90 ? "bg-danger-50 border-danger-200" : mPct >= 70 ? "bg-warning-50 border-warning-200" : "bg-success-50 border-success-200"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${mPct >= 90 ? "bg-danger-100" : mPct >= 70 ? "bg-warning-100" : "bg-success-100"}`}
                  >
                    {mPct >= 90 ? "🚨" : mPct >= 70 ? "⚠️" : "💰"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Monthly Budget
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(mBgt)} plan
                    </p>
                  </div>
                </div>
                <span
                  className={`text-2xl font-bold ${mPct >= 90 ? "text-danger-600" : mPct >= 70 ? "text-warning-600" : "text-success-600"}`}
                >
                  {mPct}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${mPct >= 90 ? "bg-danger-500" : mPct >= 70 ? "bg-warning-500" : "bg-success-500"}`}
                  style={{ width: `${mPct}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{formatCurrency(totalSpent)} spent</span>
                <span>{formatCurrency(mRemain)} remaining</span>
              </div>
              {mPct >= 80 && (
                <p className="mt-2 text-xs font-medium text-danger-600">
                  ⚠️ Warning: approaching budget limit!
                </p>
              )}
            </div>
          )}
          {wBgt > 0 && (
            <div
              className={`rounded-xl p-5 border ${wPct >= 90 ? "bg-danger-50 border-danger-200" : wPct >= 70 ? "bg-warning-50 border-warning-200" : "bg-success-50 border-success-200"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${wPct >= 90 ? "bg-danger-100" : wPct >= 70 ? "bg-warning-100" : "bg-success-100"}`}
                  >
                    {wPct >= 90 ? "🚨" : wPct >= 70 ? "⚠️" : "📅"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Weekly Budget
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(wBgt)} plan
                    </p>
                  </div>
                </div>
                <span
                  className={`text-2xl font-bold ${wPct >= 90 ? "text-danger-600" : wPct >= 70 ? "text-warning-600" : "text-success-600"}`}
                >
                  {wPct}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${wPct >= 90 ? "bg-danger-500" : wPct >= 70 ? "bg-warning-500" : "bg-success-500"}`}
                  style={{ width: `${wPct}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{formatCurrency(totalSpent)} spent</span>
                <span>{formatCurrency(wRemain)} remaining</span>
              </div>
              {wPct >= 80 && (
                <p className="mt-2 text-xs font-medium text-danger-600">
                  ⚠️ Warning: approaching budget limit!
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Spent
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalSpent)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{txCount} transactions</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100 text-success-600">
              <ArrowDownRight className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Income
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalIncome)}
          </p>
          <p className="text-xs text-gray-400 mt-1">This month</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${net >= 0 ? "bg-success-100 text-success-600" : "bg-danger-100 text-danger-600"}`}
            >
              {net >= 0 ? (
                <ArrowDownRight className="h-5 w-5" />
              ) : (
                <ArrowUpRight className="h-5 w-5" />
              )}
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Net
            </span>
          </div>
          <p
            className={`text-2xl font-bold ${net >= 0 ? "text-success-600" : "text-danger-600"}`}
          >
            {formatCurrency(net)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {net >= 0 ? "Under budget" : "Over budget"}
          </p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100 text-warning-600">
              <TrendingDown className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Avg/Txn
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(avgTx)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Per transaction</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900">
              Spending by Category
            </h2>
            <span className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 cursor-pointer">
              View details <ChevronRight className="h-3 w-3" />
            </span>
          </div>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3">
                <CreditCard className="h-6 w-6" />
              </div>
              <p className="text-sm text-gray-500">No transactions yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Add your first expense to see categories
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.slice(0, 6).map((cat) => {
                const color = getCategoryColor(cat.name);
                const maxSpent = categories[0]?.spent || 1;
                const pct = (cat.spent / maxSpent) * 100;
                return (
                  <div key={cat.name} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {getCategoryIcon(cat.name)}
                        </span>
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(cat.spent)}
                        </span>
                        <span className="text-xs text-gray-400 w-12 text-right">
                          {cat.count} txns
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Spending Trend
            </h2>
            {!hasTrend ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400">Not enough data</p>
                <p className="text-xs text-gray-300 mt-1">
                  Add more transactions
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {trend.slice(0, 5).map((m, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 w-10">
                      {MONTHS[m._id.month - 1]}
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden ml-2">
                      <div
                        className="h-full rounded-full bg-primary-500"
                        style={{
                          width: `${(m.total / (trend[0]?.total || 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 ml-2 w-16 text-right">
                      {formatCurrency(m.total)}
                    </span>
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">vs last month</span>
                  <span
                    className={`text-sm font-semibold ${trendUp ? "text-success-600" : "text-danger-600"}`}
                  >
                    {trendUp ? "↓" : "↑"} {Math.abs(trendChange).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
          {summary?.topMerchants?.length > 0 && (
            <div className="card p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Top Merchants
              </h2>
              <div className="space-y-2">
                {summary.topMerchants.slice(0, 5).map((m, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-300 w-4">
                        #{i + 1}
                      </span>
                      <span className="text-sm text-gray-700 truncate max-w-[120px]">
                        {m.merchant || "Unknown"}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(m.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {summary?.spendingByDay?.length > 0 && (
            <div className="card p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-3">
                Busiest Day
              </h2>
              <div className="grid grid-cols-7 gap-1">
                {summary.spendingByDay.map((d) => (
                  <div
                    key={d._id}
                    className="flex flex-col items-center p-1.5 rounded-lg bg-gray-50 text-center group hover:bg-primary-50"
                  >
                    <span className="text-xs font-medium text-gray-500">
                      {DAYS_OF_WEEK[d._id - 1]}
                    </span>
                    <span className="text-xs font-bold text-primary-600 mt-0.5">
                      {formatCurrency(d.total).replace("$", "")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Recent Transactions
          </h2>
          <Link
            to="/transactions"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3">
              <Receipt className="h-7 w-7" />
            </div>
            <p className="text-sm text-gray-500 font-medium">
              No transactions yet
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Start tracking your expenses!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.slice(0, 8).map((tx) => (
              <div
                key={tx._id}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-lg flex-shrink-0"
                    style={{
                      backgroundColor: getCategoryColor(tx.category) + "15",
                    }}
                  >
                    {getCategoryIcon(tx.category)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {tx.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(tx.date, "short")} · {tx.paymentMethod}
                      {tx.merchant ? ` · ${tx.merchant}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${tx.type === "income" ? "text-success-600" : "text-gray-900"}`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </p>
                  <span
                    className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full ${tx.type === "income" ? "bg-success-50 text-success-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {tx.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showQuickAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowQuickAdd(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary-600" /> Add Transaction
              </h2>
              <button
                onClick={() => setShowQuickAdd(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <TransactionForm
              onSubmit={handleAdd}
              onCancel={() => setShowQuickAdd(false)}
              loading={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function XIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function Link({ to, children, className }) {
  return (
    <a href={to} className={className}>
      {children}
    </a>
  );
}
