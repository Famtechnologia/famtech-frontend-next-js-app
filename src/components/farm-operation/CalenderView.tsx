// src/components/calendar/CalendarView.tsx

import React, { useState, useEffect, useCallback} from 'react';
import { Plus, Filter } from 'lucide-react';
import { getCalendarData, CalendarData, Task, createTask } from '@/lib/services/calender';
import Modal from '../ui/Modal'; 

// A new component for rendering a single day with its tasks
const DayCell: React.FC<{ day: number; tasks: Task[] }> = ({ day, tasks }) => (
  <div className="md:h-28 border border-gray-200 rounded-md p-2 mt-2 hover:bg-green-300 cursor-pointer relative overflow-hidden">
    <span className="text-gray-500 text-xs">{day}</span>
    <div className="absolute inset-x-0 bottom-0 p-1 flex space-x-1 justify-center md:justify-start overflow-x-auto no-scrollbar">
      {tasks.map((task) => (
        <div
          key={task._id}
          className={`h-2 w-2 rounded-full ${
            task.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'
          }`}
          title={`${task.title} - ${task.status}`}
        ></div>
      ))}
    </div>
  </div>
);

// NewEventForm component with state management and form submission logic
const NewEventForm: React.FC<{ onSave: (taskData: Omit<Task, '_id'>) => void }> = ({ onSave }) => {
  const [formData, setFormData] = useState<Omit<Task, '_id'>>({
    title: '',
    status: 'pending',
    priority: 'medium',
    timeline: {
      dueDate: '',
      dueTime: ''
    },
    note: '',
    taskType: 'General Tasks',
    assignee: '',
    entity_id: 'default_entity_id',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'dueDate' || name === 'dueTime') {
      setFormData(prev => ({
        ...prev,
        timeline: {
          ...prev.timeline,
          [name]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm focus:border-green-300 focus:ring-2 sm:text-sm"
          placeholder="e.g., Harvest Corn"
        />
      </div>
      <div className="flex space-x-4">
        <div className="flex-1">
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.timeline.dueDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="dueTime" className="block text-sm font-medium text-gray-700">Time</label>
          <input
            type="time"
            id="dueTime"
            name="dueTime"
            value={formData.timeline.dueTime}
            onChange={handleChange}
            className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
          />
        </div>
      </div>
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div>
        <label htmlFor="taskType" className="block text-sm font-medium text-gray-700">Task Type</label>
        <select
          id="taskType"
          name="taskType"
          value={formData.taskType}
          onChange={handleChange}
          className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
        >
          <option value="Crop Tasks">Crop Tasks</option>
          <option value="Livestock Tasks">Livestock Tasks</option>
          <option value="Equipment">Equipment</option>
          <option value="General Tasks">General Tasks</option>
        </select>
      </div>
      <div>
        <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">Assignee</label>
        <input
          type="text"
          id="assignee"
          name="assignee"
          value={formData.assignee}
          onChange={handleChange}
          className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
          placeholder="e.g., John Doe"
        />
      </div>
      <div>
        <label htmlFor="note" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="note"
          name="note"
          value={formData.note}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
          placeholder="Add a brief description..."
        ></textarea>
      </div>
      <input type="hidden" name="status" value={formData.status} />
      <input type="hidden" name="entity_id" value={formData.entity_id} />
      <div className="pt-4 border-t border-gray-200">
        <button
          type="submit"
          className="flex justify-center w-full rounded-sm border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700"
        >
          Save Event
        </button>
      </div>
    </form>
  );
};

// AddEventDialog component to manage the modal
const AddEventDialog: React.FC<{ onTaskAdded: () => void }> = ({ onTaskAdded }) => {
  const [showModal, setShowModal] = useState(false);

  {/*Const handleOpenModal = () => setShowModal(true);*/}
  const handleCloseModal = () => setShowModal(false);

  const handleSave = async (taskData: Omit<Task, '_id'>) => {
    try {
      await createTask(taskData);
      handleCloseModal();
      onTaskAdded();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  return (
    <div className="relative">
      <button
        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        <span className='hidden md:flex'>Add </span>
        <span> Event</span>
      </button>

      <Modal show={showModal} onClose={handleCloseModal} title="Add New Event" >
        <NewEventForm onSave={handleSave} />
      </Modal>
    </div>
  );
};

// Main CalendarView component
const CalendarView: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

 const fetchCalendar = useCallback(async () => { 
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCalendarData(currentYear, currentMonth);
      setCalendarData(data);
    } catch (err) {
      console.error("Failed to fetch calendar data:", err);
      setError("Failed to load calendar data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [currentYear, currentMonth]);

useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);
  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="p-2 lg::p-6 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
      {/* Left Sidebar for Calendar and Filters */}
      <div className="w-full md:w-64 space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{monthNames[currentMonth - 1]} {currentYear}</h3>
            <div className="flex items-center space-x-2 text-gray-400">
              <button onClick={handlePreviousMonth}>&lt;</button>
              <button onClick={handleNextMonth}>&gt;</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={day + index} className="font-medium text-gray-500">{day}</div>
            ))}
            {blankDays.map((_, index) => <div key={`blank-${index}`}></div>)}
            {[...Array(getDaysInMonth(currentYear, currentMonth)).keys()].map(day => (
              <div
                key={day}
                className={`p-2 rounded-lg cursor-pointer ${
                  day + 1 === today.getDate() && currentMonth === today.getMonth() + 1 && currentYear === today.getFullYear()
                    ? 'bg-green-100 text-green-700 font-semibold'
                    : 'hover:bg-gray-100'
                }`}
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
          <h3 className="text-base md:text-lg font-semibold text-gray-500 uppercase mb-2">FILTER EVENTS</h3>
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
          <h3 className="text-base md:text-lg font-semibold text-gray-500 uppercase mb-2">LEGEND</h3>
          <div className="space-y-3">
            {[{ label: 'Seeding', color: 'bg-green-500', icon: 'Bean' }, { label: 'Fertilizer', color: 'bg-blue-500', icon: 'Wrench' }, { label: 'Harvesting', color: 'bg-yellow-500', icon: 'Apple' }, { label: 'Livestock', color: 'bg-purple-500', icon: 'Cow' }, { label: 'Equipment', color: 'bg-red-500' }].map(item => (
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
          <h2 className="text-lg font-semibold text-gray-900">{monthNames[currentMonth - 1]} {currentYear}</h2>
          <div className="flex items-center space-x-2">
            <div className="relative inline-block text-left">
              <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100">
                <Filter className="h-5 w-5" />
              </button>
            </div>
            <AddEventDialog onTaskAdded={fetchCalendar} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading calendar...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-sm">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="font-medium text-gray-500">{day}</div>
            ))}
            {/* build full 6-row × 7-col grid including previous/next month days */}
{(() => {
  const daysInPrevMonth = getDaysInMonth(
    currentMonth === 1 ? currentYear - 1 : currentYear,
    currentMonth === 1 ? 12 : currentMonth - 1
  );
  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const totalCells = 42; // 6 rows * 7 columns

 const cells: React.ReactElement[] = [];
  // previous month trailing days
  for (let i = blankDays.length - 1; i >= 0; i--) {
    const dayNumber = daysInPrevMonth - i;
    cells.push(
      <div
        key={`prev-${dayNumber}`}
        className="md:h-28 border border-gray-200 rounded-md p-2 mt-2 bg-gray-50 text-gray-400"
      >
        {dayNumber}
      </div>
    );
  }

  // current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dayData = calendarData?.days?.find(dd => dd.day === d);
    const tasksForDay = dayData?.tasks || [];
    cells.push(<DayCell key={`curr-${d}`} day={d} tasks={tasksForDay} />);
  }

  // next month leading days
  const nextDays = totalCells - cells.length;
  for (let d = 1; d <= nextDays; d++) {
    cells.push(
      <div
        key={`next-${d}`}
        className="md:h-28 border border-gray-200 rounded-md p-2 mt-2 bg-gray-50 text-gray-400"
      >
        {d}
      </div>
    );
  }

  return cells;
})()}

          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;