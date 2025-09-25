"use client";

import React, { useState } from 'react';
import {Calendar,Grid,ClipboardList,Leaf} from 'lucide-react';
import InventoryManagement from '@/components/farm-operation/InventoryManagement';
import CropLivestockRecords from '@/components/farm-operation/CropLivestockRecords';

import CalendarView from '@/components/farm-operation/CalenderView';
import TaskPlanner from '@/components/farm-operation/TaskPlanner';



// Header component for the top navigation bar
const Header: React.FC = () => (
  <header className="flex items-center justify-end p-4 py-6bg-white border-b border-gray-200">
    <div className="flex items-end space-x-4">
      <span className="text-sm text-gray-600">
        <span className="font-semibold text-gray-800">24°C</span> Lagos
      </span>
      <span className="text-sm text-gray-600 font-semibold">
        Today: Check maize fields for pest activity
      </span>
    </div>
  </header>
);

// Tab navigation for different farm operation screens
interface FarmOperationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const FarmOperationTabs: React.FC<FarmOperationTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { label: 'Task Planner', icon: <ClipboardList />, tab: 'Task Planner' },
    { label: 'Calendar View', icon: <Calendar />, tab: 'Calendar View' },
    { label: 'Inventory Management', icon: <Grid />, tab: 'Inventory Management' },
    { label: 'Crop & Livestock Records', icon: <Leaf />, tab: 'Crop & Livestock Records' },
    
  ];
  return (
    <>
      <div className="flex justify-between px-2 md:px-4 items-center mb-6">
        <h1 className="text-3xl font-semibold text-green-600 mt-4">Farm Operations</h1>

      </div>
      <div className="flex flex-wrap items-center justify-start border-b border-gray-200 mb-6 -mt-2">
        {tabs.map((tab) => (
          <button
            key={tab.tab}
            onClick={() => setActiveTab(tab.tab)}
            className={`flex items-center px-4 py-4 pt-6 text-sm font-medium transition-colors duration-200
            ${activeTab === tab.tab
                ? 'border-b-2 border-green-600 text-green-700'
                : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-400'}`}
          >
            {React.cloneElement(tab.icon, { className: 'h-4 w-4 mr-2' })}
            {tab.label}
          </button>
        ))}
      </div>
    </>
  );
};

const pageComponents: { [key: string]: React.FC } = {
  'Task Planner': TaskPlanner,
  'Calendar View': CalendarView,
  'Inventory Management': InventoryManagement,
  'Crop & Livestock Records': CropLivestockRecords,
  
};

// Main component that combines the header, tabs, and content views
const FarmOperations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Task Planner');
  const PageComponent = pageComponents[activeTab];

  return (
    <div className="min-h-screen flex flex-col bg:white">
      <FarmOperationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-auto">
        <PageComponent />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <Header />
      <FarmOperations />
    </div>
  );
};

export default App;