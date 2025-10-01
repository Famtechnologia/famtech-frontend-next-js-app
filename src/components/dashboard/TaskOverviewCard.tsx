// components/dashboard/TaskOverviewCard.tsx

'use client'
import React from 'react';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Link from 'next/link';

// NOTE: Ensure these imports are correct for your project structure
import { useTaskSummary } from '@/components/tasks/tasksCard'; 
import { Task } from '@/lib/services/taskplanner'; 

// Utility function to format the ISO date string
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    // 1. Create a Date object from the ISO string
    const date = new Date(dateString);
    
    // 2. Use Intl.DateTimeFormat for locale-aware, readable output
    return new Intl.DateTimeFormat('en-US', { 
        month: 'short', // 'Oct'
        day: 'numeric', // '1'
        year: 'numeric', // '2024'
    }).format(date);
    
  } catch (e: unknown) { // Explicitly catch as unknown type
    // FIX: Log the error to acknowledge the variable 'e', resolving the ESLint warning.
    // This ensures 'e' is "used" and provides useful debugging information.
    console.error("Error formatting date:", dateString, e); 
    // Fallback in case of an invalid date string
    return dateString;
  }
};


// Utility function to get the task icon (Unchanged)
const getTaskIcon = (status: Task['status']) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "overdue":
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-blue-500" />;
  }
};

// Utility function to get the priority color classes (Unchanged)
const getPriorityColor = (priority: Task['priority']) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
};

const TaskOverviewCard: React.FC = () => {
  const { tasks, isLoading, error } = useTaskSummary();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 h-[420px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        <span className="ml-3 text-gray-600">Loading tasks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 h-[420px] flex items-center justify-center border border-red-200">
        <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
        <span className='text-red-600 text-base'>Failed to load tasks.</span>
      </div>
    );
  }

  // Calculate Summary Statistics (Unchanged)
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const overdueTasks = tasks.filter(task => task.status === 'overdue');
  const inProgressTasks = tasks.filter(task => task.status !== 'completed' && task.status !== 'overdue');

  const stats = {
    completed: completedTasks.length,
    inProgress: inProgressTasks.length,
    overdue: overdueTasks.length,
    items: [...overdueTasks, ...inProgressTasks, ...completedTasks].slice(0, 5),
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Task Overview
        </h3>
        <Link href="/farm-operation?tab=planner" passHref legacyBehavior>
          <a className="text-green-600 text-sm font-medium flex items-center hover:text-green-700">
            View All <Eye className="w-4 h-4 ml-1" />
          </a>
        </Link>
      </div>

      {/* Task Stats (Unchanged) */}
      <div className="grid grid-cols-3 gap-1 md:gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-800">
            {stats.completed}
          </p>
          <p className="text-xs text-green-600">Completed</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-800">
            {stats.inProgress}
          </p>
          <p className="text-xs text-blue-600">In Progress</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-800">
            {stats.overdue}
          </p>
          <p className="text-xs text-red-600">Overdue</p>
        </div>
      </div>

      {/* Task List - Date Formatting Applied Here */}
      <div className="space-y-3 flex-grow overflow-y-auto">
        {stats.items.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
                <CheckCircle className='w-8 h-8 mx-auto text-gray-300 mb-2'/>
                All tasks clear! Nothing urgent to see here.
            </div>
        ) : (
            stats.items.map((task) => (
              <div
                key={task.id}
                className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg"
              >
                {getTaskIcon(task.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {task.title}
                  </p>
                  {/* The date formatting is correctly called here */}
                  <p className="text-xs text-gray-500">
                    Due: {formatDate(task.timeline?.dueDate)}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full border flex-shrink-0 ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default TaskOverviewCard;