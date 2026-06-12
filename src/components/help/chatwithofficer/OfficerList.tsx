'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Mail, Phone, MessageSquare, User } from 'lucide-react';
import type { Officer } from './OfficerProfile1';

interface OfficerListProps {
  officers: Officer[];
  onViewProfile: (officer: Officer) => void;
  onStartChat: (officer: Officer) => void;
}

export default function OfficerList({ officers, onViewProfile, onStartChat }: OfficerListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOfficers = officers.filter(officer => 
    officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    officer.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-4 p-2">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter officers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition"
        />
      </div>

      {/* Officers List */}
      <div className="space-y-3">
        {filteredOfficers.length === 0 ? (
          <p className="text-center text-xs text-slate-400 font-medium py-6">No officers found matching search query.</p>
        ) : (
          filteredOfficers.map(officer => (
            <div 
              key={officer.id} 
              className="p-3.5 border border-slate-100 hover:border-emerald-500/20 hover:bg-slate-50/35 rounded-xl transition duration-200 group"
            >
              <div className="flex items-start gap-3.5 mb-3">
                <div className="relative flex-shrink-0">
                  <Image 
                    src={officer.photo} 
                    alt={officer.name} 
                    width={48} 
                    height={48} 
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100 group-hover:scale-[1.02] transition" 
                  />
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                    officer.status === 'Online' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-slate-800 text-xs truncate group-hover:text-emerald-700 transition">
                      {officer.name}
                    </h4>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                      {officer.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                    {officer.specialty}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                    {officer.location}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={() => onViewProfile(officer)}
                  className="flex-1 py-1.5 border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg transition"
                >
                  View Profile
                </button>
                <button 
                  onClick={() => onStartChat(officer)}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition shadow-sm shadow-emerald-600/5 flex items-center justify-center gap-1"
                >
                  <MessageSquare className="h-3 w-3" /> Chat
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}