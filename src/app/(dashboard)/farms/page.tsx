"use client";

import React, { useState } from 'react';
import {


  Plus,
  CheckCheck,

  Search,
  CheckCircle,
  CalendarCheck,
  Calendar,
  Grid,
  ChevronRight,
  ClipboardList,
  Leaf,
  RefreshCcw,
  Users,
  HardHat,
  Filter,
  TriangleAlert,
  X,
  Download,
  FolderOpen,
  Camera,
  Heart,
  FileText,
  Syringe,
  Pill,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Image from 'next/image';
// Interfaces for data objects
interface Task {
  id: number;
  type: string;
  name: string;
  time: string;
  user: string;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  status: string;
  description: string;
  notes?: string;
  dueDate?: string;
}

interface CropRecord {
  id: number;
  name: string;
  location: string;
  planted: string;
  growth: string;
  maturity: string;
  image: string;
  health: 'Good' | 'Excellent' | 'Fair' | 'Poor';
  issues: { text: string }[];
  breed?: string;
  count?: number;
  age?: string;
  lastCheckup?: string;
  feed?: string;
}

interface LivestockRecord {
  id: number;
  name: string;
  breed: string;
  count: number;
  age: string;
  feed: string;
  lastCheckup: string;
  image: string;
  health: 'Good' | 'Excellent' | 'Fair' | 'Poor';
  issues: { text: string }[];
  planted?: string;
  growth?: string;
  maturity?: string;
  location?: string;
}

interface InventoryItem {
  name: string;
  quantity: number;
  reorder: number;
  usage: number;
  expiry: string;
  status: string;
}




// Header component for the top navigation bar
const Header: React.FC = () => (
  <header className="flex items-center justify-end p-4 py-6 bg-gray-100 border-b border-gray-200">
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
    { label: 'Equipment Usage', icon: <HardHat />, tab: 'Equipment Usage' },
    { label: 'Labor & Productivity', icon: <Users />, tab: 'Labor & Productivity' },
  ];
  return (
    <>
      <div className="flex justify-between px-2 md:px-4 items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Farm Operations</h1>

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

// TaskForm Component
interface TaskFormProps {
  onClose: () => void;
  task: Task | null;
  mode: 'new' | 'edit';
}

const TaskForm: React.FC<TaskFormProps> = ({ onClose, task, mode }) => {
  const [status, setStatus] = useState<string>(task?.status || 'Pending');
  const [priority, setPriority] = useState<string>(task?.priority || 'Low');
  const [assignedTo, setAssignedTo] = useState<string>(task?.user || 'JD');

  const users = [
    { id: 'JD', name: 'John Doe' },
    { id: 'MG', name: 'Maria Garcia' },
    { id: 'RC', name: 'Robert Chen' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
          <select
            id="assignedTo"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
        <input type="text" id="dueDate" value={task?.dueDate || "Today, 10:00 AM"} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          id="description"
          rows={4}
          defaultValue={task?.description || "No description provided."}
          className="w-full p-2 border border-gray-300 rounded-md resize-none text-gray-800"
        ></textarea>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          id="notes"
          rows={2}
          defaultValue={task?.notes || "Add notes here..."}
          className="w-full p-2 border border-gray-300 rounded-md resize-none text-gray-800"
        ></textarea>
      </div>

      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">Attachments</div>
        <button className="flex items-center justify-center w-full py-4 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:bg-gray-50">
          <Plus className="h-5 w-5 mr-2" /> Add Attachment
        </button>
      </div>

      {/* Modal Footer */}
      <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
        {mode === 'edit' && (
          <button className="px-4 py-2 text-sm font-medium text-red-600 rounded-md border border-gray-300 hover:bg-red-50">
            Delete Task
          </button>
        )}
        <button className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100" onClick={onClose}>
          Cancel
        </button>
        <button className="px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700">
          {mode === 'new' ? 'Create Task' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

// TaskPlanner component with filtering and search functionality
const TaskPlanner: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('Today');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalMode, setModalMode] = useState<'new' | 'edit'>('new');

  const tasks: Task[] = [
    { id: 1, type: 'General', name: 'Check irrigation system', time: '10:00 AM', user: 'JD', priority: 'High', completed: true, status: 'Completed', description: 'Inspect the irrigation system in the east field for any leaks or blockages. Report any issues immediately.', notes: 'Previous inspection found a minor leak in section 3, check if it has been fixed.' },
    { id: 2, type: 'Crop', name: 'Harvest tomatoes', time: '2:00 PM', user: 'MG', priority: 'Medium', completed: false, status: 'Pending', description: 'Harvest all ripe tomatoes from the greenhouse. Pack them into crates and store in the cool room.' },
    { id: 3, type: 'Livestock', name: 'Feed livestock', time: '8:00 AM', user: 'RC', priority: 'High', completed: true, status: 'Completed', description: 'Feed all livestock. Ensure they have fresh water and enough feed for the day.' },
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = activeFilter === 'Today' || task.type.includes(activeFilter) || (activeFilter === 'Completed' && task.completed);
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const openNewTaskModal = () => {
    setSelectedTask(null);
    setModalMode('new');
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setSelectedTask(task);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  return (
    <div className="p-2 md:p-6">
      <div className="flex justify-end items-center mb-6">

        <div className="flex items-center space-x-4">
          <button className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-md border bg-green-600 scale-105" onClick={openNewTaskModal}>
            <Plus className="h-4 w-4 mr-2" /> New Task
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100">
            <RefreshCcw className="h-4 w-4 mr-2" /> Sync
          </button>
        </div>
      </div>

      <div className=" space-y-6 md:space-y-0 md:flex md:space-x-6">
        {/* Left Sidebar for Filters */}
        <div className="w-64 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-500 uppercase mb-2">FILTER TASKS</h3>
            <div className="space-y-2 ">
              {['Today', 'This Week', 'Overdue', 'Completed'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`w-full text-left p-2 rounded-xl text-base font-medium transition-colors duration-200
                    ${activeFilter === filter ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-500 uppercase mb-2">TASK TYPES</h3>
            <div className="space-y-2">
              {['Crop Tasks', 'Livestock Tasks', 'General Tasks'].map(type => (
                <button
                  key={type}
                  className="w-full text-left flex items-center justify-between p-2 rounded-xl text-base font-medium text-gray-600 hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    <CheckCheck className="h-4 w-4 text-green-500" />
                    <span className="ml-2">{type}</span>
                  </div>
                  <span className="text-gray-400">({tasks.filter(t => t.type.includes(type.split(' ')[0])).length})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-8 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-500 uppercase">TODAY'S TASKS ({filteredTasks.length})</h3>
            <div className="space-y-4">
              {filteredTasks.map(task => (
                <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 md:flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => openEditTaskModal(task)}>
                  <div className="flex items-start space-x-2 md:space-x-4 py-2">
                    <button className="mt-1" onClick={(e) => { e.stopPropagation(); }}>
                      {task.completed ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                      )}
                    </button>
                    <div className='space-y-2'>
                      <h4 className="font-medium text-xl text-gray-800">{task.name}</h4>
                      <p className="text-base text-gray-500 space-y-2  items-center lg:space-x-2 lg:flex">
                        <span>{task.type}</span>
                        <span className="text-xs text-gray-400 lg:mb-0">•</span>
                        <CalendarCheck className="h-4 w-4 mt-2" />
                        <span>Today, {task.time}</span>
                      </p>
                      <span className={`mt-2 inline-block px-4 py-2 text-base rounded-2xl ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-green-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-800">
                      {task.user}
                    </div>
                    <span className="text-sm text-gray-600">
                      {task.user === 'JD' ? 'John Doe' : 'Maria Garcia'}
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400 hidden md:flex" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Modal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'new' ? 'New Task' : selectedTask?.name || 'Task Details'}
      >
        <TaskForm onClose={() => setIsModalOpen(false)} task={selectedTask} mode={modalMode} />
      </Modal>
    </div>
  );
};

// A simple dialog for adding an event
const AddEventDialog: React.FC = () => (
  <div className="relative">
    <button className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700">
      <Plus className="h-4 w-4 mr-2" /> <span className='hidden md:flex'>Add</span>Event
    </button>
  </div>
);

// CalendarView component
const CalendarView: React.FC = () => (
  <div className="p-2 md:p-6 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
    {/* Left Sidebar for Calendar and Filters */}
    <div className="w-full md:w-64 space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">August 2025</h3>
          <div className="flex items-center space-x-2 text-gray-400">
            <button>&lt;</button>
            <button>&gt;</button>
          </div>
        </div>
        {/* Simple calendar grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={day + index} className="font-medium text-gray-500">{day}</div>
          ))}
          {[...Array(31).keys()].map(day => (
            <div
              key={day}
              className={`p-2 rounded-lg cursor-pointer ${day === 5 ? 'bg-green-100 text-green-700 font-semibold' : 'hover:bg-gray-100'}`}
            >
              {day + 1}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base md:text-lg font-semibold text-gray-500 uppercase mb-2">VIEW OPTIONS</h3>
        <div className="flex space-x-2">
          <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Month</button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300">Week</button>
        </div>
      </div>

      <div>
        <h3 className=" text-base md:text-lg font-semibold text-gray-500 uppercase mb-2">FILTER EVENTS</h3>
        <div className="space-y-2">
          {['Crop Tasks', 'Livestock Tasks', 'Equipment', 'General Tasks'].map(type => (
            <div key={type} className="flex items-center space-x-2 p-2 rounded-xl text-base font-medium text-gray-600">
              <input type="checkbox" className="rounded-sm text-green-600" defaultChecked />
              <span>{type}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base md:text-lg  font-semibold text-gray-500 uppercase mb-2">LEGEND</h3>
        <div className="space-y-3">
          {[{ label: 'Seeding', color: 'bg-green-500' }, { label: 'Fertilizer', color: 'bg-blue-500' }, { label: 'Harvesting', color: 'bg-yellow-500' }, { label: 'Livestock', color: 'bg-purple-500' }, { label: 'Equipment', color: 'bg-red-500' }].map(item => (
            <div key={item.label} className="flex items-center space-x-2 text-base font-medium text-gray-600">
              <div className={`h-2.5 w-2.5 rounded-full ${item.color}`}></div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Main Calendar Grid */}
    <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">August 2025</h2>
        <div className="flex items-center space-x-2">
          <div className="relative inline-block text-left">
            <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100">
              <Filter className="h-5 w-5" />
            </button>
          </div>
          <AddEventDialog />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="font-medium text-gray-500">{day}</div>
        ))}
        {/* Placeholder for calendar days */}
        {[...Array(31).keys()].map(day => (
          <div key={day} className="  md:h-28  border border-gray-200 rounded-md p-2 md:p-2  mt-2 hover:bg-green-300 cursor-pointer">
            <span className="text-gray-500 text-xs">{day + 1}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);



// InventoryManagement component
const InventoryManagement: React.FC = () => {
  const inventoryItems: InventoryItem[] = [
    { name: "Bean Seeds", quantity: 0, reorder: 30, usage: 5, expiry: "3/19/2024", status: "Out of Stock" },
    { name: "Carrot Seeds", quantity: 25, reorder: 30, usage: 3, expiry: "1/9/2024", status: "Low Stock" },
    { name: "Maize Seeds", quantity: 250, reorder: 50, usage: 10, expiry: "5/14/2024", status: "In Stock" },
    { name: "Potato Seeds", quantity: 180, reorder: 50, usage: 20, expiry: "10/14/2023", status: "In Stock" },
    { name: "Tomato Seeds", quantity: 15, reorder: 20, usage: 2, expiry: "12/29/2023", status: "Low Stock" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Out of Stock':
        return 'bg-red-50 text-red-600';
      case 'Low Stock':
        return 'bg-yellow-50 text-yellow-600';
      case 'In Stock':
        return 'bg-green-50 text-green-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Out of Stock':
        return <X className="h-4 w-4 mr-1 text-red-600" />;
      case 'Low Stock':
        return <TriangleAlert className="h-4 w-4 mr-1 text-yellow-600" />;
      case 'In Stock':
        return <CheckCircle className="h-4 w-4 mr-1 text-green-600" />;
      default:
        return null;
    }
  };

  const [activeInventoryTab, setActiveInventoryTab] = useState<string>('Seeds');

  const inventoryTabs = [
    { name: 'Seeds', icon: <Leaf className="h-4 w-4 mr-2" /> },
    { name: 'Feed', icon: <Heart className="h-4 w-4 mr-2" /> },
    { name: 'Fertilizer', icon: <FileText className="h-4 w-4 mr-2" /> },
    { name: 'Tools', icon: <HardHat className="h-4 w-4 mr-2" /> },
    { name: 'Equipment Parts', icon: <Grid className="h-4 w-4 mr-2" /> },
  ];

  return (
    <div className="p-2 md:p-6">
      <div className="flex flex-wrap items-center justify-start border-b border-gray-200 mb-6 -mt-2">
        {inventoryTabs.map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveInventoryTab(tab.name)}
            className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200
              ${activeInventoryTab === tab.name
                ? 'border-b-2 border-green-600 text-green-700'
                : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-400'}`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      <div className="md:flex justify-between items-center space-y-4 mb-6">
        <div className="relative w-64"> 
          <Search className="absolute  left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search inventory..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500" />
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-4 py-2 text-sm font-medium text-green-600 rounded-md border border-green-600 hover:bg-green-50">
            <Download className="h-4 w-4 mr-2" /> Download
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventoryItems.map((item, index) => (
          <Card key={index} title={item.name}>
            <div className="space-y-2">
              <p className="flex justify-between text-sm">
                <span className="text-gray-500">Quantity:</span>
                <span className="font-semibold text-gray-800">{item.quantity} kg</span>
              </p>
              <p className="flex justify-between text-sm">
                <span className="text-gray-500">Reorder Level:</span>
                <span className="font-semibold text-gray-800">{item.reorder} kg</span>
              </p>
              <p className="flex justify-between text-sm">
                <span className="text-gray-500">Usage Rate:</span>
                <span className="font-semibold text-gray-800">{item.usage} kg/week</span>
              </p>
              <p className="flex justify-between text-sm">
                <span className="text-gray-500">Expiry Date:</span>
                <span className="font-semibold text-gray-800">{item.expiry}</span>
              </p>
              <div className={`mt-4 px-3 py-2 gap-1 rounded-full text-sm font-medium flex items-center justify-start ${getStatusColor(item.status)}`}>
                {getStatusIcon(item.status)}
                {item.status}
              </div>
            </div>
            <div className="mt-4 text-right">
              <button className="text-sm font-medium text-green-600 hover:underline">
                Update
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// AddCropForm Component
interface AddCropFormProps {
  onClose: () => void;
}

const AddCropForm: React.FC<AddCropFormProps> = ({ onClose }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <label htmlFor="cropName" className="block text-sm font-medium text-gray-700 mb-1">Crop Name<span className="text-red-500">*</span></label>
        <input type="text" id="cropName" placeholder="E.g., Maize" className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
      </div>
      <div>
        <label htmlFor="variety" className="block text-sm font-medium text-gray-700 mb-1">Variety</label>
        <input type="text" id="variety" placeholder="E.g., Pioneer Hybrid" className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
      </div>
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Field/Location<span className="text-red-500">*</span></label>
        <input type="text" id="location" placeholder="E.g., East Field" className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
      </div>
      <div>
        <label htmlFor="plantingDate" className="block text-sm font-medium text-gray-700 mb-1">Planting Date<span className="text-red-500">*</span></label>
        <input type="text" id="plantingDate" placeholder="mm/dd/yyyy" className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
      </div>
      <div>
        <label htmlFor="harvestDate" className="block text-sm font-medium text-gray-700 mb-1">Expected Harvest Date</label>
        <input type="text" id="harvestDate" placeholder="mm/dd/yyyy" className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
      </div>
      <div>
        <label htmlFor="growthStage" className="block text-sm font-medium text-gray-700 mb-1">Current Growth Stage</label>
        <select id="growthStage" className="w-full p-2 border border-gray-300 rounded-md text-gray-800">
          <option>Seeding</option>
          <option>Vegetative</option>
          <option>Flowering</option>
          <option>Fruiting</option>
          <option>Maturity</option>
        </select>
      </div>
      <div>
        <label htmlFor="healthStatus" className="block text-sm font-medium text-gray-700 mb-1">Health Status</label>
        <select id="healthStatus" className="w-full p-2 border border-gray-300 rounded-md text-gray-800">
          <option>Good</option>
          <option>Fair</option>
          <option>Poor</option>
        </select>
      </div>
      <div>
        <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">Area<span className="text-red-500">*</span></label>
        <div className="flex space-x-0">
          <input type="number" id="area" placeholder="0.00" className="flex-1 p-2 border border-gray-300 rounded-md text-gray-800" />
          <select className="p-2 border border-gray-300 rounded-md text-gray-800">
            <option>ac</option>
            <option>ha</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="seedQuantity" className="block text-sm font-medium text-gray-700 mb-1">Seed Quantity</label>
        <div className="flex space-x-0">
          <input type="number" id="seedQuantity" placeholder="0.00" className="flex-1 p-2 border border-gray-300 rounded-md text-gray-800" />
          <select className="p-2 border border-gray-300 rounded-md text-gray-800">
            <option>kg</option>
            <option>lb</option>
          </select>
        </div>
      </div>
    </div>

    <div>
      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
      <textarea
        id="notes"
        rows={3}
        placeholder="Additional information about this crop..."
        className="w-full p-2 border border-gray-300 rounded-md resize-none text-gray-800"
      ></textarea>
    </div>

    <div>
      <div className="text-sm font-medium text-gray-700 mb-2">Crop Images</div>
      <div className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-gray-300 rounded-md text-gray-500">
        <Camera className="h-8 w-8 mb-2" />
        <p className="text-center">Drag and drop images here, or click to select files</p>
        <button className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100">
          Select Images
        </button>
      </div>
    </div>

    <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-md" role="alert">
      <div className="flex items-center">
        <TriangleAlert className="h-5 w-5 mr-3" />
        <p className="text-sm">
          This record will be used for crop tracking, yield forecasting, and generating reports. Regular updates to growth stage and health status are recommended.
        </p>
      </div>
    </div>

    {/* Modal Footer */}
    <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
      <button className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100" onClick={onClose}>
        Cancel
      </button>
      <button className="px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700">
        Add Crop Record
      </button>
    </div>
  </div>
);

// AddLivestockForm Component
interface AddLivestockFormProps {
  onClose: () => void;
}

const AddLivestockForm: React.FC<AddLivestockFormProps> = ({ onClose }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <label htmlFor="livestockSpecies" className="block text-sm font-medium text-gray-700 mb-1">Livestock Species<span className="text-red-500">*</span></label>
        <input type="text" id="livestockSpecies" placeholder="E.g., Cattle, Chicken, Goat" className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
      </div>
      <div>
        <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
        <input type="text" id="breed" placeholder="E.g., Holstein, Leghorn" className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
      </div>
      <div>
        <label htmlFor="animalCount" className="block text-sm font-medium text-gray-700 mb-1">Number of Animals<span className="text-red-500">*</span></label>
        <input type="number" id="animalCount" placeholder="E.g., 10" className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
      </div>
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location<span className="text-red-500">*</span></label>
        <input type="text" id="location" placeholder="E.g., Main Barn, East Pasture" className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
      </div>
      <div>
        <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
        <select id="ageGroup" className="w-full p-2 border border-gray-300 rounded-md text-gray-800">
          <option>Adult</option>
          <option>Young</option>
          <option>Juvenile</option>
        </select>
      </div>
      <div>
        <label htmlFor="acquisitionDate" className="block text-sm font-medium text-gray-700 mb-1">Acquisition Date</label>
        <input type="text" id="acquisitionDate" placeholder="mm/dd/yyyy" className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
      </div>
      <div>
        <label htmlFor="lastCheckupDate" className="block text-sm font-medium text-gray-700 mb-1">Last Health Checkup</label>
        <input type="text" id="lastCheckupDate" placeholder="mm/dd/yyyy" className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
      </div>
      <div>
        <label htmlFor="healthStatus" className="block text-sm font-medium text-gray-700 mb-1">Health Status</label>
        <select id="healthStatus" className="w-full p-2 border border-gray-300 rounded-md text-gray-800">
          <option>Good</option>
          <option>Fair</option>
          <option>Poor</option>
        </select>
      </div>
      <div className="sm:col-span-1">
        <label htmlFor="feedSchedule" className="block text-sm font-medium text-gray-700 mb-1">Feed Schedule</label>
        <input type="text" id="feedSchedule" placeholder="E.g., Twice daily, Morning and evening" className="w-full p-2 border border-gray-300 rounded-md text-gray-800" />
      </div>
    </div>

    <div className="sm:col-span-2">
      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
      <textarea
        id="notes"
        rows={3}
        placeholder="Additional information about this livestock group..."
        className="w-full p-2 border border-gray-300 rounded-md resize-none text-gray-800"
      ></textarea>
    </div>

    <div>
      <div className="text-sm font-medium text-gray-700 mb-2">Livestock Images</div>
      <div className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-gray-300 rounded-md text-gray-500">
        <Camera className="h-8 w-8 mb-2" />
        <p className="text-center">Drag and drop images here, or click to select files</p>
        <button className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100">
          Select Images
        </button>
      </div>
    </div>

    <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-md" role="alert">
      <div className="flex items-center">
        <TriangleAlert className="h-5 w-5 mr-3" />
        <p className="text-sm">
          Regular health monitoring and proper record keeping are essential for livestock management. Use the livestock events section to track vaccinations, treatments, and other activities.
        </p>
      </div>
    </div>

    {/* Modal Footer */}
    <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
      <button className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100" onClick={onClose}>
        Cancel
      </button>
      <button className="px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700">
        Add Livestock Record
      </button>
    </div>
  </div>
);

// RecordDetails Component
interface RecordDetailsProps {
  record: CropRecord | LivestockRecord | null;
  type: 'Crops' | 'Livestock';
  onClose: () => void;
}

const RecordDetails: React.FC<RecordDetailsProps> = ({ record, type, onClose }) => {
  return (
    <div className="space-y-6">
      {type === 'Crops' ? (
        // Crop Details
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <img src={record?.image} alt={record?.name} width={200} height={200} className="w-full h-auto object-cover rounded-lg mb-4" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
            <input type="text" defaultValue={record?.name || ''} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input type="text" defaultValue={record?.location || ''} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Planted Date</label>
            <input type="text" defaultValue={record?.planted || ''} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Growth Stage</label>
            <input type="text" defaultValue={record?.growth || ''} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maturity</label>
            <input type="text" defaultValue={record?.maturity || ''} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800" />
          </div>
        </div>
      ) : (
        // Livestock Details
        <div className="space-y-4">
          <div className="sm:col-span-2">
            <img src={record?.image} alt={record?.name} className="w-full h-auto object-cover rounded-lg mb-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Livestock Type</label>
              <input type="text" defaultValue={record?.name || ''} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
              <input type="text" defaultValue={record?.breed || ''} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
              <input type="number" defaultValue={record?.count || 0} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input type="text" defaultValue={record?.age || ''} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Checkup</label>
              <input type="text" defaultValue={record?.lastCheckup || ''} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800" />
            </div>
          </div>
        </div>
      )}

      {/* Modal Footer */}
      <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
        <button className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

// CropLivestockRecords component
const CropLivestockRecords: React.FC = () => {
  const [activeRecordTab, setActiveRecordTab] = useState<'Crops' | 'Livestock'>('Crops');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState<boolean>(false);
  const [isAddLivestockModalOpen, setIsAddLivestockModalOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<CropRecord | LivestockRecord | null>(null);

  const cropRecords: CropRecord[] = [
    { id: 1, name: "Maize", location: "Pioneer Hybrid • East Field", planted: "3/4/2023", growth: "Vegetative", maturity: "60%", image: "/images/crop/Container (15).png", health: "Good", issues: [] },
    { id: 2, name: "Tomatoes", location: "Roma • Greenhouse 1", planted: "4/18/2023", growth: "Fruiting", maturity: "80%", image: "/images/crop/Image.png", health: "Excellent", issues: [] },
    { id: 3, name: "Potatoes", location: "Russet • West Field", planted: "2/8/2023", growth: "Tuber formation", maturity: "95%", image: "/images/crop/Container (16).png", health: "Good", issues: [] },
    { id: 4, name: "Beans", location: "Green Bean • South Field", planted: "5/9/2023", growth: "Flowering", maturity: "50%", image: "/images/crop/Container (17).png", health: "Fair", issues: [{ text: "Pest: Aphid infestation detected" }] },
    { id: 5, name: "Carrots", location: "Nantes • North Field", planted: "5/10/2023", growth: "Root Development", maturity: "75%", image: "/images/crop/Image (1).png", health: "Poor", issues: [{ text: "Disease: Root rot observed" }] },
  ];

  const livestockRecords: LivestockRecord[] = [
    { id: 1, name: "Cattle", breed: "Holstein • Main Barn", count: 24, age: "Adult", feed: "Twice daily", lastCheckup: "6/30/2023", image: "/images/livestock/Container (10).png", health: "Good", issues: [] },
    { id: 2, name: "Chicken", breed: "Leghorn • Poultry House 1", count: 150, age: "Adult", feed: "Three times daily", lastCheckup: "6/24/2023", image: "/images/livestock/Container (11).png", health: "Excellent", issues: [] },
    { id: 3, name: "Goat", breed: "Boer • East Pasture", count: 15, age: "Adult", feed: "Twice daily", lastCheckup: "6/29/2023", image: "/images/livestock/Container (12).png", health: "Fair", issues: [{ text: "Health: Lameness observed in 2 goats" }] },
    { id: 4, name: "Pig", breed: "Yorkshire • Pig Barn", count: 30, age: "Adult", feed: "Three times daily", lastCheckup: "6/27/2023", image: "/images/livestock/Container (13).png", health: "Good", issues: [] },
    { id: 5, name: "Sheep", breed: "Merino • West Pasture", count: 40, age: "Adult", feed: "Twice daily", lastCheckup: "7/3/2023", image: "/images/livestock/Container (14).png", health: "Poor", issues: [{ text: "Disease: Suspected parasitic infection" }] },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good':
        return 'bg-green-100 text-green-700';
      case 'Fair':
        return 'bg-yellow-100 text-yellow-700';
      case 'Poor':
        return 'bg-red-100 text-red-700';
      case 'Excellent':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const currentRecords = activeRecordTab === 'Crops' ? cropRecords : livestockRecords;

  const openNewRecordModal = () => {
    if (activeRecordTab === 'Crops') {
      setIsAddCropModalOpen(true);
    } else {
      setIsAddLivestockModalOpen(true);
    }
  };

  const openViewRecordModal = (record: CropRecord | LivestockRecord) => {
    setSelectedRecord(record);
    setIsRecordModalOpen(true);
  };

  return (
    <div className=" p-2 md:p-6">
      <div className="flex items-center justify-start border-b border-gray-200 mb-6 -mt-2">
        <button
          onClick={() => setActiveRecordTab('Crops')}
          className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200
            ${activeRecordTab === 'Crops'
              ? 'border-b-2 border-green-600 text-green-700'
              : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-400'}`}
        >
          Crops
        </button>
        <button
          onClick={() => setActiveRecordTab('Livestock')}
          className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200
            ${activeRecordTab === 'Livestock'
              ? 'border-b-2 border-green-600 text-green-700'
              : 'text-gray-600 hover:text-gray-800 hover:border-b-2 hover:border-gray-400'}`}
        >
          Livestock
        </button>
      </div>
      <div className="md:flex justify-between space-y-4 items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder={`Search ${activeRecordTab.toLowerCase()}...`} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500" />
        </div>
        <div className="flex items-center justify-end space-x-4">
          <button className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700" onClick={openNewRecordModal}>
            <Plus className="h-4 w-4 mr-2" /> Add {activeRecordTab === 'Crops' ? 'Crop' : 'Livestock'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentRecords.map(record => (
          <div key={record.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer" onClick={() => openViewRecordModal(record)}>
            <div className="relative">
              <Image src={record.image} alt={record.name} width={200} height={200} className="w-full h-48 object-cover" />
              <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-semibold text-white ${record.health === 'Good' || record.health === 'Excellent' ? 'bg-green-500' : record.health === 'Fair' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                {record.health}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 text-lg">{record.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{record.breed || record.location}</p>
              <div className="mt-4 text-sm text-gray-600 space-y-2">
                {activeRecordTab === 'Crops' ? (
                  <>
                    <p><b>Planted:</b> {record.planted}</p>
                    <p><b>Growth Stage:</b> {record.growth}</p>
                    <div className="flex items-center">
                      <span className="text-gray-500">Maturity:</span>
                      <div className="w-full h-2 bg-gray-200 rounded-full mx-2">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: record.maturity }}></div>
                      </div>
                      <span className="text-gray-800">{record.maturity}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <p><b>Age Group:</b> {record.age}</p>
                    <p><b>Feed Schedule:</b> {record.feed}</p>
                    <p><b>Last Checkup:</b> {record.lastCheckup}</p>
                  </>
                )}
              </div>
              {record.issues && record.issues.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-md">
                  <div className="flex items-center text-red-700 font-semibold">
                    <TriangleAlert className="h-4 w-4 mr-2" />
                    Issues Detected
                  </div>
                  <ul className="list-disc list-inside mt-1 text-red-600 text-sm">
                    {record.issues.map((issue, i) => (
                      <li key={i}>{issue.text}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <div className="flex space-x-2 md:space-x-4 text-gray-400">
                  <button onClick={(e) => { e.stopPropagation(); openViewRecordModal(record); }} className="hover:text-green-600">
                    <FolderOpen className="h-5 w-5" />
                  </button>
                  <button className="hover:text-green-600">
                    <Camera className="h-5 w-5" />
                  </button>
                  {activeRecordTab === 'Livestock' && (
                    <>
                      <button className="hover:text-green-600">
                        <Syringe className="h-5 w-5" />
                      </button>
                      <button className="hover:text-green-600">
                        <Pill className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
                <button className="text-sm font-medium text-green-600 hover:underline">
                  Update Record
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal
        show={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title={selectedRecord?.name || ''}
      >
        <RecordDetails record={selectedRecord} type={activeRecordTab} onClose={() => setIsRecordModalOpen(false)} />
      </Modal>
      <Modal
        show={isAddCropModalOpen}
        onClose={() => setIsAddCropModalOpen(false)}
        title="Add New Crop Record"
      >
        <AddCropForm onClose={() => setIsAddCropModalOpen(false)} />
      </Modal>
      <Modal
        show={isAddLivestockModalOpen}
        onClose={() => setIsAddLivestockModalOpen(false)}
        title="Add New Livestock Record"
      >
        <AddLivestockForm onClose={() => setIsAddLivestockModalOpen(false)} />
      </Modal>
    </div>
  );
};

// EquipmentUsage component placeholder
const EquipmentUsage: React.FC = () => (
  <div className="p-6 text-center">
    <h1 className="text-3xl font-bold text-gray-900 mb-4">Equipment Usage</h1>
    <p className="text-gray-600">Monitor and manage the usage of your farm equipment.</p>
  </div>
);

// LaborProductivity component placeholder
const LaborProductivity: React.FC = () => (
  <div className="p-6 text-center">
    <h1 className="text-3xl font-bold text-gray-900 mb-4">Labor & Productivity</h1>
    <p className="text-gray-600">Manage and analyze the productivity of your farm labor force.</p>
  </div>
);

const pageComponents: { [key: string]: React.FC } = {
  'Task Planner': TaskPlanner,
  'Calendar View': CalendarView,
  'Inventory Management': InventoryManagement,
  'Crop & Livestock Records': CropLivestockRecords,
  'Equipment Usage': EquipmentUsage,
  'Labor & Productivity': LaborProductivity,
};

// Main component that combines the header, tabs, and content views
const FarmOperations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Task Planner');
  const PageComponent = pageComponents[activeTab];

  return (
    <div className="min-h-screen flex flex-col">
      <FarmOperationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-auto">
        <PageComponent />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      <Header />
      <FarmOperations />
    </div>
  );
};

export default App;
