"use client";
import React from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";

import {
  CheckCircle,
  Loader2,
  ListChecks,
  AlertTriangle,
} from "lucide-react";
import { getTasks, updateTask, Task } from "@/lib/services/taskplanner";
import useSWR from "swr";
import { useAssignee } from "@/lib/hooks/Assignee";
import { getFarmProfile, ProfileType } from "@/lib/services/farm";

const taskFetcher = async ([, userId, email]: [string, string, string]) => {
  if (!userId) throw new Error("User ID is required.");

  const tasks = await getTasks(userId);

  return tasks.filter(t => t.assignee === email).sort((a, b) => {
    const statusA = a.status === "completed";
    const statusB = b.status === "completed";

    if (statusA !== statusB) {
      return statusA ? 1 : -1;
    }

    // 2. Then sort by dueDate (earlier dates first)
    const dateA = a.timeline?.dueDate || "9999-12-31";
    const dateB = b.timeline?.dueDate || "9999-12-31";
    return dateA.localeCompare(dateB);
  });
};

export const useTaskSummary = () => {
  // Ensuring the hook only runs once the client environment is ready
  const [isClient, setIsClient] = React.useState(false);
  const [farmProfile, setFarmProfile] = React.useState<ProfileType | null>(
    null
  );
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  const { user } = useAssignee();
  React.useEffect(() => {
    const fetchFarmProfile = async () => {
      if (!user?.farmId) return;
      const profile = await getFarmProfile(user.farmId);
      setFarmProfile(profile);
    };
    fetchFarmProfile();
  }, [user]);

  const userId = farmProfile?.userId;

  const swrKey = isClient && userId ? ["tasks", userId, user.email] : null;

  const { data, error, isLoading, mutate } = useSWR(swrKey, taskFetcher);

  return {
    tasks: data || [],
    isLoading: isLoading,
    error: error,
    mutate,
  };
};

const DashboardTasks = () => {
  const { tasks, isLoading, error, mutate } = useTaskSummary();

  const handleToggleTask = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";

    try {
      console.log(task)
      // Optimistic UI update can be added here (e.g., mutate(..., false))
      await updateTask(task.id as string, {
        ...task,
        status: newStatus,
      });

      // Re-fetch data to update the list
      mutate();
    } catch (e) {
      console.error("Failed to update task status:", e);
      mutate(); // Revert to server state on error
    }
  };

  // 1. Initial Loading State (Should show immediately if fetching starts)
  if (isLoading) {
    return (
      <Card
        title="Task Planner"
        headerClassName="bg-green-50"
        bodyClassName="p-6 flex items-center justify-center h-[350px]"
      >
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </Card>
    );
  }

  // 2. Error State (If API call fails)
  if (error) {
    return (
      <Card
        title="Task Planner"
        headerClassName="bg-red-50"
        bodyClassName="p-6 flex items-center justify-center h-[350px]"
      >
        <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
        <span className="text-red-600 text-base">Could not load tasks.</span>
      </Card>
    );
  }

  const tasksToDisplay = tasks.slice(0, 3);
  const completedCount = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const isCompleted = (task: Task) => task.status === "completed";

  const hasTasks = tasks.length > 0;

  // --- Dynamic Content based on task count ---
  let taskListContent;
  let buttonContent;
  let summaryContent;

  if (hasTasks) {
    taskListContent = tasksToDisplay.map((task) => (
      <div key={task.id} className="flex items-center space-x-3">
        <button
          onClick={() => handleToggleTask(task)}
          className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${
            isCompleted(task)
              ? "bg-green-500 border-green-500 text-white"
              : "border-green-300 hover:border-green-400 text-transparent"
          }`}
        >
          {isCompleted(task) && <CheckCircle className="w-3 h-3" />}
        </button>
        <span
          className={`text-lg break-words ${isCompleted(task) ? "text-gray-500 line-through" : "text-gray-800"}`}
        >
          {task.title}
        </span>
      </div>
    ));

    summaryContent = (
      <div className="text-lg text-gray-600">
        {completedCount} of {tasks.length} completed
      </div>
    );

    
      <Link
        href="/farm-operation?tab=planner"
        className="text-green-600 text-base font-medium hover:text-green-700 flex items-center"
      >
        View all tasks →
      </Link>
    
  } else {
    // --- Zero-State Content ---
    taskListContent = (
      <div className="text-base text-gray-500 py-4 flex flex-col items-center justify-center h-full text-center">
        <ListChecks className="w-8 h-8 text-gray-400 mb-2" />
        <p className="font-medium text-gray-700">
          You&apos;re all caught up! 🥂
        </p>
        <p>No tasks found. </p>
      </div>
    );

    summaryContent = (
      <div className="text-sm text-gray-600">Ready to plan your day.</div>
    );

  }

  return (
    <Card
      title="Task Planner"
      className="h-[360px] flex flex-col" // Added flex-col to card container
      headerClassName="bg-green-50 border-b border-green-200"
      bodyClassName="p-6 flex flex-col flex-grow" // Added flex-col and flex-grow to card body
    >
      {/* Main content wrapper with vertical distribution */}
      <div className="flex flex-col flex-grow justify-between">
        {/* TOP SECTION: Task List / Zero State */}
        <div
          className={
            hasTasks ? "space-y-4" : "flex-grow flex flex-col justify-center"
          }
        >
          {taskListContent}
        </div>

        {/* BOTTOM SECTION: Summary and Button */}
        <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
          {/* Summary (Completed count or "Ready to plan...") */}
          {summaryContent}
        </div>
      </div>
    </Card>
  );
};

export default DashboardTasks;
