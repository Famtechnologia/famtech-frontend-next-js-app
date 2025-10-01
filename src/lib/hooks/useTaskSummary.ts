// hooks/useTaskSummary.ts (Conceptual Implementation)

import useSWR from 'swr';
import { useAuthStore } from '@/lib/store/authStore';
import { getTasks } from '@/lib/services/taskplanner'; // Assuming your task API file is here

// SWR fetcher function wrapper
const taskFetcher = async (userId: string) => {
    if (!userId) {
        throw new Error("User ID is required to fetch tasks.");
    }
    // 🔑 Calls your API function, passing the ID
    const tasks = await getTasks(userId); 
    
    // Sort logic (Incomplete first, then by date)
    return tasks.sort((a, b) => {
        // Assume task.status === 'completed' for filtering
        const statusA = a.status === 'completed'; 
        const statusB = b.status === 'completed'; 
        
        if (statusA !== statusB) {
            return statusA ? 1 : -1; // Incomplete tasks come first
        }
        
        // Then sort by dueDate (earlier dates first)
        const dateA = a.timeline?.dueDate || '';
        const dateB = b.timeline?.dueDate || '';
        return dateA.localeCompare(dateB);
    });
};

export const useTaskSummary = () => {
    // 1. Get the authenticated user's ID
    const userId = useAuthStore((state) => state.user?.id);
    
    // 2. Pass the user ID as the key to SWR
    const { data, error, isLoading, mutate } = useSWR(userId ? userId : null, taskFetcher);

    // ... rest of the return logic
    return {
        tasks: data || [],
        isLoading: isLoading,
        error: error,
        mutate,
    };
};