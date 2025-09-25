// ExtensionOfficerDashboard.tsx
'use client';
import React, { useState } from 'react';
import StartChatPage from '@/components/help/Chat';
import ChatWithOfficerPage from '@/components/help/ChatWithOfficer';
import SmartDiaryPage from '@/components/help/SmartDiary';

const ExtensionOfficerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'officer' | 'diary'>('chat');

  // Helper to determine which content to render
  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <StartChatPage />;
      case 'officer':
        return <ChatWithOfficerPage />;
      case 'diary':
        return <SmartDiaryPage />;
      default:
        return <StartChatPage />;
    }
  };

 const tabs = [
    { 
      id: 'chat', 
      label: 'Start Chat', 
      icon: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: 'officer', 
      label: 'Chat with Officer', 
      icon: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: 'diary', 
      label: 'Smart Diary', 
      icon: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13.5m0-13.5c-4.483-1.077-8.232-2.147-11-3.235-.91.436-1.5 1.401-1.5 2.506C-.5 7.747 1.5 9.5 4.5 10.5c3.5 1.5 7.5 1.5 11 0 3-1 5-2.5 5-4.5 0-1.105-.59-2.07-1.5-2.506-2.768 1.088-6.517 2.158-11 3.235z" />
        </svg>
      )
    },
  ];

  return (
    <div className="p-2 md:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Extension Officer Chat</h2>
            <span className="ml-2 px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-200 rounded-full">
              Premium
            </span>
          </div>
        </div>
        <p className="text-gray-600 mb-6">
          Trusted support for your farm — chat, upload photos, and get expert answers.
        </p>

        <div className="flex space-x-4 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'chat' | 'officer' | 'diary')}
              className={`
                flex items-center px-6 py-3 font-medium transition-colors duration-200
                ${activeTab === tab.id
                  ? 'text-green-700 border-b-2 border-green-500'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default ExtensionOfficerDashboard;