"use client";
import { useState } from "react";
import {
  BookOpen, Sprout, BarChart2, Users, Bell,
  ShoppingCart, Settings, Search, TrendingUp, Brain, ChevronRight,
} from "lucide-react";

const SECTIONS = [
  {
    id: "getting-started",
    icon: BookOpen,
    title: "Getting Started",
    content: [
      {
        heading: "Creating your account",
        body: "Sign up at app.famtech.llc with your email. After verifying your email you'll be guided through completing your farm profile — farm name, location (country, state, LGA), and primary crops or livestock.",
      },
      {
        heading: "Completing your farm profile",
        body: "Navigate to Farm Operations → Your Farm to add your details. A complete profile lets the AI advisory give you more accurate, location-specific recommendations.",
      },
      {
        heading: "Inviting farm staff",
        body: "Go to Farm Operations → Staff Management and click 'Invite Staff'. Enter the staff member's email; they receive a secure invite link valid for 72 hours and then set their own password.",
      },
    ],
  },
  {
    id: "farm-operations",
    icon: Sprout,
    title: "Farm Operations",
    content: [
      {
        heading: "Crop Records",
        body: "Add and track your crops from planting to harvest. Each record captures crop name, variety, planting date, expected harvest date, growth stage, and health status.",
      },
      {
        heading: "Livestock Records",
        body: "Log your livestock (cattle, poultry, goats, fish, etc.) with breed, quantity, health status, and growth stage. Records feed directly into the Smart Advisory for feeding and health recommendations.",
      },
      {
        heading: "Health Monitoring",
        body: "The Crop Health section tracks disease diagnoses and treatment history. A 'poor' health status automatically triggers an alert on your dashboard.",
      },
      {
        heading: "Inventory Management",
        body: "Track farm inputs (seeds, fertilisers, pesticides) and outputs (harvested produce). Set low-stock thresholds and monitor usage over time.",
      },
      {
        heading: "Warehouse",
        body: "Record stored produce with quantity, storage location, and condition. Monitor stock levels and plan market dispatch from one place.",
      },
    ],
  },
  {
    id: "smart-advisory",
    icon: Brain,
    title: "Smart Advisory",
    content: [
      {
        heading: "What is Smart Advisory?",
        body: "Smart Advisory is an AI-powered assistant (Gemini AI) trained on agricultural best practices for Nigeria and West Africa. It answers questions about your specific crops, livestock, soil, weather, and market conditions.",
      },
      {
        heading: "Asking questions",
        body: "Type any farming question in the chat. You can attach a specific crop or livestock record to give the AI more context, making answers more accurate and farm-specific.",
      },
      {
        heading: "Quick categories",
        body: "Use the prompt cards — Crop Diagnosis, Livestock Rations, Weather Advisory, Soil Optimizations — to start a focused conversation quickly.",
      },
      {
        heading: "Dashboard widget",
        body: "Your latest advisory response appears on the dashboard card so you always see your most recent insight without opening the full session.",
      },
    ],
  },
  {
    id: "market-prices",
    icon: TrendingUp,
    title: "Market Live Prices",
    content: [
      {
        heading: "Live price data",
        body: "The Market Prices page shows algorithmically predicted prices for 25 Nigerian crops, adjusted for real weather conditions, seasonal patterns, inflation, fuel prices, and market news.",
      },
      {
        heading: "Price categories",
        body: "Filter crops by Grains, Legumes, Tubers, Vegetables, Fruits, Cash Crops, and Spices. Use the search bar to find a specific crop quickly.",
      },
      {
        heading: "Regional pricing",
        body: "Select your state from the dropdown to see region-adjusted prices that reflect local supply/demand and logistics costs.",
      },
      {
        heading: "Price history",
        body: "Click any crop card to expand a 30-day price history chart — helpful for identifying trends and choosing the best time to buy inputs or sell produce.",
      },
      {
        heading: "Market alerts",
        body: "When a crop price moves more than 15%, you automatically receive an alert on your dashboard with a buy or sell recommendation.",
      },
    ],
  },
  {
    id: "reports",
    icon: BarChart2,
    title: "Reports & Analytics",
    content: [
      {
        heading: "Farm reports",
        body: "Generate detailed reports covering crop performance, yield comparisons, revenue vs expenses, and livestock growth metrics. Reports can be exported as PDF.",
      },
      {
        heading: "Analytics dashboard",
        body: "The Analytics section gives you a visual overview of your farm's performance over time — crop health trends, inventory turnover, and financial summaries.",
      },
    ],
  },
  {
    id: "staff",
    icon: Users,
    title: "Staff Management",
    content: [
      {
        heading: "Invite-only access",
        body: "Famtech uses an invite-only model — only farmers can add staff. Staff cannot self-register, giving you full control over who accesses your farm data.",
      },
      {
        heading: "Invite flow",
        body: "Go to Staff Management → Invite Staff, enter the staff member's email, and they receive a secure link (valid 72 hours) to set their password and gain access.",
      },
      {
        heading: "Staff roles",
        body: "Staff log in using the 'Farm Staff' role on the login page. They have access to task management and farm operations but not billing or account settings.",
      },
      {
        heading: "Revoking access",
        body: "Deactivate a staff member at any time from the Staff Management page — access is revoked immediately.",
      },
    ],
  },
  {
    id: "alerts",
    icon: Bell,
    title: "Alerts & Notifications",
    content: [
      {
        heading: "Automatic alerts",
        body: "Famtech checks for issues every 6 hours and generates alerts for: weather risks (drought, flood, extreme heat) in your state, price movements above 15%, poor crop health, and upcoming harvests (7-day reminder).",
      },
      {
        heading: "Notification bell",
        body: "The bell icon in the top navigation shows unread notifications. Tap an alert to read it, then mark it done to clear it.",
      },
      {
        heading: "Dashboard Alerts card",
        body: "The Alerts card shows your 4 most recent alerts. Tap '✓ Done' to acknowledge an alert and remove it from the list.",
      },
    ],
  },
  {
    id: "marketplace",
    icon: ShoppingCart,
    title: "Marketplace",
    content: [
      {
        heading: "Coming soon",
        body: "The Marketplace will allow farmers to list produce for sale, connect with buyers, and access agro-input suppliers. The Market Trends widget on your dashboard is a preview of the price intelligence that will power the marketplace.",
      },
    ],
  },
  {
    id: "settings",
    icon: Settings,
    title: "Settings",
    content: [
      {
        heading: "Profile settings",
        body: "Update your name, email, phone number, and profile photo under Settings → Profile.",
      },
      {
        heading: "Farm settings",
        body: "Edit your farm name, location, and primary produce under Settings → Farm Settings.",
      },
      {
        heading: "Notification preferences",
        body: "Control which alerts and notifications you receive under Settings → Notifications.",
      },
      {
        heading: "Subscription & billing",
        body: "View your current plan and manage your subscription under Settings → Subscription.",
      },
    ],
  },
];

export default function DocumentationPage() {
  const [activeId, setActiveId] = useState("getting-started");
  const [query, setQuery] = useState("");

  const active = SECTIONS.find((s) => s.id === activeId)!;
  const idx = SECTIONS.findIndex((s) => s.id === activeId);

  const filtered = query.trim()
    ? SECTIONS.map((s) => ({
        ...s,
        content: s.content.filter(
          (c) =>
            c.heading.toLowerCase().includes(query.toLowerCase()) ||
            c.body.toLowerCase().includes(query.toLowerCase())
        ),
      })).filter((s) => s.content.length > 0)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] pb-12">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-[#4ade80]" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-[#e6edf3]">Documentation</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-[#8b949e] ml-12">
            Everything you need to know about using Famtech.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documentation…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] text-gray-900 dark:text-[#e6edf3] placeholder-gray-400 dark:placeholder-[#484f58] focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {filtered ? (
          /* Search results */
          <div className="space-y-5">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-[#8b949e]">No results for &quot;{query}&quot;</p>
            ) : (
              filtered.map((section) => (
                <div
                  key={section.id}
                  className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-[#30363d] p-5"
                >
                  <h2 className="text-sm font-bold text-gray-800 dark:text-[#e6edf3] mb-4">{section.title}</h2>
                  <div className="space-y-4">
                    {section.content.map((item, i) => (
                      <div key={i}>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-[#c9d1d9] mb-1 flex items-center gap-1.5">
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          {item.heading}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-[#8b949e] leading-relaxed pl-5">
                          {item.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col gap-1 w-52 shrink-0">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveId(s.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-left transition-colors ${
                      activeId === s.id
                        ? "bg-emerald-600 text-white"
                        : "text-gray-600 dark:text-[#8b949e] hover:bg-gray-100 dark:hover:bg-[#21262d] hover:text-gray-900 dark:hover:text-[#e6edf3]"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {s.title}
                  </button>
                );
              })}
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-[#30363d] p-6">
                {/* Section header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-[#30363d]">
                  {(() => {
                    const Icon = active.icon;
                    return (
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-emerald-600 dark:text-[#4ade80]" />
                      </div>
                    );
                  })()}
                  <h2 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">{active.title}</h2>
                </div>

                {/* Content items */}
                <div className="space-y-6">
                  {active.content.map((item, i) => (
                    <div key={i} className="border-l-2 border-emerald-200 dark:border-emerald-900 pl-4">
                      <h3 className="text-sm font-bold text-gray-800 dark:text-[#e6edf3] mb-1.5">
                        {item.heading}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-[#8b949e] leading-relaxed">{item.body}</p>
                    </div>
                  ))}
                </div>

                {/* Prev / Next */}
                <div className="flex justify-between items-center mt-8 pt-5 border-t border-gray-100 dark:border-[#30363d]">
                  {idx > 0 ? (
                    <button
                      onClick={() => setActiveId(SECTIONS[idx - 1].id)}
                      className="text-xs font-bold text-emerald-600 dark:text-[#4ade80] hover:underline"
                    >
                      ← {SECTIONS[idx - 1].title}
                    </button>
                  ) : (
                    <span />
                  )}
                  {idx < SECTIONS.length - 1 && (
                    <button
                      onClick={() => setActiveId(SECTIONS[idx + 1].id)}
                      className="text-xs font-bold text-emerald-600 dark:text-[#4ade80] hover:underline"
                    >
                      {SECTIONS[idx + 1].title} →
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile section grid */}
              <div className="md:hidden mt-4 grid grid-cols-2 gap-2">
                {SECTIONS.filter((s) => s.id !== activeId).map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveId(s.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex items-center gap-2 p-3 bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-xl text-xs font-semibold text-gray-600 dark:text-[#8b949e]"
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {s.title}
                    </button>
                  );
                })}
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
