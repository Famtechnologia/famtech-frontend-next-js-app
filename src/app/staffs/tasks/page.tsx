"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  RefreshCcw,
  Sprout,
  PawPrint,
  Settings,
  SquarePen,
} from "lucide-react";
import { getFarmProfile, ProfileType } from "@/lib/services/farm";
import { useAssignee } from "@/lib/hooks/Assignee";
import Card from "@/components/ui/Card";

import {
  getTasks,
  updateTask,
  Task as ApiTask,
} from "@/lib/services/taskplanner";
import TaskSkeleton from "@/components/layout/skeleton/farm-operation/TaskPlanner";
import Modal from "@/components/ui/Modal";

interface Task {
  id: string;
  type: string;
  name: string;
  time: string;
  user: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  status: "pending" | "ongoing" | "completed";
  description: string;
  notes?: string;
  dueDate?: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [farmProfile, setFarmProfile] = React.useState<ProfileType | null>(
    null
  );
  const [, setSelectedTask] = useState<Task | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const { user } = useAssignee();
  React.useEffect(() => {
    const fetchFarmProfile = async () => {
      if (!user?.farmId) return;
      const profile = await getFarmProfile(user.farmId);
      setFarmProfile(profile);
    };
    fetchFarmProfile();
  }, [user]);

  type ApiTaskWithId = ApiTask & { id: string };

  const fetchTasks = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await getTasks(
        farmProfile?.userId as string
      )) as ApiTaskWithId[];

      const mappedTasks: Task[] = data.map((task) => {
        const dateObject = task.timeline?.dueDate
          ? new Date(task.timeline.dueDate)
          : null;

        const formattedDateForDisplay = dateObject
          ? dateObject.toLocaleDateString("en-US", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "N/A";

        return {
          id: task.id,
          type: task.taskType.charAt(0).toUpperCase() + task.taskType.slice(1),
          name: task.title,
          time: task.timeline?.dueTime || "N/A",
          user: task.assignee,
          priority:
            (task.priority?.toLowerCase() as "low" | "medium" | "high") ??
            "low",
          completed: task.status === "completed",
          status:
            (task.status as "pending" | "ongoing" | "completed") ?? "pending",
          description: task.note ?? "",
          notes: task.note,
          dueDate: formattedDateForDisplay,
        };
      });

      setTasks(mappedTasks);
    } catch (err) {
      console.error(err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [farmProfile?.userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const taskTypeIcons = {
    "Crop task": { label: "Crop Tasks", icon: Sprout },
    "Livestock task": { icon: PawPrint, label: "Livestock Tasks" },
    "General task": { icon: Settings, label: "General Tasks" },
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.user.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleMarkAsCompleted = async (task: Task) => {
    console.log(task);
    if (!task?.id) return;
    try {
      if (task?.status === "completed") {
        const res = await updateTask(task?.id as string, {
          ...task,
          status: "pending",
        });
        console.log(res)
      } else {
        const res = await updateTask(task?.id as string, {
          ...task,
          status: "completed",
        });
        console.log(res);
      }
      fetchTasks();
      setShowConfirm(false);
    } catch (err) {
      console.error("Failed to complete task", err);
    }
  };

  if (loading) {
    return <TaskSkeleton />;
  }
  return (
    <div className="p-0 md:p-6 bg-white">
      <h1 className="text-3xl font-semibold text-green-700 mb-6">
        Farm Operations
      </h1>

      {/* Render the Active Component */}
      <div className="mt-4">
        <div className="p-2 lg:p-6 bg-white min-h-screen">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 w-full">
              <h1 className="text-2xl font-bold text-gray-800 hidden md:block">
                Task Dashboard
              </h1>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <button
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors duration-200"
                  onClick={fetchTasks}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" /> Sync
                </button>
              </div>
            </div>

            <div className="space-y-6 md:space-y-0 md:flex md:space-x-6 ">
              <div className="flex-1 space-y-6">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
                  />
                </div>
                {loading && <TaskSkeleton />}

                {error && (
                  <div className="text-center py-8 text-red-500">
                    Error: Could not fetch tasks. Please try again.
                  </div>
                )}
                {!loading && !error && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-gray-500 uppercase">
                      All ({filteredTasks.length})
                    </h3>
                    <div className="space-y-1 divide-y-t divide-gray-200 grid grid-col-1 lg:grid-cols-2">
                      {filteredTasks.map((task) => {
                        const TaskIcon =
                          taskTypeIcons[task.type as keyof typeof taskTypeIcons]
                            ?.icon || CheckCircle;

                        return (
                          <Card
                            key={task.id}
                            title={task.name}
                            className="flex flex-col justify-between h-full shadow-lg hover:shadow-xl transition-shadow duration-300 capitalize"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center space-x-4">
                                <div
                                  className={`p-3 rounded-full ${getPriorityColor(
                                    task.priority
                                  )} bg-opacity-20`}
                                >
                                  <TaskIcon
                                    className={`h-8 w-8 ${
                                      task.priority === "high"
                                        ? "text-red-600"
                                        : task.priority === "medium"
                                          ? "text-yellow-600"
                                          : "text-green-600"
                                    }`}
                                  />
                                </div>
                                <div>
                                  <p className="font-semibold text-lg capitalize">
                                    {task.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {task.user}
                                  </p>
                                </div>
                              </div>
                              <div className="pt-4 space-y-2">
                                <p className="flex justify-between text-sm">
                                  <span className="text-gray-500">
                                    Due Date:
                                  </span>
                                  <span className="font-semibold text-gray-800">
                                    {task.dueDate}
                                  </span>
                                </p>
                                <p className="flex justify-between text-sm">
                                  <span className="text-gray-500">Time:</span>
                                  <span className="font-semibold text-gray-800">
                                    {task.time}
                                  </span>
                                </p>
                                <p className="flex justify-between text-sm">
                                  <span className="text-gray-500">
                                    Priority:
                                  </span>
                                  <span
                                    className={`font-semibold capitalize ${
                                      task.priority === "high"
                                        ? "text-red-600"
                                        : task.priority === "medium"
                                          ? "text-yellow-600"
                                          : "text-green-600"
                                    }`}
                                  >
                                    {task.priority}
                                  </span>
                                </p>
                              </div>
                            </div>
                            {/* Actions */}
                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                              <div
                                className={`flex items-center text-sm font-medium ${task?.status === "completed" ? "text-green-600 hover:text-green-800 bg-green-500/10" : "text-yellow-600 hover:text-yellow-800 bg-yellow-500/10"} transition-colors capitalize rounded-full px-4 py-1`}
                              >
                                {task?.status}
                              </div>
                              <button
                                className="flex items-center text-sm font-medium text-green-600 hover:text-green-800 transition-colors"
                                onClick={() => {
                                  setShowConfirm(true);
                                  setSelectedTask(task);
                                }}
                              >
                                <SquarePen className="h-4 w-4 mr-1" />
                                Mark as Completed
                              </button>
                            </div>
                            <Modal
                              show={showConfirm}
                              onClose={() => setShowConfirm(false)}
                              title="Task Completion"
                            >
                              <div className="flex flex-col space-y-4">
                                <p className="text-gray-600 text-lg">
                                  Are You sure you have done the task?
                                </p>
                                <div className="flex justify-end space-x-3 mt-6">
                                  <button
                                    onClick={() => setShowConfirm(false)}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                  >
                                    Close
                                  </button>
                                  <button
                                    onClick={() => handleMarkAsCompleted(task)}
                                    className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                                  >
                                    Yes, Mark as Completed
                                  </button>
                                </div>
                              </div>
                            </Modal>
                          </Card>
                        );
                      })}
                      {filteredTasks.length === 0 && (
                        <div className="text-center py-12 col-span-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                          <p className="text-gray-500 text-lg font-medium">
                            No tasks found.
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            Try a different search term or click Add Staff to
                            get started.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
