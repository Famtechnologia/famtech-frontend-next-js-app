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

interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  reference: string;
  notes: string;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "tx-1", type: "income", category: "Crop Harvest", amount: 1250000, date: "2026-07-20", reference: "Maize Batch #A1", notes: "Sold 50 bags to regional distributor" },
  { id: "tx-2", type: "expense", category: "Fertilizer", amount: 185000, date: "2026-07-18", reference: "NPK 15-15-15", notes: "Purchased 10 bags for plot B" },
  { id: "tx-3", type: "income", category: "Livestock Sale", amount: 640000, date: "2026-07-15", reference: "Cattle Batch #C3", notes: "Sold 4 bulls at livestock market" },
  { id: "tx-4", type: "expense", category: "Labor & Wages", amount: 120000, date: "2026-07-12", reference: "Field Hand Workers", notes: "Weekly wages for weeding and maintenance" },
  { id: "tx-5", type: "expense", category: "Fuel & Energy", amount: 95000, date: "2026-07-08", reference: "Tractor Diesel", notes: "Fuel refill for land preparation" },
  { id: "tx-6", type: "income", category: "Equipment Rental", amount: 210000, date: "2026-07-05", reference: "Harvester Lease", notes: "Leased harvester to neighboring farm" },
  { id: "tx-7", type: "expense", category: "Seeds & Seedlings", amount: 140000, date: "2026-07-01", reference: "Hybrid Maize Seeds", notes: "High yield seed supply for Q3 planting" },
];

const MONTHLY_FINANCIAL_DATA = [
  { month: "Jan", income: 1400000, expense: 620000, net: 780000 },
  { month: "Feb", income: 1650000, expense: 710000, net: 940000 },
  { month: "Mar", income: 1900000, expense: 850000, net: 1050000 },
  { month: "Apr", income: 1300000, expense: 540000, net: 760000 },
  { month: "May", income: 2100000, expense: 920000, net: 1180000 },
  { month: "Jun", income: 2450000, expense: 1050000, net: 1400000 },
  { month: "Jul", income: 2100000, expense: 540000, net: 1560000 },
];

const EXPENSE_CATEGORIES_PIE = [
  { name: "Fertilizer & Agro-chemicals", value: 35, color: "#00c853" },
  { name: "Seeds & Seedlings", value: 25, color: "#2563eb" },
  { name: "Labor & Field Wages", value: 20, color: "#d97706" },
  { name: "Fuel & Power", value: 12, color: "#dc2626" },
  { name: "Machinery & Maintenance", value: 8, color: "#9333ea" },
];

const VALUATION_BREAKDOWN = [
  { category: "Land & Infrastructure", value: 8500000 },
  { category: "Machinery & Equipment", value: 4200000 },
  { category: "Produce Inventory", value: 2800000 },
  { category: "Livestock Herd", value: 3100000 },
  { category: "Cash & Receivables", value: 1900000 },
];

function FinancialsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "overview";

  const { profile } = useProfile();
  const farmCurrency = profile?.currency || "NGN";

  const [activeTab, setActiveTab] = useState(currentTab);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
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
    const totalValuation = VALUATION_BREAKDOWN.reduce((sum, v) => sum + v.value, 0) + netProfit;

    return { totalIncome, totalExpense, netProfit, profitMargin, totalValuation };
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

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(incomeForm.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: "income",
      category: incomeForm.category,
      amount: amt,
      date: incomeForm.date,
      reference: incomeForm.reference.trim() || "Revenue Deposit",
      notes: incomeForm.notes.trim(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    toast.success("Income logged successfully!");
    setShowIncomeModal(false);
    setIncomeForm({
      category: "Crop Harvest",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      reference: "",
      notes: "",
    });
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseForm.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: "expense",
      category: expenseForm.category,
      amount: amt,
      date: expenseForm.date,
      reference: expenseForm.reference.trim() || "Cost Payment",
      notes: expenseForm.notes.trim(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    toast.success("Expense logged successfully!");
    setShowExpenseModal(false);
    setExpenseForm({
      category: "Fertilizer",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      reference: "",
      notes: "",
    });
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0d1117] text-slate-900 dark:text-[#e6edf3] font-sans relative">
      <div className="container p-4 mx-auto max-w-7xl space-y-6">

        {/* Clean Famtech Page Header Block (Matches Warehouse, Inventory, Farm Ops & Advisory) */}
        <div className="mb-6 bg-white dark:bg-[#161b22] p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100/50 dark:border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-[#e6edf3] tracking-tight">
              Financial Overview
            </h1>
            <p className="text-slate-500 dark:text-[#8b949e] mt-1 text-sm font-medium">
              Manage income, track expenses, and view live net worth valuation.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center px-4 py-2.5 border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#21262d] text-slate-700 dark:text-[#e6edf3] text-sm font-semibold rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-gray-800 transition-all">
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </button>
            <button
              onClick={() => setShowIncomeModal(true)}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#00c853] hover:bg-[#00b04f] text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all">
              + Log Income
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all">
              + Log Expense
            </button>
          </div>
        </div>

        {/* Sub-Nav Pill Wrapper (Matches Advisory, Warehouse & Inventory tabs) */}
        <div className="flex bg-slate-100/80 dark:bg-[#161b22] p-1.5 rounded-2xl border border-slate-200/60 dark:border-[#30363d] shadow-sm overflow-x-auto gap-2">
          {[
            { id: "overview", label: "Overview" },
            { id: "income", label: "Income & Revenue" },
            { id: "expenses", label: "Expenses & Costs" },
            { id: "valuation", label: "Farm Valuation" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-5 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white dark:bg-[#21262d] text-[#00c853] shadow-sm"
                  : "text-slate-600 dark:text-[#8b949e] hover:text-slate-900 dark:hover:text-[#e6edf3]"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Famtech Card Grid with Green Top Accent Borders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-slate-100/50 dark:border-[#30363d] border-t-4 border-t-[#00c853] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-[#8b949e] uppercase tracking-wider">
                Total Farm Valuation
              </span>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-[#00c853]">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-[#e6edf3]">
              {formatMoney(summary.totalValuation)}
            </p>
            <div className="flex items-center text-xs font-bold text-[#00c853] gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12.4% net worth growth
            </div>
          </div>

          <div className="bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-slate-100/50 dark:border-[#30363d] border-t-4 border-t-[#00c853] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-[#8b949e] uppercase tracking-wider">
                Total Income
              </span>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-[#00c853]">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#00c853]">
              {formatMoney(summary.totalIncome)}
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8b949e]">Recorded crop & livestock sales</p>
          </div>

          <div className="bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-slate-100/50 dark:border-[#30363d] border-t-4 border-t-rose-500 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-[#8b949e] uppercase tracking-wider">
                Total Expenses
              </span>
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-rose-600">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-rose-600">
              {formatMoney(summary.totalExpense)}
            </p>
            <p className="text-xs text-slate-500 dark:text-[#8b949e]">Input supplies & operational costs</p>
          </div>

          <div className="bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-slate-100/50 dark:border-[#30363d] border-t-4 border-t-indigo-500 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-[#8b949e] uppercase tracking-wider">
                Net Profit Margin
              </span>
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-indigo-600">
              {summary.profitMargin}%
            </p>
            <p className="text-xs text-[#00c853] font-bold">
              Net Profit: {formatMoney(summary.netProfit)}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        {(activeTab === "overview" || activeTab === "income" || activeTab === "expenses") && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Financial Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-slate-100/50 dark:border-[#30363d] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-[#e6edf3] text-base">
                    Income vs Expense Trends
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#8b949e]">Monthly financial performance breakdown</p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MONTHLY_FINANCIAL_DATA}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00c853" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00c853" stopOpacity={0} />
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
                      contentStyle={{ backgroundColor: "#161b22", borderRadius: "12px", border: "1px solid #30363d" }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="income" name="Income" stroke="#00c853" fillOpacity={1} fill="url(#incomeGrad)" strokeWidth={2.5} />
                    <Area type="monotone" dataKey="expense" name="Expense" stroke="#dc2626" fillOpacity={1} fill="url(#expenseGrad)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Breakdown Pie */}
            <div className="bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-slate-100/50 dark:border-[#30363d] shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-[#e6edf3] text-base mb-1">
                  Cost Structure
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#8b949e] mb-4">Expense breakdown by input type</p>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={EXPENSE_CATEGORIES_PIE} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4}>
                        {EXPENSE_CATEGORIES_PIE.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`${value || 0}%`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-2 text-xs border-t border-slate-100 dark:border-[#30363d] pt-3">
                {EXPENSE_CATEGORIES_PIE.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-slate-600 dark:text-slate-300 truncate max-w-[160px]">{cat.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-[#e6edf3]">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Valuation Tab Chart */}
        {activeTab === "valuation" && (
          <div className="bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-slate-100/50 dark:border-[#30363d] shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-[#e6edf3] text-lg mb-1">
              Farm Valuation & Asset Allocation
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#8b949e] mb-6">Breakdown of land, machinery, produce inventory, and livestock valuation</p>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={VALUATION_BREAKDOWN}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="category" stroke="#8b949e" fontSize={12} />
                  <YAxis stroke="#8b949e" fontSize={12} />
                  <Tooltip formatter={(val: any) => [formatMoney(Number(val || 0)), "Valuation"]} />
                  <Bar dataKey="value" fill="#00c853" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Transactions Table Section */}
        <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-100/50 dark:border-[#30363d] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-[#e6edf3] text-base">
                Financial Transactions
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#8b949e]">All income deposits and operational expenses</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-[#30363d] rounded-xl bg-slate-50 dark:bg-[#21262d] text-slate-900 dark:text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#00c853]/20 focus:border-[#00c853]"
                />
              </div>

              <div className="flex bg-slate-50 dark:bg-[#21262d] p-1 border border-slate-200 dark:border-[#30363d] rounded-xl text-xs">
                {(["all", "income", "expense"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-3 py-1.5 capitalize font-bold rounded-lg transition-all ${
                      typeFilter === type
                        ? "bg-[#00c853] text-white shadow-sm"
                        : "text-slate-600 dark:text-[#8b949e]"
                    }`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 dark:bg-[#21262d] text-slate-500 dark:text-[#8b949e] font-bold border-b border-slate-100 dark:border-[#30363d] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Type</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Reference / Item</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#30363d]">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No transactions match your query.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            tx.type === "income"
                              ? "bg-green-100 text-[#00c853] dark:bg-green-950 dark:text-green-300"
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
                      <td className="p-4 font-bold text-slate-900 dark:text-[#e6edf3]">{tx.category}</td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{tx.reference}</td>
                      <td className="p-4 text-slate-500">{tx.date}</td>
                      <td className={`p-4 font-bold text-sm ${tx.type === "income" ? "text-[#00c853]" : "text-rose-600"}`}>
                        {tx.type === "income" ? "+" : "-"}{formatMoney(tx.amount)}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-[#8b949e] truncate max-w-xs">{tx.notes || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Log Income */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-100 dark:border-[#30363d] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-[#30363d]">
              <h3 className="font-bold text-slate-900 dark:text-[#e6edf3] text-base flex items-center gap-2">
                <span className="p-2 bg-emerald-50 dark:bg-emerald-950 text-[#00c853] rounded-xl">
                  <TrendingUp className="w-4 h-4" />
                </span>
                Log Farm Income
              </h3>
              <button onClick={() => setShowIncomeModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <form onSubmit={handleAddIncome} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Category *
                </label>
                <select
                  value={incomeForm.category}
                  onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-[#30363d] rounded-xl bg-slate-50 dark:bg-[#21262d] text-slate-900 dark:text-[#e6edf3]">
                  <option value="Crop Harvest">Crop Harvest / Sales</option>
                  <option value="Livestock Sale">Livestock Sale</option>
                  <option value="Equipment Rental">Equipment Rental Lease</option>
                  <option value="Government Grant">Government Grant / Subsidy</option>
                  <option value="Other Revenue">Other Revenue</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Amount ({farmCurrency}) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 500000"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-[#30363d] rounded-xl bg-slate-50 dark:bg-[#21262d] text-slate-900 dark:text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#00c853]/20 focus:border-[#00c853]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Transaction Date
                </label>
                <input
                  type="date"
                  required
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-[#30363d] rounded-xl bg-slate-50 dark:bg-[#21262d] text-slate-900 dark:text-[#e6edf3]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Reference / Buyer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grain Distributor Batch #A2"
                  value={incomeForm.reference}
                  onChange={(e) => setIncomeForm({ ...incomeForm, reference: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-[#30363d] rounded-xl bg-slate-50 dark:bg-[#21262d] text-slate-900 dark:text-[#e6edf3]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional details..."
                  value={incomeForm.notes}
                  onChange={(e) => setIncomeForm({ ...incomeForm, notes: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-[#30363d] rounded-xl bg-slate-50 dark:bg-[#21262d] text-slate-900 dark:text-[#e6edf3]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#00c853] hover:bg-[#00b04f] text-white rounded-full font-bold text-sm shadow-md transition-all">
                Save Income Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Expense */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-100 dark:border-[#30363d] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-[#30363d]">
              <h3 className="font-bold text-slate-900 dark:text-[#e6edf3] text-base flex items-center gap-2">
                <span className="p-2 bg-rose-50 dark:bg-rose-950 text-rose-600 rounded-xl">
                  <TrendingDown className="w-4 h-4" />
                </span>
                Log Farm Expense
              </h3>
              <button onClick={() => setShowExpenseModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Category *
                </label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-[#30363d] rounded-xl bg-slate-50 dark:bg-[#21262d] text-slate-900 dark:text-[#e6edf3]">
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
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Amount ({farmCurrency}) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 150000"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-[#30363d] rounded-xl bg-slate-50 dark:bg-[#21262d] text-slate-900 dark:text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Transaction Date
                </label>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-[#30363d] rounded-xl bg-slate-50 dark:bg-[#21262d] text-slate-900 dark:text-[#e6edf3]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Vendor / Item Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Agro Supplies Ltd"
                  value={expenseForm.reference}
                  onChange={(e) => setExpenseForm({ ...expenseForm, reference: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-[#30363d] rounded-xl bg-slate-50 dark:bg-[#21262d] text-slate-900 dark:text-[#e6edf3]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional details..."
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-[#30363d] rounded-xl bg-slate-50 dark:bg-[#21262d] text-slate-900 dark:text-[#e6edf3]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold text-sm shadow-md transition-all">
                Save Expense Transaction
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50 dark:bg-[#0d1117]">
          <div className="flex items-center gap-2 text-[#00c853] font-bold">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading Financials...
          </div>
        </div>
      }>
      <FinancialsContent />
    </Suspense>
  );
}
