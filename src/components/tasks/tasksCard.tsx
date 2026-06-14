'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { 
  CheckCircle, 
  Loader2, 
  AlertTriangle, 
  Plus, 
  Trash2,
  Calendar,
  ListTodo
} from 'lucide-react';
import { getTasks, updateTask, deleteTask, createTask, Task } from '@/lib/services/taskplanner'; 
import useSWR from 'swr';
import { useProfile } from '@/lib/hooks/useProfile';

// --- Custom Task Hook ---

const taskFetcher = async ([ , userId ]: [string, string]) => {
    if (!userId) throw new Error("User ID is required.");
    const tasks = await getTasks(userId); 
    
    // Sort logic: Incomplete (not 'completed') tasks first, then by date
    return tasks.sort((a, b) => {
        const statusA = a.status === 'completed'; 
        const statusB = b.status === 'completed'; 
        
        // 1. Sort by completion status (incomplete first)
        if (statusA !== statusB) {
            return statusA ? 1 : -1; 
        }
        
        // 2. Then sort by dueDate (earlier dates first)
        const dateA = a.timeline?.dueDate || '9999-12-31';
        const dateB = b.timeline?.dueDate || '9999-12-31';
        return dateA.localeCompare(dateB);
    });
};

export const useTaskSummary = () => {
    const [isClient, setIsClient] = React.useState(false);
    React.useEffect(() => {
        setIsClient(true);
    }, []);

    const { profile } = useProfile();
    const userId = profile?.id;
    
    const swrKey = isClient && userId ? ['tasks', userId] : null;

    const { data, error, isLoading, mutate } = useSWR(
        swrKey, 
        taskFetcher
    );

    return {
        tasks: data || [],
        isLoading: isLoading,
        error: error,
        mutate,
        userId
    };
};

// --- Helper functions for styles & dates ---

const getPriorityStyles = (priority?: string) => {
  const p = priority?.toLowerCase();
  if (p === 'high') return 'bg-red-50 text-red-700 border-red-100 text-[10px]';
  if (p === 'medium') return 'bg-amber-50 text-amber-700 border-amber-100 text-[10px]';
  return 'bg-green-50 text-green-700 border-green-100 text-[10px]';
};

const formatDueDate = (dueDate?: string) => {
  if (!dueDate) return null;
  try {
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) return dueDate;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dueDate;
  }
};

// --- Main Component ---

const DashboardTasks = () => {
    const { tasks, isLoading, error, mutate, userId } = useTaskSummary();
    const [newTitle, setNewTitle] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleToggleTask = async (task: Task) => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';

        try {
            // Optimistic mutate
            const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
            mutate(updatedTasks, false);

            await updateTask(task.id, { 
                ...task,
                status: newStatus,
            });
            
            mutate();
        } catch (e) {
            console.error("Failed to update task status:", e);
            mutate(); 
        }
    };

    const handleAddQuickTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !userId) return;
        
        setIsSubmitting(true);
        try {
            await createTask({
                title: newTitle.trim(),
                status: 'pending',
                priority: 'medium',
                taskType: 'general',
                assignee: 'Unassigned',
                entity_id: 'default',
                userId: userId
            } as any);
            setNewTitle("");
            mutate();
        } catch (err) {
            console.error("Failed to create quick task:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            // Optimistic mutate
            const updatedTasks = tasks.filter(t => t.id !== taskId);
            mutate(updatedTasks, false);

            await deleteTask(taskId);
            mutate();
        } catch (err) {
            console.error("Failed to delete task:", err);
            mutate();
        }
    };

    if (isLoading) {
        return (
            <Card title="Task Planner" headerClassName='bg-green-50/50' bodyClassName='p-6 flex items-center justify-center h-[350px]'>
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </Card>
        );
    }

    if (error) {
        return (
            <Card title="Task Planner" headerClassName='bg-red-50/50' bodyClassName='p-6 flex items-center justify-center h-[350px]'>
                <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
                <span className='text-red-600 text-sm font-medium'>Could not load tasks.</span>
            </Card>
        );
    }

    const completedCount = tasks.filter(task => task.status === 'completed').length;
    const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
    const hasTasks = tasks.length > 0;

    return (
        <Card 
            title="Task Planner" 
            className="h-full flex flex-col hover:shadow-md transition-all duration-300"
            headerClassName='bg-green-50/30 border-b border-gray-100 py-3.5 px-5' 
            bodyClassName='p-4 sm:p-5 flex flex-col flex-1 overflow-hidden justify-between'
        >
            {/* Dynamic Progress indicator */}
            {hasTasks && (
                <div className="mb-3">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-gray-500 mb-1">
                        <span>COMPLETION RATE</span>
                        <span className="text-green-600">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                            className="bg-green-600 h-1.5 rounded-full transition-all duration-500" 
                            style={{ width: `${completionRate}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Quick Add Form */}
            <form onSubmit={handleAddQuickTask} className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Add a quick task..."
                    disabled={isSubmitting}
                    className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={isSubmitting || !newTitle.trim()}
                    className="bg-green-600 text-white rounded-lg p-1.5 hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Plus className="w-3.5 h-3.5" />
                    )}
                </button>
            </form>

            {/* Task List / Zero State Area */}
            <div className="flex-1 overflow-y-auto pr-0.5 space-y-2 mb-3">
                {hasTasks ? (
                    tasks.map(task => {
                        const isCompleted = task.status === 'completed';
                        return (
                            <div 
                                key={task.id} 
                                className="group flex items-center justify-between p-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all duration-150"
                            >
                                <div className="flex items-center space-x-2.5 min-w-0 flex-1 mr-2">
                                    <button
                                        onClick={() => handleToggleTask(task)}
                                        className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${
                                            isCompleted 
                                                ? 'bg-green-600 border-green-600 text-white' 
                                                : 'border-gray-300 hover:border-green-500 text-transparent bg-white'
                                        }`}
                                    >
                                        {isCompleted && <CheckCircle className="w-3 h-3" />}
                                    </button>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-xs font-medium truncate ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                            {task.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {task.timeline?.dueDate && (
                                                <span className="inline-flex items-center text-[9px] text-gray-400 font-medium">
                                                    <Calendar className="w-2.5 h-2.5 mr-0.5" />
                                                    {formatDueDate(task.timeline.dueDate)}
                                                </span>
                                            )}
                                            {task.priority && (
                                                <span className={`px-1.5 py-0.25 rounded border font-semibold tracking-wider uppercase ${getPriorityStyles(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 p-1 rounded transition-all duration-150"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-6 flex flex-col items-center justify-center h-full">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-2 animate-bounce">
                            <ListTodo className="w-5 h-5 text-green-600" />
                        </div>
                        <p className='text-xs font-semibold text-gray-700 mb-0.5'>All caught up! 🥂</p>
                        <p className="text-[10px] text-gray-400">No pending operations listed.</p>
                    </div>
                )}
            </div>

            {/* Bottom Actions Panel */}
            <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">
                    {hasTasks ? `${completedCount} of ${tasks.length} completed` : 'Plan your operations'}
                </span>
                <Link 
                    href="/farm-operation?tab=planner" 
                    className="text-green-600 font-bold hover:text-green-700 transition-colors flex items-center gap-0.5"
                >
                    View All Tasks →
                </Link>
            </div>
        </Card>
    );
};

export default DashboardTasks;