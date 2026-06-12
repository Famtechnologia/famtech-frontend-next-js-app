'use client';

import React, { useState } from 'react';
import StartChatPage from '@/components/help/Chat';
import ChatWithOfficerPage from '@/components/help/ChatWithOfficer';
import SmartDiaryPage from '@/components/help/SmartDiary';
import { MessageSquare, Users, BookOpen, UserCheck } from 'lucide-react';

type TabId = 'chat' | 'officer' | 'diary';

export default function ExtensionOfficerDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('chat');

  // Helper to determine which content to render
  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <StartChatPage onConnect={() => setActiveTab('officer')} />;
      case 'officer':
        return <ChatWithOfficerPage />;
      case 'diary':
        return <SmartDiaryPage />;
      default:
        return <StartChatPage onConnect={() => setActiveTab('officer')} />;
    }
  };

  const tabs = [
    { 
      id: 'chat', 
      label: 'Start Chat', 
      icon: MessageSquare
    },
    { 
      id: 'officer', 
      label: 'Chat with Officer', 
      icon: Users
    },
    { 
      id: 'diary', 
      label: 'Smart Diary', 
      icon: BookOpen
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-6">
      
      {/* Top Banner Tab Navigator */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 md:p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
              Extension Officer Support
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-full uppercase tracking-wider border border-emerald-100/50">
              Premium
            </span>
          </div>
        </div>

        {/* Tabs Grid */}
        <div className="flex flex-col sm:flex-row border-b border-slate-100 gap-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`
                  flex items-center justify-center sm:justify-start gap-2.5 px-6 py-3.5 text-xs font-bold transition-all duration-200 border-b-2 -mb-[2px]
                  ${isActive
                    ? 'text-emerald-700 border-emerald-600 bg-emerald-50/30'
                    : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50/50'
                  }
                `}
              >
                <IconComponent className="h-4.5 w-4.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Component Content */}
      <div className="transition-all duration-200">
        {renderContent()}
      </div>

    </div>
  );
}