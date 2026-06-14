'use client';

import React, { useState } from 'react';
import OfficerList from './chatwithofficer/OfficerList';
import DefaultChatView from './chatwithofficer/DefaultChatView';
import OfficerProfile, { Officer } from './chatwithofficer/OfficerProfile1';
import ChatWindow from './chatwithofficer/ChatWindow';
import { MessageSquare, UserCheck } from 'lucide-react';

export default function ChatWithOfficerPage() {
  const [activeScreen, setActiveScreen] = useState<'default' | 'chat' | 'profile'>('default');
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);

  const officers: Officer[] = [
    {
      id: 1,
      name: 'Grace Adebayo',
      specialty: 'Crop Science & Pest Management',
      photo: '/images/help/officer 2.png',
      status: 'Online',
      hasUnread: true,
      location: 'Oyo State, Nigeria',
      bio: 'A certified Crop Science Specialist with over 8 years of field experience helping smallholder farmers identify crop diseases, optimize soil inputs, and adopt integrated pest management practices.',
      responsibilities: {
        diagnostics: ['Identify fungal, bacterial, and pest crop infestations.', 'Recommend organic and safe chemical treatment regimens.'],
        soilPrep: ['Advise on pre-planting soil preparations and companion planting techniques.'],
      },
      contact: { email: 'grace.adebayo@famtech.llc', phone: '+234 803 111 2222' },
    },
    {
      id: 2,
      name: 'Ibrahim Musa',
      specialty: 'Livestock & Veterinary Services',
      photo: '/images/help/officer 1.png',
      status: 'Away',
      hasUnread: false,
      location: 'Kaduna State, Nigeria',
      bio: 'Veterinary expert focused on livestock health, poultry nutrition, breeding guidelines, and farm biosecurity controls across sub-Saharan pastoral systems.',
      responsibilities: {
        healthcare: ['Diagnose livestock diseases and direct vaccine calendars.', 'Provide animal husbandry best practices.'],
        nutrition: ['Offer feeding ratios and forage preservation recommendations.'],
      },
      contact: { email: 'ibrahim.musa@famtech.llc', phone: '+234 809 333 4444' },
    },
    {
      id: 3,
      name: 'Ngozi Chukwuma',
      specialty: 'Soil Health & Organic Farming',
      photo: '/images/help/officer 3.png',
      status: 'Online',
      hasUnread: false,
      location: 'Enugu State, Nigeria',
      bio: 'Soil microbiologist promoting sustainable organic agriculture, organic waste composting, and natural fertilizer alternatives to rebuild depleted topsoil.',
      responsibilities: {
        soilHealth: ['Conduct virtual soil structure analysis.', 'Formulate compost teas and organic NPK substitutes.'],
        sustainability: ['Train farmers on crop rotation and soil water retention.'],
      },
      contact: { email: 'ngozi.chukwuma@famtech.llc', phone: '+234 812 555 6666' },
    },
  ];

  const handleViewProfileClick = (officer: Officer) => { setSelectedOfficer(officer); setActiveScreen('profile'); };
  const handleStartChatClick  = (officer: Officer) => { setSelectedOfficer(officer); setActiveScreen('chat'); };
  const handleBackToList      = ()                  => { setActiveScreen('default'); setSelectedOfficer(null); };

  const renderContent = () => {
    switch (activeScreen) {
      case 'default':
        return (
          <div className="bg-white dark:bg-[#161b22] border border-slate-100 dark:border-[#30363d] rounded-2xl p-8 shadow-sm flex items-center justify-center min-h-[450px]">
            <DefaultChatView />
          </div>
        );
      case 'profile':
        if (!selectedOfficer) return null;
        return <OfficerProfile officer={selectedOfficer} onStartChat={handleStartChatClick} />;
      case 'chat':
        if (!selectedOfficer) return null;
        return <ChatWindow officer={selectedOfficer} onBack={handleBackToList} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-emerald-100 border border-white/10 uppercase tracking-wide">
            <UserCheck className="h-3.5 w-3.5" /> Certified Support
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
            Consult Agricultural Extension Officers
          </h2>
          <p className="text-sm text-emerald-100 font-medium max-w-xl leading-relaxed">
            Get personalized field guidance on pests, livestock feeding, soil analysis, and organic cultivation directly from certified regional experts.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-xs font-semibold text-white shrink-0">
          <MessageSquare className="h-4 w-4 text-emerald-300" /> Responses: Within 2hr
        </div>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left: Officer List */}
        <div className={`lg:col-span-1 ${activeScreen !== 'default' && activeScreen !== 'profile' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white dark:bg-[#161b22] border border-slate-100 dark:border-[#30363d] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-[#30363d] bg-slate-50/50 dark:bg-[#21262d]/50">
              <h3 className="text-sm font-bold text-slate-800 dark:text-[#e6edf3] uppercase tracking-wider">Available Experts</h3>
              <p className="text-[11px] text-slate-400 dark:text-[#8b949e] font-medium">Select an officer to consult or view profile</p>
            </div>
            <div className="p-2">
              <OfficerList
                officers={officers}
                onViewProfile={handleViewProfileClick}
                onStartChat={handleStartChatClick}
              />
            </div>
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className={`lg:col-span-2 ${activeScreen === 'default' && 'hidden lg:block'} ${activeScreen === 'profile' && 'block'} lg:block`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
