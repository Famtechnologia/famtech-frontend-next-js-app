'use client'
import React from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { CheckCircle, Loader2, ListChecks, AlertTriangle, PlusCircle } from 'lucide-react'; // Added PlusCircle
import { useAuthStore } from '@/lib/store/authStore'; 
import { getTasks, updateTask, Task } from '@/lib/services/taskplanner'; 
import useSWR from 'swr'; 

// --- Custom Task Hook ---
// (The taskFetcher and useTaskSummary hook logic remains the same)
const taskFetcher = async ([ userId]: [string, string]) => {
    if (!userId) throw new Error("User ID is required.");
    
    const tasks = await getTasks(userId); 
    
    // Sort logic: Incomplete (not 'completed') tasks first, then by date
    return tasks.sort((a, b) => {
        const statusA = a.status === 'completed'; 
        const statusB = b.status === 'completed'; 
        
        // 1. Sort by completion status (incomplete first)
        if (statusA !== statusB) {
            return statusA ? 1 : -1; // Incomplete tasks come first
        }
        
        // 2. Then sort by dueDate (earlier dates first)
        const dateA = a.timeline?.dueDate || '9999-12-31';
        const dateB = b.timeline?.dueDate || '9999-12-31';
        return dateA.localeCompare(dateB);
    });
};

export const useTaskSummary = () => {
    const userId = useAuthStore((state) => state.user?.id);
    
    const { data, error, isLoading, mutate } = useSWR(
        userId ? ['tasks', userId] : null, 
        taskFetcher
    );

    return {
        tasks: data || [],
        isLoading: isLoading,
        error: error,
        mutate,
    };
};

// --- Main Component ---

const DashboardTasks = () => {
    const { tasks, isLoading, error, mutate } = useTaskSummary();

    const handleToggleTask = async (task: Task) => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';

        try {
            // Your API call to update the task status
            await updateTask(task.id as string, { 
                ...task,
                status: newStatus,
            });
            
            // Re-fetch data to update the list
            mutate();

        } catch (e) {
            console.error("Failed to update task status:", e);
            mutate(); 
        }
    };

    if (isLoading) {
        return (
            <Card title="Task Planner" headerClassName='bg-green-50' bodyClassName='p-6 flex items-center justify-center h-[320px]'>
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </Card>
        );
    }

    if (error) {
        return (
            <Card title="Task Planner" headerClassName='bg-red-50' bodyClassName='p-6 flex items-center justify-center h-[320px]'>
                <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
                <span className='text-red-600 text-base'>Could not load tasks.</span>
            </Card>
        );
    }

    const tasksToDisplay = tasks.slice(0, 3);
    const completedCount = tasks.filter(task => task.status === 'completed').length;
    const isCompleted = (task: Task) => task.status === 'completed';

    const hasTasks = tasks.length > 0;

    // --- Dynamic Content based on task count ---
    let taskListContent;
    let buttonContent;
    let summaryContent;

    if (hasTasks) {
        taskListContent = tasksToDisplay.map(task => (
            <div key={task.id} className="flex items-center space-x-3">
                <button
                    onClick={() => handleToggleTask(task)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${
                        isCompleted(task) 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-green-300 hover:border-green-400 text-transparent'
                    }`}
                >
                    {isCompleted(task) && <CheckCircle className="w-3 h-3" />}
                </button>
                <span className={`text-sm break-words ${isCompleted(task) ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                    {task.title}
                </span>
            </div>
        ));
        
        summaryContent = (
             <div className="text-base text-gray-600">
                {completedCount} of {tasks.length} completed
            </div>
        );

        buttonContent = (
            <Link href="/farm-operation?tab=planner" passHref legacyBehavior>
                <a className="text-green-600 text-base font-medium hover:text-green-700 flex items-center mt-2">
                    View all tasks →
                </a>
            </Link>
        );

    } else {
        // --- Zero-State Content ---
        taskListContent = (
            <div className="text-base text-gray-500 py-4 flex flex-col items-center justify-center h-full text-center">
                <ListChecks className="w-8 h-8 text-gray-400 mb-2"/>
                <p className='font-medium text-gray-700'>Your productivity frontier awaits! 🌱</p>
                <p>No tasks found. Let&apos;s cultivate a plan.</p>
            </div>
        );
        
        summaryContent = <div className="text-sm text-gray-600">Ready to plan your day.</div>;
        
        buttonContent = (
            <Link href="/farm-operation?tab=planner" passHref legacyBehavior>
                <a className="text-white text-base font-medium bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center py-2 mt-2 transition duration-150">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create New Task
                </a>
            </Link>
        );
    }

    return (
        <Card 
            title="Task Planner" 
            className="h-[320px]" 
            headerClassName='bg-green-50 border-b border-green-200' 
            bodyClassName='p-6'
        >
            <div className="space-y-3">
                
                {/* Task List/Zero-State Message */}
                {taskListContent}
                
                <div className="pt-3 border-t border-gray-100 mt-4">
                    {/* Summary (Completed count or "Ready to plan...") */}
                    {summaryContent}
                    
                    {/* Dynamic Button (View All or Create New) */}
                    {buttonContent}
                </div>
            </div>
        </Card>
    );
};

export default DashboardTasks;