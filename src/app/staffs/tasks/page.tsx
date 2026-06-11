"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  CheckCircle,
  RefreshCcw,
  Sprout,
  PawPrint,
  Settings,
  SquarePen,
  Clock,
  ClipboardList,
  User,
  Calendar,
  Loader2,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";
import { getFarmProfile, ProfileType } from "@/lib/services/farm";
import { useAssignee } from "@/lib/hooks/Assignee";
import Card from "@/components/ui/Card";
import toast from "react-hot-toast";

import {
  getTasks,
  updateTask,
  Task as ApiTask,
} from "@/lib/services/taskplanner";
import TaskSkeleton from "@/components/skeleton/farm-operation/TaskPlanner";
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
  blocker?: string;
  restockRequired?: boolean;
  restockNotes?: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [farmProfile, setFarmProfile] = useState<ProfileType | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"mine" | "all">("mine");

  // Modal edit states
  const [modalStatus, setModalStatus] = useState<"pending" | "ongoing" | "completed">("pending");
  const [modalNotes, setModalNotes] = useState<string>("");
  const [modalBlocker, setModalBlocker] = useState<string>("");
  const [modalRestockRequired, setModalRestockRequired] = useState<boolean>(false);
  const [modalRestockNotes, setModalRestockNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const { user } = useAssignee();

  useEffect(() => {
    const fetchFarmProfile = async () => {
      if (!user?.farmId) return;
      try {
        const profile = await getFarmProfile(user.farmId);
        setFarmProfile(profile);
      } catch (err) {
        console.error("Failed to fetch farm profile:", err);
      }
    };
    fetchFarmProfile();
  }, [user]);

  type ApiTaskWithId = ApiTask & { id: string };

  const fetchTasks = useCallback(async () => {
    if (!farmProfile?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = (await getTasks(
        farmProfile.id as string
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
          blocker: task.blocker || "",
          restockRequired: !!task.restockRequired,
          restockNotes: task.restockNotes || "",
        };
      });

      setTasks(mappedTasks);
    } catch (err) {
      console.error(err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [farmProfile?.id]);

  useEffect(() => {
    if (farmProfile?.id) {
      fetchTasks();
    }
  }, [farmProfile?.id, fetchTasks]);

  const taskTypeIcons = {
    "Crop task": { label: "Crop Tasks", icon: Sprout },
    "Livestock task": { icon: PawPrint, label: "Livestock Tasks" },
    "General task": { icon: Settings, label: "General Tasks" },
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.user.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = activeTab === "mine" ? task.user === user?.email : true;

    return matchesSearch && matchesTab;
  });

  // Stats calculation for the logged in worker
  const myTasks = tasks.filter((t) => t.user === user?.email);
  const totalMyTasks = myTasks.length;
  const pendingMyTasks = myTasks.filter((t) => t.status === "pending").length;
  const ongoingMyTasks = myTasks.filter((t) => t.status === "ongoing").length;
  const completedMyTasks = myTasks.filter((t) => t.status === "completed").length;
  const completionPercentage =
    totalMyTasks > 0 ? Math.round((completedMyTasks / totalMyTasks) * 100) : 0;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-600 rounded-full">
            High
          </span>
        );
      case "medium":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-600 rounded-full">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 rounded-full">
            Low
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-full">
            <CheckCircle className="h-3.5 w-3.5" /> Completed
          </span>
        );
      case "ongoing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold text-amber-600 bg-amber-50 rounded-full">
            <span className="relative flex h-1.5 w-1.5 mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
            </span>
            Ongoing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold text-slate-550 bg-slate-100 rounded-full">
            Pending
          </span>
        );
    }
  };

  const handleSaveProgress = async () => {
    if (!selectedTask?.id) return;
    setIsSaving(true);
    try {
      await updateTask(selectedTask.id, {
        status: modalStatus,
        note: modalNotes,
        blocker: modalBlocker,
        restockRequired: modalRestockRequired,
        restockNotes: modalRestockRequired ? modalRestockNotes : "",
      });
      toast.success("Progress updated successfully!");
      fetchTasks();
      setShowConfirm(false);
      setSelectedTask(null);
    } catch (err) {
      console.error("Failed to update task", err);
      toast.error("Failed to update task. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && tasks.length === 0) {
    return <TaskSkeleton />;
  }

  return (
    <div className="p-0 md:p-6 bg-slate-50 min-h-screen">
      <div className="container mx-auto max-w-7xl">
        
        {/* greeting banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-md mb-8 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-y-6 translate-x-6">
            <Sprout size={200} />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-1">
              Welcome back, {user?.name || "Team Member"}!
            </h2>
            <p className="text-emerald-100 text-sm md:text-base mb-6">
              Here is your task dashboard for today. Keep track of your duties and update status in real-time.
            </p>
            
            {/* Progress Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-md border border-white/10">
              <div className="flex justify-between items-center text-xs md:text-sm font-semibold mb-2">
                <span>Your Completion Progress</span>
                <span>{completedMyTasks} / {totalMyTasks} Tasks ({completionPercentage}%)</span>
              </div>
              <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase">Total Assigned</p>
              <h3 className="text-2xl font-black text-gray-800 mt-0.5">{totalMyTasks}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex items-center space-x-4">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase">Pending</p>
              <h3 className="text-2xl font-black text-gray-800 mt-0.5">{pendingMyTasks}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <RefreshCcw className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase">Ongoing</p>
              <h3 className="text-2xl font-black text-gray-800 mt-0.5">{ongoingMyTasks}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase">Completed</p>
              <h3 className="text-2xl font-black text-gray-800 mt-0.5">{completedMyTasks}</h3>
            </div>
          </div>
        </div>

        {/* filter bar */}
        <div className="bg-white p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("mine")}
              className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
                activeTab === "mine"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-gray-650 hover:text-gray-900"
              }`}
            >
              My Assigned Tasks
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
                activeTab === "all"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-gray-650 hover:text-gray-900"
              }`}
            >
              All Farm Tasks
            </button>
          </div>

          <div className="flex flex-1 md:justify-end items-center space-x-4 w-full md:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search task title or assignee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <button
              onClick={fetchTasks}
              className="flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors"
            >
              <RefreshCcw className="h-4 w-4 mr-1.5" />
              Sync
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 text-center my-8">
            Error: Could not fetch tasks. Please try again.
          </div>
        )}

        {/* task list grid */}
        {!error && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                Tasks ({filteredTasks.length})
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => {
                return (
                  <div 
                    key={task.id} 
                    className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.07)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
                          {task.type}
                        </span>
                        {getPriorityBadge(task.priority)}
                      </div>
                      <h4 className="text-base font-bold text-gray-800 mb-1 leading-snug">
                        {task.name}
                      </h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <User size={13} className="text-gray-400" /> Assigned to: <span className="font-semibold text-gray-600">{task.user}</span>
                      </p>
                    </div>

                    {/* Card Details */}
                    <div className="p-5 bg-slate-50/40 space-y-3 flex-1">
                      {task.notes && (
                        <div className="text-xs text-gray-600 bg-white p-2.5 rounded-xl italic">
                          "{task.notes}"
                        </div>
                      )}
                      {task.blocker && (
                        <div className="text-xs text-red-700 bg-red-50 border border-red-100 p-2.5 rounded-xl flex items-start gap-1.5 font-medium">
                          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[10px] block uppercase text-red-800 tracking-wider mb-0.5">Blocker Flagged</span>
                            {task.blocker}
                          </div>
                        </div>
                      )}
                      {task.restockRequired && (
                        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 p-2.5 rounded-xl flex items-start gap-1.5 font-medium">
                          <ShoppingCart className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[10px] block uppercase text-amber-800 tracking-wider mb-0.5">Restock Requested</span>
                            {task.restockNotes || "Materials/tools finished and need restocking."}
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-550 font-medium">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="block text-[9px] text-gray-400 leading-none mb-0.5">DUE DATE</span>
                            <span className="text-gray-700 font-bold">{task.dueDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-550 font-medium">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="block text-[9px] text-gray-400 leading-none mb-0.5">DUE TIME</span>
                            <span className="text-gray-700 font-bold">{task.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-4 flex justify-between items-center bg-white">
                      {getStatusBadge(task.status)}
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setModalStatus(task.status);
                          setModalNotes(task.notes || "");
                          setModalBlocker(task.blocker || "");
                          setModalRestockRequired(!!task.restockRequired);
                          setModalRestockNotes(task.restockNotes || "");
                          setShowConfirm(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                      >
                        <SquarePen className="h-3.5 w-3.5" />
                        Update Progress
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredTasks.length === 0 && (
                <div className="text-center py-12 col-span-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-8">
                  <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="h-8 w-8" />
                  </div>
                  <p className="text-gray-800 text-lg font-bold">No tasks found</p>
                  <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
                    Try a different search term or check with the administrator.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* UPDATE STATUS MODAL */}
      {selectedTask && (
        <Modal
          show={showConfirm}
          onClose={() => {
            setShowConfirm(false);
            setSelectedTask(null);
          }}
          title={`Update Progress: ${selectedTask.name}`}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Task Status
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* Pending */}
                <button
                  type="button"
                  onClick={() => setModalStatus("pending")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    modalStatus === "pending"
                      ? "border-slate-500 bg-slate-50 text-slate-800"
                      : "border-gray-200 hover:border-gray-300 text-gray-500"
                  }`}
                >
                  <Clock className={`h-6 w-6 mb-2 ${modalStatus === 'pending' ? 'text-slate-600' : 'text-gray-400'}`} />
                  <span className="text-xs font-bold">Pending</span>
                </button>
                {/* Ongoing */}
                <button
                  type="button"
                  onClick={() => setModalStatus("ongoing")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    modalStatus === "ongoing"
                      ? "border-amber-500 bg-amber-50 text-amber-800"
                      : "border-gray-200 hover:border-gray-300 text-gray-500"
                  }`}
                >
                  <RefreshCcw className={`h-6 w-6 mb-2 ${modalStatus === 'ongoing' ? 'text-amber-500 animate-spin' : 'text-gray-400'}`} />
                  <span className="text-xs font-bold">Ongoing</span>
                </button>
                {/* Completed */}
                <button
                  type="button"
                  onClick={() => setModalStatus("completed")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    modalStatus === "completed"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : "border-gray-200 hover:border-gray-300 text-gray-500"
                  }`}
                >
                  <CheckCircle className={`h-6 w-6 mb-2 ${modalStatus === 'completed' ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span className="text-xs font-bold">Completed</span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="modal-notes" className="block text-sm font-semibold text-gray-700 mb-2">
                Progress Notes / Feedback
              </label>
              <textarea
                id="modal-notes"
                rows={3}
                placeholder="Describe what has been done, or any issues encountered..."
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                className="w-full p-3 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-800"
              />
            </div>

            {/* Blocker Input */}
            <div>
              <label htmlFor="modal-blocker" className="block text-sm font-semibold text-gray-700 mb-2">
                Flag a Blocker (Optional)
              </label>
              <textarea
                id="modal-blocker"
                rows={2}
                placeholder="Specify if there is anything stopping you from completing this task..."
                value={modalBlocker}
                onChange={(e) => setModalBlocker(e.target.value)}
                className="w-full p-3 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-gray-800"
              />
            </div>

            {/* Restock Needs */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5 text-amber-500" />
                  <label htmlFor="modal-restock-checkbox" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Tools / Materials Finished? (Needs Restock)
                  </label>
                </div>
                <input
                  id="modal-restock-checkbox"
                  type="checkbox"
                  checked={modalRestockRequired}
                  onChange={(e) => setModalRestockRequired(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              {modalRestockRequired && (
                <textarea
                  id="modal-restock-notes"
                  rows={2}
                  placeholder="List the tools or materials that are finished or need to be restocked..."
                  value={modalRestockNotes}
                  onChange={(e) => setModalRestockNotes(e.target.value)}
                  className="w-full p-3 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-gray-800"
                />
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setSelectedTask(null);
                }}
                className="px-4 py-2 text-sm font-semibold text-gray-650 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProgress}
                disabled={isSaving}
                className="flex items-center px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-emerald-400 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
