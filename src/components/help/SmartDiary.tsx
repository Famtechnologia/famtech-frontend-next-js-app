'use client';

import React, { useState } from 'react';
import { Share2, Download, Search, Calendar, Tag, AlertCircle, Droplets, CloudRain, Cpu, Award } from 'lucide-react';

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
      advice: 'Monitor moisture content. Harvest when grain moisture is between 12-14% for optimal warehouse storage and minimal mold risk.',
      reminder: 'Check test fields daily starting next Monday.',
    },
    {
      id: '3',
      category: 'Tomato',
      icon: '🍅',
      date: 'June 20, 2026 - 11:15 AM',
      type: 'Blight Prevention',
      advice: 'Apply organic copper-based fungicide every 7-10 days during high-humidity periods. Ensure proper plant spacing for air circulation.',
      reminder: 'Follow-up field diagnostic call scheduled for next Thursday.',
    }
  ];

  const filteredAdvice = adviceList.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.advice.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Purpose Banner */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Purpose of Smart Diary</h3>
        <p className="text-xs font-semibold text-slate-500 leading-relaxed">
          The Smart Diary enhances agricultural operations by digitizing record-keeping and preserving communication between certified extension officers and your farm teams. It boosts planning accuracy, facilitates historical lookups, and secures expert prescriptions in one unified archive.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Saved Advice (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Saved Advice & Recommendations</h3>
                <p className="text-[11px] font-semibold text-slate-400">Your curated logs of advice and treatment protocols.</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm">
                  <Share2 className="h-3.5 w-3.5 text-slate-400" /> Share
                </button>
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/10">
                  <Download className="h-3.5 w-3.5" /> Export PDF
                </button>
              </div>
            </div>

            {/* Filter tags & Search */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Cattle', 'Wheat', 'Tomato'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition ${
                      activeCategory === cat 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search prescriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Advice Grid */}
            <div className="space-y-4 pt-2">
              {filteredAdvice.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-400 font-bold">No diary entries found.</p>
                </div>
              ) : (
                filteredAdvice.map(item => (
                  <div key={item.id} className="p-4 border border-slate-100 bg-slate-50/20 rounded-xl space-y-3.5 hover:border-slate-200 transition">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-1.5 bg-white border border-slate-100 rounded-xl shadow-sm leading-none">{item.icon}</span>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{item.category} Advice</h4>
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            <Calendar className="h-3 w-3" /> {item.date}
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100/50 uppercase tracking-wide">
                        {item.type}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expert Advice</p>
                        <p className="font-semibold text-slate-700 leading-relaxed mt-0.5">{item.advice}</p>
                      </div>
                      <div className="flex items-start gap-1.5 bg-amber-50/40 border border-amber-100/35 px-3 py-2 rounded-lg mt-1 text-amber-900">
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

        {/* Right Column: Smart Farming Tips (1/3 width) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Smart Recommendations</h3>
              <p className="text-[11px] text-slate-400 font-medium">Best practices to optimize yield and resource use.</p>
            </div>

            <div className="space-y-6">
              
              {/* Tip 1 */}
              <div className="flex gap-3.5 items-start">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 flex-shrink-0 mt-0.5">
                  <CloudRain className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800">Weather-Driven Scheduling</h4>
                  <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                    Always align seeding, spraying, and harvest tasks with local radar. Avoid fertilizer application if heavy rain is forecast within 24 hours.
                  </p>
                </div>
              </div>

              {/* Tip 2 */}
              <div className="flex gap-3.5 items-start">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600 flex-shrink-0 mt-0.5">
                  <Cpu className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800">Precision Soil Sensors</h4>
                  <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                    Install soil moisture monitors at key crop quadrants to schedule irrigation. This prevents dry-stress and avoids nitrogen leaching.
                  </p>
                </div>
              </div>

              {/* Tip 3 */}
              <div className="flex gap-3.5 items-start">
                <div className="p-2 bg-teal-50 rounded-xl text-teal-600 flex-shrink-0 mt-0.5">
                  <Droplets className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800">Automate Drip Systems</h4>
                  <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                    Use automatic timers to irrigate early in the morning, which cuts water loss through midday evaporation by up to 40%.
                  </p>
                </div>
              </div>

              {/* Tip 4 */}
              <div className="flex gap-3.5 items-start">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600 flex-shrink-0 mt-0.5">
                  <Award className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800">Certified Seed Inputs</h4>
                  <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                    Procure seeds only from licensed digital distributors. Verify security QR codes to confirm viability rate and blight-resistance.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
