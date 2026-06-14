'use client';

import React, { useState } from 'react';
import { Share2, Download, Search, Calendar, AlertCircle, Droplets, CloudRain, Cpu, Award } from 'lucide-react';

interface AdviceItem {
  id: string;
  category: 'Cattle' | 'Wheat' | 'Tomato';
  icon: string;
  date: string;
  type: string;
  advice: string;
  reminder: string;
}

export default function SmartDiaryPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const adviceList: AdviceItem[] = [
    {
      id: '1',
      category: 'Cattle',
      icon: '🐄',
      date: 'June 18, 2026 - 08:00 AM',
      type: 'Nutrition Plan',
      advice: 'Increase protein content to 16% during lactation period. Add mineral supplements containing zinc and copper.',
      reminder: 'Observe or inspect your animal daily to track digestion and milk yield developments.',
    },
    {
      id: '2',
      category: 'Wheat',
      icon: '🌾',
      date: 'June 19, 2026 - 09:30 AM',
      type: 'Harvest Timing',
      advice: 'Monitor moisture content. Harvest when grain moisture is between 12–14% for optimal warehouse storage and minimal mold risk.',
      reminder: 'Check test fields daily starting next Monday.',
    },
    {
      id: '3',
      category: 'Tomato',
      icon: '🍅',
      date: 'June 20, 2026 - 11:15 AM',
      type: 'Blight Prevention',
      advice: 'Apply organic copper-based fungicide every 7–10 days during high-humidity periods. Ensure proper plant spacing for air circulation.',
      reminder: 'Follow-up field diagnostic call scheduled for next Thursday.',
    },
  ];

  const filteredAdvice = adviceList.filter(item => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      item.advice.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">

      {/* Purpose Banner */}
      <div className="bg-white dark:bg-[#161b22] border border-slate-100 dark:border-[#30363d] rounded-2xl p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-[#e6edf3] uppercase tracking-wider">Purpose of Smart Diary</h3>
        <p className="text-xs font-semibold text-slate-500 dark:text-[#8b949e] leading-relaxed">
          The Smart Diary enhances agricultural operations by digitizing record-keeping and preserving communication between certified extension officers and your farm teams. It boosts planning accuracy, facilitates historical lookups, and secures expert prescriptions in one unified archive.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left: Saved Advice */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#161b22] border border-slate-100 dark:border-[#30363d] rounded-2xl p-6 shadow-sm space-y-6">

            {/* Header controls */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-[#e6edf3]">Saved Advice & Recommendations</h3>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-[#8b949e]">Your curated logs of advice and treatment protocols.</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-slate-100 dark:border-[#30363d] hover:border-slate-200 dark:hover:border-[#444d56] bg-white dark:bg-[#21262d] hover:bg-slate-50 dark:hover:bg-[#30363d] text-slate-700 dark:text-[#e6edf3] text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm">
                  <Share2 className="h-3.5 w-3.5 text-slate-400 dark:text-[#8b949e]" /> Share
                </button>
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/10">
                  <Download className="h-3.5 w-3.5" /> Export PDF
                </button>
              </div>
            </div>

            {/* Filter + Search */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Cattle', 'Wheat', 'Tomato'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition ${
                      activeCategory === cat
                        ? 'bg-emerald-50 dark:bg-[#0d2a1a] text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                        : 'bg-white dark:bg-[#21262d] text-slate-600 dark:text-[#8b949e] border-slate-100 dark:border-[#30363d] hover:bg-slate-50 dark:hover:bg-[#30363d]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8b949e]" />
                <input
                  type="text"
                  placeholder="Search prescriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-slate-50 dark:bg-[#21262d] border border-slate-100 dark:border-[#30363d] text-slate-800 dark:text-[#e6edf3] placeholder-slate-400 dark:placeholder-[#8b949e] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Advice Cards */}
            <div className="space-y-4 pt-2">
              {filteredAdvice.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-[#30363d] rounded-xl">
                  <p className="text-xs text-slate-400 dark:text-[#8b949e] font-bold">No diary entries found.</p>
                </div>
              ) : (
                filteredAdvice.map(item => (
                  <div key={item.id} className="p-4 border border-slate-100 dark:border-[#30363d] bg-slate-50/20 dark:bg-[#21262d]/30 rounded-xl space-y-3.5 hover:border-slate-200 dark:hover:border-[#444d56] transition">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-1.5 bg-white dark:bg-[#21262d] border border-slate-100 dark:border-[#30363d] rounded-xl shadow-sm leading-none">{item.icon}</span>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-[#e6edf3] text-sm">{item.category} Advice</h4>
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-[#8b949e] font-bold uppercase tracking-wider mt-0.5">
                            <Calendar className="h-3 w-3" /> {item.date}
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100/50 dark:border-blue-800/40 uppercase tracking-wide">
                        {item.type}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-[#8b949e] font-bold uppercase tracking-wider">Expert Advice</p>
                        <p className="font-semibold text-slate-700 dark:text-[#e6edf3] leading-relaxed mt-0.5">{item.advice}</p>
                      </div>
                      <div className="flex items-start gap-1.5 bg-amber-50/40 dark:bg-amber-900/10 border border-amber-100/35 dark:border-amber-800/30 px-3 py-2 rounded-lg mt-1 text-amber-900 dark:text-amber-400">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wide">Reminder</p>
                          <p className="text-[11px] font-semibold leading-relaxed mt-0.5">{item.reminder}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Smart Recommendations */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-[#161b22] border border-slate-100 dark:border-[#30363d] rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-[#e6edf3] uppercase tracking-wider">Smart Recommendations</h3>
              <p className="text-[11px] text-slate-400 dark:text-[#8b949e] font-medium">Best practices to optimize yield and resource use.</p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: CloudRain, bg: 'bg-emerald-50 dark:bg-[#0d2a1a]', color: 'text-emerald-600',
                  title: 'Weather-Driven Scheduling',
                  text: 'Always align seeding, spraying, and harvest tasks with local radar. Avoid fertilizer application if heavy rain is forecast within 24 hours.',
                },
                {
                  icon: Cpu, bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-600',
                  title: 'Precision Soil Sensors',
                  text: 'Install soil moisture monitors at key crop quadrants to schedule irrigation. This prevents dry-stress and avoids nitrogen leaching.',
                },
                {
                  icon: Droplets, bg: 'bg-teal-50 dark:bg-teal-900/20', color: 'text-teal-600',
                  title: 'Automate Drip Systems',
                  text: 'Use automatic timers to irrigate early in the morning, which cuts water loss through midday evaporation by up to 40%.',
                },
                {
                  icon: Award, bg: 'bg-amber-50 dark:bg-amber-900/20', color: 'text-amber-600',
                  title: 'Certified Seed Inputs',
                  text: 'Procure seeds only from licensed digital distributors. Verify security QR codes to confirm viability rate and blight-resistance.',
                },
              ].map(({ icon: Icon, bg, color, title, text }) => (
                <div key={title} className="flex gap-3.5 items-start">
                  <div className={`p-2 ${bg} rounded-xl ${color} flex-shrink-0 mt-0.5`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-[#e6edf3]">{title}</h4>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-[#8b949e] leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
