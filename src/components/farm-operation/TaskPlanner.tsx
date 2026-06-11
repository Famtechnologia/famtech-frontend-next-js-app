import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  CheckCircle,
  ChevronRight,
  RefreshCcw,
  Sprout,
  PawPrint,
  Settings,
  AlertTriangle,
  Calendar,
  Clock,
} from "lucide-react";
import Modal from "../ui/Modal";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  Task as ApiTask,
} from "../../lib/services/taskplanner";
import TaskSkeleton from "@/components/skeleton/farm-operation/TaskPlanner";
import { StaffType, getStaffs } from "@/lib/services/staff";
import { useProfile } from "@/lib/hooks/useProfile";
import { useAuth } from "@/lib/hooks/useAuth";
import toast from "react-hot-toast";

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

interface TaskFormProps {
  mode: "new" | "edit";
  title: string;
  setTitle: (title: string) => void;
  status: "Pending" | "Ongoing" | "Completed";
  setStatus: (status: "Pending" | "Ongoing" | "Completed") => void;
  priority: "Low" | "Medium" | "High";
  setPriority: (priority: "Low" | "Medium" | "High") => void;
  taskType: string;
  setTaskType: (type: string) => void;
  assignee: string;
  setAssignee: (assignee: string) => void;
  dueDate: string;
  setDueDate: (date: string) => void;
  dueTime: string;
  setDueTime: (time: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
  onDelete: () => void;
  isSaving: boolean; // NEW: Indicates if a save/delete operation is in progress
}

const TaskForm: React.FC<TaskFormProps> = ({
  mode,
  title,
  setTitle,
  status,
  setStatus,
  priority,
  setPriority,
  taskType,
  setTaskType,
  assignee,
  setAssignee,
  dueDate,
  setDueDate,
  dueTime,
  setDueTime,
  notes,
  setNotes,
  onSave,
  onClose,
  onDelete,
  isSaving, // Destructured
}) => {
  const [staff, setStaff] = useState<StaffType[]>([]);

  const { profile } = useProfile();
  const { user } = useAuth();

  const fetchStaffData = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await getStaffs(profile.id);
      setStaff(data);
    } catch (error) {
      console.error("Failed to fetch staff data:", error);
    }
  }, [profile]);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  return (
    <form onSubmit={onSave} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isSaving}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-800 disabled:bg-gray-50"
          />
        </div>
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "Pending" | "Ongoing" | "Completed")
            }
            disabled={isSaving}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-800 disabled:bg-gray-50"
          >
            <option>Pending</option>
            <option>Ongoing</option>
            <option>Completed</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as "Low" | "Medium" | "High")
            }
            disabled={isSaving}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-800 disabled:bg-gray-50"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="taskType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Task Type
          </label>
          <select
            id="taskType"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            disabled={isSaving}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-800 disabled:bg-gray-50"
          >
            <option value="General task">General task</option>
            <option value="Crop task">Crop task</option>
            <option value="Livestock task">Livestock task</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="assignee"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Assigned To
          </label>
          <select
            id="assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            disabled={isSaving}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-800 disabled:bg-gray-50"
          >
            <option value="" disabled>Select a staff member</option>
            {user?.email && (
              <option value={user.email}>
                {profile?.owner ? `${profile.owner.firstName} ${profile.owner.lastName} (Me)` : "Me"}
              </option>
            )}
            {staff?.map((staff) => (
              <option key={staff.email} value={staff.email}>
                {staff.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            disabled={isSaving}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800 disabled:bg-gray-50"
          />
        </div>
        <div>
          <label
            htmlFor="dueTime"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Due Time
          </label>
          <input
            type="time"
            id="dueTime"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            required
            disabled={isSaving}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800 disabled:bg-gray-50"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Notes
        </label>
        <textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSaving}
          className="w-full p-2 border border-gray-300 rounded-md resize-none text-gray-800 disabled:bg-gray-50"
        ></textarea>
      </div>
      <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
        {mode === "edit" && (
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-red-600 rounded-md border border-gray-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onDelete}
            disabled={isSaving}
          >
            Delete Task
          </button>
        )}
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onClose}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white rounded-md bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:bg-green-700 disabled:cursor-not-allowed"
          disabled={isSaving}
        >
          {isSaving
            ? "Saving..."
            : mode === "new"
              ? "Create Task"
              : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

const App: React.FC = () => {
  const { profile } = useProfile();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalMode, setModalMode] = useState<"new" | "edit">("new");

  // NEW state for the Delete Confirmation modal
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formStatus, setFormStatus] = useState<
    "Pending" | "Ongoing" | "Completed"
  >("Pending");
  const [formPriority, setFormPriority] = useState<"Low" | "Medium" | "High">(
    "Low"
  );
  const [formAssignee, setFormAssignee] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formTaskType, setFormTaskType] = useState("General task");
  const [formDueDate, setFormDueDate] = useState("");
  const [formDueTime, setFormDueTime] = useState("");

  type ApiTaskWithId = ApiTask & { id: string };

  const fetchTasks = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await getTasks(profile?.id as string)) as ApiTaskWithId[];

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
  }, [profile?.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formAssignee) {
      toast.error("Please assign the task to yourself or a staff member.");
      return;
    }

    // Convert taskType: "General task" -> "general_task" for the API
    const taskTypeForApi = formTaskType.toLowerCase();

    const taskData = {
      title: formTitle,
      status: formStatus.toLowerCase(),
      priority: formPriority.toLowerCase(),
      timeline: {
        dueDate: formDueDate,
        dueTime: formDueTime,
      },
      note: formNotes,
      taskType: taskTypeForApi,
      assignee: formAssignee,
      userId: profile?.id,
      entity_id: "sample_entity_id",
    };

    setLoading(true);
    try {
      if (modalMode === "new") {
        await createTask(taskData);
        toast.success("Task created successfully!");
      } else if (selectedTask) {
        await updateTask(selectedTask.id, taskData);
        toast.success("Task updated successfully!");
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err: any) {
      console.error("Failed to save task:", err);
      setError(err as Error);
      const errMsg = err?.response?.data?.errors?.[0]?.msg || err?.response?.data?.error || err?.message || "Failed to save task";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // 1. Function to open the confirmation modal (replaces window.confirm)
  const handleDeleteClick = () => {
    if (selectedTask) {
      // Close the main task form modal and open the confirmation modal
      setIsModalOpen(false);
      setIsConfirmDeleteOpen(true);
    }
  };

  // 2. Function to execute the actual deletion
  const handleConfirmDelete = async () => {
    if (!selectedTask) return;

    // Close the confirmation modal
    setIsConfirmDeleteOpen(false);

    setLoading(true);
    try {
      await deleteTask(selectedTask.id);
      toast.success("Task deleted successfully!");
      fetchTasks();
    } catch (err: any) {
      console.error("Failed to delete task:", err);
      setError(err as Error);
      toast.error(err?.message || "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const openNewTaskModal = () => {
    setSelectedTask(null);
    setModalMode("new");
    setFormTitle("");
    setFormStatus("Pending");
    setFormPriority("Low");
    setFormAssignee("");
    setFormNotes("");
    setFormTaskType("General task");
    setFormDueDate("");
    setFormDueTime("");
    setIsModalOpen(true);
  };

  // Helper to convert DD-MM-YYYY to YYYY-MM-DD for date input
  const convertDateToInputFormat = (dateString: string): string => {
    if (!dateString || dateString === "N/A") return "";
    // Assuming dateString is "DD-MM-YYYY" from the fetchTasks mapping
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
    }
    // Simple check for already formatted dates
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
    return "";
  };

  const openEditTaskModal = (task: Task) => {
    setSelectedTask(task);
    setModalMode("edit");
    setFormTitle(task.name);
    setFormStatus(
      (task.status.charAt(0).toUpperCase() + task.status.slice(1)) as
        | "Pending"
        | "Ongoing"
        | "Completed"
    );
    setFormPriority(
      (task.priority.charAt(0).toUpperCase() + task.priority.slice(1)) as
        | "Low"
        | "Medium"
        | "High"
    );
    setFormAssignee(task.user);
    setFormNotes(task.notes || "");
    setFormTaskType(task.type);
    setFormDueDate(convertDateToInputFormat(task.dueDate || ""));
    setFormDueTime(task.time || "");
    setIsModalOpen(true);
  };

  const taskTypeIcons = {
    "Crop task": { label: "Crop Tasks", icon: Sprout },
    "Livestock task": { icon: PawPrint, label: "Livestock Tasks" },
    "General task": { icon: Settings, label: "General Tasks" },
  };

  const filteredTasks = tasks.filter((task) => {
    const now = new Date();
    // Reformat for filtering since task.dueDate is DD-MM-YYYY format
    const dueParts = task.dueDate?.split("-") || [];
    const due =
      dueParts.length === 3
        ? new Date(`${dueParts[2]}-${dueParts[1]}-${dueParts[0]}`)
        : null;

    let matchesFilter = false;

    if (activeFilter === "All") {
      matchesFilter = true;
    } else if (activeFilter === "Completed") {
      matchesFilter = task.completed;
    } else if (activeFilter === "This Week") {
      if (due && !isNaN(due.getTime())) {
        const weekFromNow = new Date();
        weekFromNow.setDate(now.getDate() + 7);
        matchesFilter = due >= now && due <= weekFromNow;
      }
    } else if (activeFilter === "Overdue") {
      if (due && !isNaN(due.getTime())) {
        matchesFilter = due < now && !task.completed;
      }
    } else {
      matchesFilter = task.type === activeFilter;
    }

    const matchesSearch =
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.user.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-amber-600 bg-amber-50";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case "Crop task":
        return "Crop Tasks";
      case "Livestock task":
        return "Livestock Tasks";
      case "General task":
        return "General Tasks";
      case "Completed":
        return "Completed Tasks";
      default:
        return "All Tasks";
    }
  };
  if (loading) {
    return <TaskSkeleton />;
  }

  return (
    <div className="p-2 lg:p-6 bg-white min-h-screen">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 w-full">
          <h1 className="text-2xl font-bold text-gray-800 hidden md:block">
            Task Dashboard
          </h1>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-md border bg-green-600 hover:bg-green-700 transition-transform duration-200 scale-100 hover:scale-105"
              onClick={openNewTaskModal}
            >
              <Plus className="h-4 w-4 mr-2" /> New Task
            </button>
            <button
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors duration-200"
              onClick={fetchTasks}
            >
              <RefreshCcw className="h-4 w-4 mr-2" /> Sync
            </button>
          </div>
        </div>

        <div className="space-y-6 md:space-y-0 md:flex md:space-x-6 ">
          <div className="w-full md:w-64 space-y-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                FILTER TASKS
              </h3>
              <div className="space-y-2">
                {["All", "This Week", "Overdue", "Completed"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      activeFilter === filter
                        ? "bg-green-100 text-green-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                TASK TYPES
              </h3>
              <div className="space-y-2">
                {(
                  Object.keys(taskTypeIcons) as (keyof typeof taskTypeIcons)[]
                ).map((type) => {
                  const label = taskTypeIcons[type].label;
                  const IconComponent = taskTypeIcons[type].icon;
                  const tasksCount = tasks.filter(
                    (t) => t.type === type
                  ).length;
                  return (
                    <button
                      key={type}
                      onClick={() => setActiveFilter(type)}
                      className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        activeFilter === type
                          ? "bg-green-100 text-green-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-4 w-4 text-green-500" />
                        <span>{label}</span>
                      </div>
                      <span className="text-gray-400 text-xs">
                        ({tasksCount})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

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
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                  {getTaskTypeLabel(activeFilter)} ({filteredTasks.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTasks.map((task) => {
                    const isCrop = task.type.toLowerCase().includes("crop");
                    const isLivestock = task.type.toLowerCase().includes("livestock");
                    const typeColor = isCrop
                      ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                      : isLivestock
                      ? "text-purple-700 bg-purple-50 border-purple-100"
                      : "text-blue-700 bg-blue-50 border-blue-100";

                    return (
                      <div
                        key={task.id}
                        className={`group relative flex flex-col justify-between p-5 bg-gradient-to-br from-white to-slate-50/40 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-300 cursor-pointer ${
                          task.completed ? "opacity-75" : ""
                        }`}
                        onClick={() => openEditTaskModal(task)}
                      >
                        <div
                          className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${
                            isCrop ? "bg-emerald-500" : isLivestock ? "bg-purple-500" : "bg-blue-500"
                          }`}
                        />

                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-start space-x-3 min-w-0">
                            <CheckCircle
                              className={`h-5 w-5 shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110 ${
                                task.completed ? "text-green-600" : "text-slate-300"
                              }`}
                            />
                            <div className="min-w-0">
                              <h4
                                className={`text-base font-semibold truncate capitalize tracking-tight ${
                                  task.completed
                                    ? "line-through text-slate-400 font-medium"
                                    : "text-slate-800"
                                }`}
                              >
                                {task.name}
                              </h4>
                              {task.description && (
                                <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <ChevronRight className="h-5 w-5 text-slate-300 shrink-0 transition-all duration-200 group-hover:text-green-600 group-hover:translate-x-1" />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${typeColor}`}
                          >
                            {task.type}
                          </span>
                          <span className="text-slate-300 text-xs font-semibold">•</span>
                          <span className="inline-flex items-center text-xs text-slate-500 font-medium gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Calendar className="w-3.5 h-3.5" />
                            {task.dueDate} · {task.time}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100/80">
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 text-xs font-bold uppercase text-green-700 shadow-inner">
                              {task.user?.charAt(0) || "?"}
                            </span>
                            <span className="truncate text-xs font-semibold text-slate-600">
                              {task.user || "Unassigned"}
                            </span>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold capitalize border ${
                              task.priority === "high"
                                ? "bg-red-50 text-red-700 border-red-100"
                                : task.priority === "medium"
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : "bg-green-50 text-green-700 border-green-100"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                task.priority === "high"
                                  ? "bg-red-500"
                                  : task.priority === "medium"
                                  ? "bg-amber-500"
                                  : "bg-green-500"
                              }`}
                            />
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {filteredTasks.length === 0 && (
                    <div className="col-span-full text-center py-8 text-slate-400 font-medium">
                      No tasks found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================
        1. MAIN TASK FORM MODAL (Edit/New)
        ========================================
      */}
      <Modal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "new" ? "New Task" : "Edit Task"}
      >
        <TaskForm
          mode={modalMode}
          title={formTitle}
          setTitle={setFormTitle}
          status={formStatus}
          setStatus={setFormStatus}
          priority={formPriority}
          setPriority={setFormPriority}
          taskType={formTaskType}
          setTaskType={setFormTaskType}
          assignee={formAssignee}
          setAssignee={setFormAssignee}
          dueDate={formDueDate}
          setDueDate={setFormDueDate}
          dueTime={formDueTime}
          setDueTime={setFormDueTime}
          notes={formNotes}
          setNotes={setFormNotes}
          onSave={handleSaveTask}
          onClose={() => setIsModalOpen(false)}
          onDelete={handleDeleteClick} // Triggers the Confirmation Modal
          isSaving={loading} // Pass loading state to disable buttons
        />
      </Modal>

      {/* ========================================
        2. DELETE CONFIRMATION MODAL
        ========================================
      */}
      <Modal
        show={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        title="Confirm Deletion"
      >
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h3 className="text-xl font-semibold text-gray-800">
              Permanently Delete Task
            </h3>
          </div>
          <p className="text-gray-600 mb-6">
            Are you absolutely sure you want to delete the task:
            <span className="font-bold text-red-600">
              {" "}
              {selectedTask?.name}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsConfirmDeleteOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete} // Executes the actual API call
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Yes, Delete It"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;
