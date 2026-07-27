"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Download,
  Search,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  X,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useProfile } from "@/lib/hooks/useProfile";
import { toast } from "react-hot-toast";
import PageHeader from "@/components/common/PageHeader";
import apiClient from "@/lib/api/apiClient";
import { useAuthStore } from "@/lib/store/authStore";

interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  reference: string;
  notes: string;
}

// Normalise a transaction row from the API into the shape the UI renders.
const mapApiTransaction = (t: Record<string, unknown>): Transaction => ({
  id: String(t.id ?? t._id ?? ""),
  type: t.type === "expense" ? "expense" : "income",
  category: String(t.category ?? ""),
  amount: Number(t.amount ?? 0),
  date: t.date ? new Date(t.date as string).toISOString().split("T")[0] : "",
  reference: String(t.reference ?? ""),
  notes: String(t.notes ?? ""),
});

// Palette for the (dynamically derived) expense-breakdown pie slices.
const EXPENSE_COLORS = [
  "#15803d",
  "#2563eb",
  "#d97706",
  "#dc2626",
  "#9333ea",
  "#0891b2",
  "#c026d3",
  "#65a30d",
];

// Friendly labels for the farm-worth breakdown keys returned by /api/farm-worth.
const VALUATION_LABELS: Record<string, string> = {
  land: "Land",
  equipment: "Machinery & Equipment",
  fieldCrops: "Field Crops",
  warehouseCrops: "Warehouse Produce",
};

interface ValuationSlice {
  category: string;
  value: number;
}

function FinancialsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "overview";

  const { profile } = useProfile();
  const user = useAuthStore((s) => s.user) as { _id?: string } | null;
  const userId = user?._id;
  const farmCurrency = profile?.currency || "NGN";

  const [activeTab, setActiveTab] = useState(currentTab);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [valuation, setValuation] = useState<ValuationSlice[]>([]);
  const [totalWorth, setTotalWorth] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");

  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const [incomeForm, setIncomeForm] = useState({
    category: "Crop Harvest",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    reference: "",
    notes: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    category: "Fertilizer",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    reference: "",
    notes: "",
  });

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Load the user's persisted transactions from the backend.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setIsLoading(true);
    apiClient
      .get(`/api/financial/transaction/user/${userId}`)
      .then((res) => {
        if (cancelled) return;
        const rows = (res?.data?.transactions ?? []) as Record<string, unknown>[];
        setTransactions(rows.map(mapApiTransaction));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[financials] failed to load transactions:", err);
        toast.error("Could not load financial records");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Load real farm valuation (asset worth) from the backend.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    apiClient
      .get(`/api/farm-worth`)
      .then((res) => {
        if (cancelled) return;
        const breakdown = (res?.data?.breakdown ?? {}) as Record<string, number>;
        const slices: ValuationSlice[] = Object.entries(breakdown)
          .filter(([, value]) => Number(value) > 0)
          .map(([key, value]) => ({
            category: VALUATION_LABELS[key] || key,
            value: Number(value) || 0,
          }));
        setValuation(slices);
        setTotalWorth(Number(res?.data?.totalWorth) || 0);
      })
      .catch((err) => {
        // 403 = user has no farm assets yet; treat as empty, not an error.
        if (cancelled) return;
        if (err?.response?.status !== 403) {
          console.error("[financials] failed to load farm worth:", err);
        }
        setValuation([]);
        setTotalWorth(0);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/financials?tab=${tabId}`);
  };

  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : "0.0";
    // Real asset worth from /api/farm-worth (null until loaded).
    const totalValuation = totalWorth ?? 0;

    return { totalIncome, totalExpense, netProfit, profitMargin, totalValuation };
  }, [transactions, totalWorth]);

  // Income vs expense trend over the last 7 calendar months, derived from real data.
  const monthlyData = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; month: string; income: number; expense: number; net: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: d.toLocaleString("en-US", { month: "short" }),
        income: 0,
        expense: 0,
        net: 0,
      });
    }
    const index = new Map(buckets.map((b) => [b.key, b]));
    transactions.forEach((t) => {
      if (!t.date) return;
      const d = new Date(t.date);
      const bucket = index.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (!bucket) return;
      if (t.type === "income") bucket.income += t.amount;
      else bucket.expense += t.amount;
      bucket.net = bucket.income - bucket.expense;
    });
    return buckets;
  }, [transactions]);

  // Expense breakdown by category (share of total expense), derived from real data.
  const expenseBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    transactions.forEach((t) => {
      if (t.type !== "expense") return;
      totals.set(t.category, (totals.get(t.category) || 0) + t.amount);
    });
    const grandTotal = Array.from(totals.values()).reduce((s, v) => s + v, 0);
    if (grandTotal === 0) return [];
    return Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, EXPENSE_COLORS.length)
      .map(([name, amount], i) => ({
        name,
        value: Math.round((amount / grandTotal) * 100),
        color: EXPENSE_COLORS[i],
      }));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      const matchesSearch =
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.notes.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [transactions, typeFilter, searchTerm]);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: farmCurrency === "NGN" ? "NGN" : "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(incomeForm.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setIsSaving(true);
    try {
      const res = await apiClient.post("/api/financial/transaction", {
        type: "income",
        category: incomeForm.category,
        amount: amt,
        date: incomeForm.date,
        reference: incomeForm.reference.trim() || "Revenue Deposit",
        notes: incomeForm.notes.trim(),
        farmId: profile?.id,
      });
      const saved = mapApiTransaction(res?.data?.transaction ?? {});
      setTransactions((prev) => [saved, ...prev]);
      toast.success("Income logged successfully!");
      setShowIncomeModal(false);
      setIncomeForm({
        category: "Crop Harvest",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        reference: "",
        notes: "",
      });
    } catch (err) {
      console.error("[financials] add income failed:", err);
      toast.error("Failed to save income");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseForm.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setIsSaving(true);
    try {
      const res = await apiClient.post("/api/financial/transaction", {
        type: "expense",
        category: expenseForm.category,
        amount: amt,
        date: expenseForm.date,
        reference: expenseForm.reference.trim() || "Cost Payment",
        notes: expenseForm.notes.trim(),
        farmId: profile?.id,
      });
      const saved = mapApiTransaction(res?.data?.transaction ?? {});
      setTransactions((prev) => [saved, ...prev]);
      toast.success("Expense logged successfully!");
      setShowExpenseModal(false);
      setExpenseForm({
        category: "Fertilizer",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        reference: "",
        notes: "",
      });
    } catch (err) {
      console.error("[financials] add expense failed:", err);
      toast.error("Failed to save expense");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!id || deletingId) return;
    if (!window.confirm("Delete this transaction? This cannot be undone.")) return;
    setDeletingId(id);
    // Optimistically remove, restore on failure.
    const previous = transactions;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    try {
      await apiClient.delete(`/api/financial/transaction/${id}`);
      toast.success("Transaction deleted");
    } catch (err) {
      console.error("[financials] delete failed:", err);
      toast.error("Failed to delete transaction");
      setTransactions(previous);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    const headers = "ID,Type,Category,Amount,Date,Reference,Notes\n";
    const rows = transactions
      .map(
        (t) =>
          `"${t.id}","${t.type}","${t.category}",${t.amount},"${t.date}","${t.reference}","${t.notes}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Financial statement exported as CSV");
  };

  return (
    <div className="p-0 md:p-6 bg-white dark:bg-[#0d1117] min-h-screen space-y-6 text-gray-900 dark:text-[#e6edf3]">
      
      <PageHeader
        title="Financial Management"
        subtitle="Manage income, track expenses, and view live net worth valuation.">
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-gray-300 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#161b22] text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
        <button
          onClick={() => setShowIncomeModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Log Income
        </button>
        <button
          onClick={() => setShowExpenseModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Log Expense
        </button>
      </PageHeader>

      {/* Sub-Nav Tabs (Identical to Farm Operations sub-nav) */}
      <div className="flex border-b border-gray-200 dark:border-[#30363d]">
        {[
          { id: "overview", label: "Overview" },
          { id: "income", label: "Income & Revenue" },
          { id: "expenses", label: "Expenses & Costs" },
          { id: "valuation", label: "Farm Valuation" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-green-700 text-green-700 dark:border-green-500 dark:text-green-500 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#161b22] p-5 rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Farm Valuation
            </span>
            <div className="p-2 bg-green-50 dark:bg-green-950/40 rounded-lg text-green-700 dark:text-green-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatMoney(summary.totalValuation)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Live valuation of your recorded farm assets
          </p>
        </div>

        <div className="bg-white dark:bg-[#161b22] p-5 rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Income
            </span>
            <div className="p-2 bg-green-50 dark:bg-green-950/40 rounded-lg text-green-700 dark:text-green-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">
            {formatMoney(summary.totalIncome)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Recorded crop & livestock sales</p>
        </div>

        <div className="bg-white dark:bg-[#161b22] p-5 rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg text-rose-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {formatMoney(summary.totalExpense)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Input supplies & operational costs</p>
        </div>

        <div className="bg-white dark:bg-[#161b22] p-5 rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Net Profit Margin
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {summary.profitMargin}%
          </p>
          <p className="text-xs text-green-700 dark:text-green-400 font-semibold">
            Net Profit: {formatMoney(summary.netProfit)}
          </p>
        </div>
      </div>

      {/* Visualizations Section */}
      {(activeTab === "overview" || activeTab === "income" || activeTab === "expenses") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Financial Trend Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-[#161b22] p-5 rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                  Income vs Expense Trends
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Monthly financial performance breakdown</p>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#15803d" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#8b949e" fontSize={12} />
                  <YAxis stroke="#8b949e" fontSize={12} />
                  <Tooltip
                    formatter={(value: any) => [formatMoney(Number(value || 0)), ""]}
                    contentStyle={{ backgroundColor: "#161b22", borderRadius: "8px", border: "1px solid #30363d" }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#15803d" fillOpacity={1} fill="url(#incomeGrad)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#dc2626" fillOpacity={1} fill="url(#expenseGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white dark:bg-[#161b22] p-5 rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1">
                Cost Allocation
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Expense breakdown by input type</p>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4}>
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value || 0}%`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-1.5 text-xs border-t border-gray-100 dark:border-[#30363d] pt-3">
              {expenseBreakdown.length === 0 ? (
                <p className="text-gray-400 text-center py-2">No expenses recorded yet.</p>
              ) : (
                expenseBreakdown.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-gray-600 dark:text-gray-300 truncate max-w-[160px]">{cat.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{cat.value}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Valuation Chart */}
      {activeTab === "valuation" && (
        <div className="bg-white dark:bg-[#161b22] p-6 rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
            Farm Valuation & Asset Allocation
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Breakdown of land, machinery, and produce asset valuation</p>
          {valuation.length === 0 ? (
            <div className="h-80 w-full flex flex-col items-center justify-center text-center gap-2">
              <Building2 className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No farm assets recorded yet</p>
              <p className="text-xs text-gray-400 max-w-xs">
                Add land, equipment, or produce assets to see your live farm valuation here.
              </p>
            </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={valuation}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="category" stroke="#8b949e" fontSize={12} />
                  <YAxis stroke="#8b949e" fontSize={12} />
                  <Tooltip formatter={(val: any) => [formatMoney(Number(val || 0)), "Valuation"]} />
                  <Bar dataKey="value" fill="#15803d" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Transactions Table Section */}
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm overflow-hidden">
        <div className="p-4 md:p-5 border-b border-gray-100 dark:border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">
              Financial Transactions
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">All income deposits and operational expenses</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 dark:border-[#30363d] rounded-lg bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-[#e6edf3] focus:outline-none focus:ring-1 focus:ring-green-600"
              />
            </div>

            <div className="flex border border-gray-300 dark:border-[#30363d] rounded-lg overflow-hidden text-xs">
              {(["all", "income", "expense"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 capitalize font-medium ${
                    typeFilter === type
                      ? "bg-green-700 text-white"
                      : "bg-gray-50 dark:bg-[#0d1117] text-gray-600 dark:text-gray-300"
                  }`}>
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-[#0d1117] text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-[#30363d] uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Reference / Item</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Notes</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#30363d]">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    {isLoading
                      ? "Loading transactions..."
                      : transactions.length === 0
                      ? "No transactions yet. Log your first income or expense to get started."
                      : "No transactions match your query."}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          tx.type === "income"
                            ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}>
                        {tx.type === "income" ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-gray-900 dark:text-white">{tx.category}</td>
                    <td className="p-3.5 text-gray-700 dark:text-gray-300">{tx.reference}</td>
                    <td className="p-3.5 text-gray-500">{tx.date}</td>
                    <td className={`p-3.5 font-bold text-sm ${tx.type === "income" ? "text-green-700 dark:text-green-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {tx.type === "income" ? "+" : "-"}{formatMoney(tx.amount)}
                    </td>
                    <td className="p-3.5 text-gray-500 dark:text-gray-400 truncate max-w-xs">{tx.notes || "—"}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteTransaction(tx.id)}
                        disabled={deletingId === tx.id}
                        title="Delete transaction"
                        aria-label="Delete transaction"
                        className="inline-flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log Income */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-[#30363d] w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#30363d]">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base flex items-center gap-2">
                <span className="p-1.5 bg-green-100 text-green-700 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </span>
                Log Farm Income
              </h3>
              <button onClick={() => setShowIncomeModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleAddIncome} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Category *
                </label>
                <select
                  value={incomeForm.category}
                  onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#30363d] rounded-lg bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white">
                  <option value="Crop Harvest">Crop Harvest / Sales</option>
                  <option value="Livestock Sale">Livestock Sale</option>
                  <option value="Equipment Rental">Equipment Rental Lease</option>
                  <option value="Government Grant">Government Grant / Subsidy</option>
                  <option value="Other Revenue">Other Revenue</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Amount ({farmCurrency}) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 500000"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#30363d] rounded-lg bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-green-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Transaction Date
                </label>
                <input
                  type="date"
                  required
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#30363d] rounded-lg bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Reference / Buyer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grain Distributor Batch #A2"
                  value={incomeForm.reference}
                  onChange={(e) => setIncomeForm({ ...incomeForm, reference: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#30363d] rounded-lg bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional details..."
                  value={incomeForm.notes}
                  onChange={(e) => setIncomeForm({ ...incomeForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#30363d] rounded-lg bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 bg-green-700 hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition-colors shadow-sm">
                {isSaving ? "Saving..." : "Save Income Transaction"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Expense */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-[#30363d] w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#30363d]">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base flex items-center gap-2">
                <span className="p-1.5 bg-rose-100 text-rose-600 rounded-lg">
                  <TrendingDown className="w-4 h-4" />
                </span>
                Log Farm Expense
              </h3>
              <button onClick={() => setShowExpenseModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Category *
                </label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#30363d] rounded-lg bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white">
                  <option value="Fertilizer">Fertilizer & Agro-chemicals</option>
                  <option value="Seeds & Seedlings">Seeds & Seedlings</option>
                  <option value="Labor & Wages">Labor & Field Wages</option>
                  <option value="Fuel & Energy">Fuel & Generator Diesel</option>
                  <option value="Equipment Maintenance">Machinery & Maintenance</option>
                  <option value="Feed & Animal Care">Feed & Veterinary Care</option>
                  <option value="Other Expense">Other Expense</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Amount ({farmCurrency}) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 150000"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#30363d] rounded-lg bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Transaction Date
                </label>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#30363d] rounded-lg bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Vendor / Item Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Agro Supplies Ltd"
                  value={expenseForm.reference}
                  onChange={(e) => setExpenseForm({ ...expenseForm, reference: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#30363d] rounded-lg bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional details..."
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#30363d] rounded-lg bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition-colors shadow-sm">
                {isSaving ? "Saving..." : "Save Expense Transaction"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FinancialsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0d1117]">
          <div className="flex items-center gap-2 text-green-700 font-semibold">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading Financials...
          </div>
        </div>
      }>
      <FinancialsContent />
    </Suspense>
  );
}
