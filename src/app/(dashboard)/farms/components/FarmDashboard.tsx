'use client';
import React, { useState } from 'react';

// Sample data to populate the task list
const tasks = [
  {
    id: 1,
    name: 'Check irrigation system',
    type: 'General',
    time: 'Today, 10:00 AM',
    priority: 'High',
    assignedTo: 'John Doe',
    assignedInitials: 'JD',
    status: 'pending',
  },
  {
    id: 2,
    name: 'Harvest tomatoes',
    type: 'Crop',
    time: 'Today, 2:00 PM',
    priority: 'Medium',
    assignedTo: 'Maria Garcia',
    assignedInitials: 'MG',
    status: 'pending',
  },
  {
    id: 3,
    name: 'Feed livestock',
    type: 'Livestock',
    time: 'Today, 8:00 AM',
    priority: 'High',
    assignedTo: 'Robert Chen',
    assignedInitials: 'RC',
    status: 'completed',
  },
];

const FarmOperationsContent = () => {
  const [activeFilter, setActiveFilter] = useState('Today');
  const [activeTaskType, setActiveTaskType] = useState('All');

  const getPriorityColor = (priority:string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500';
      case 'Medium':
        return 'bg-orange-400';
      case 'Low':
        return 'bg-green-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="flex flex-1 p-8 bg-gray-100 min-h-screen">
      <div className="flex flex-col w-full bg-white rounded-xl shadow-sm">

        {/* Top Header and Tabs */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold">Farm Operations</h1>
          <div className="flex items-center gap-2">
            <div className="flex space-x-1 p-1 bg-gray-200 rounded-lg">
              {['Task Planner', 'Calendar View', 'Inventory Management', 'Crop & Livestock Records', 'Equipment Usage', 'Labor & Productivity'].map((tab) => (
                <button
                  key={tab}
                  className={`py-2 px-4 rounded-md text-sm font-medium ${tab === 'Task Planner' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:bg-gray-300'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button className="bg-green-600 text-white font-semibold py-2 px-6 rounded-md shadow-sm hover:bg-green-700">
              New Task
            </button>
            <button className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-gray-300">
              Sync
            </button>
          </div>
        </div>

        {/* Main Content Area: Filters & Task List */}
        <div className="flex flex-1">
          {/* Left Filter Panel */}
          <div className="w-64 p-6 border-r border-gray-200">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">FILTER TASKS</h3>
            
            {['Today', 'This Week', 'Overdue', 'Completed'].map((filter) => (
              <div
                key={filter}
                className={`py-2 px-4 rounded-md cursor-pointer transition-colors duration-150 ${activeFilter === filter ? 'bg-gray-200 text-gray-800' : 'hover:bg-gray-100 text-gray-600'}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </div>
            ))}
            
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-4">TASK TYPES</h3>
            {['Crop Tasks', 'Livestock Tasks', 'General Tasks'].map((type) => (
              <div
                key={type}
                className={`flex items-center gap-2 py-2 px-4 rounded-md cursor-pointer transition-colors duration-150 ${activeTaskType === type ? 'bg-gray-200 text-gray-800' : 'hover:bg-gray-100 text-gray-600'}`}
                onClick={() => setActiveTaskType(type)}
              >
                <input type="checkbox" className="h-4 w-4 rounded text-green-600 focus:ring-green-500" checked={activeTaskType === type} readOnly />
                <span>{type}</span>
              </div>
            ))}
          </div>

          {/* Right Task List */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">TODAY'S TASKS (3)</h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search tasks..." 
                  className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <svg className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 text-gray-500 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      <span>{task.type}</span>
                      <span>•</span>
                      <span>{task.time}</span>
                    </div>
                    <h4 className="text-base font-semibold text-gray-900">{task.name}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 text-white ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-800 font-bold text-sm">{task.assignedInitials}</span>
                      <span className="text-sm text-gray-700">{task.assignedTo}</span>
                    </div>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <svg className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmOperationsContent;