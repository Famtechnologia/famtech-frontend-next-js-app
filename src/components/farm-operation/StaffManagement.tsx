"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  ListFilter,
  LayoutGrid,
  TriangleAlert,
  Trash2,
  SquarePen,
  Loader2,
  Users,
  CheckCircle,
  Clock,
  Briefcase,
  UserCheck,
  UserMinus,
  ArrowUpDown,
  Filter,
  Eye,
  CheckSquare,
  Activity,
  Calendar,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Card from "@/components/ui/Card";
import { useProfile } from "@/lib/hooks/useProfile";
import {
  createStaff,
  StaffType,
  getStaffs,
  deleteStaff,
  updateStaff,
} from "@/lib/services/staff";
import { getTasks, createTask, updateTask, Task as ApiTask } from "@/lib/services/taskplanner";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

const StaffManagement = () => {
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [staff, setStaff] = useState<StaffType[]>([]);
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [, setSelectedId] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    _id: "",
  });
  const [staffCreate, setStaffCreate] = useState(false);
  const [staffDelete, setStaffDelete] = useState(false);

  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "workload-desc" | "workload-asc">("name-asc");
  const [filterStatus, setFilterStatus] = useState<"all" | "verified" | "pending">("all");
  const [filterWorkload, setFilterWorkload] = useState<"all" | "available" | "busy" | "overloaded">("all");

  // Direct Task Assignment Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigneeForNewTask, setAssigneeForNewTask] = useState<string>("");
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    taskType: "General task",
    priority: "Low",
    dueDate: "",
    dueTime: "",
    note: "",
  });

  // View Tasks Modal
  const [showViewTasksModal, setShowViewTasksModal] = useState(false);
  const [selectedStaffForTasks, setSelectedStaffForTasks] = useState<StaffType | null>(null);

  const { profile } = useProfile();

  const fetchStaffData = useCallback(async () => {
    if (!profile) return;
    try {
      const staffData = await getStaffs(profile.id);
      setStaff(staffData);

      const taskData = await getTasks(profile.id);
      setTasks(taskData);
    } catch (error) {
      console.error("Failed to fetch staff or tasks data:", error);
    }
  }, [profile]);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    // Basic Validation
    if (!formData.name || !formData.email) {
      setFormError("Name and Email are required.");
      setIsLoading(false);
      return;
    }

    if (!profile?.id) {
      setFormError("Farm ID is not available. Please try again later.");
      setIsLoading(false);
      return;
    }

    try {
      if (edit) {
        await updateStaff(formData);
        toast.success("Staff details updated successfully!");
        fetchStaffData();
        setShowAddStaffModal(false);
        setSelectedId("");
        return;
      }
      await createStaff({ ...formData, farmId: profile.id });
      toast.success("Staff member created successfully!");
      fetchStaffData();
      setShowAddStaffModal(false);
      setStaffCreate(true);
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof AxiosError && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Failed to add staff:", errorMessage);
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStaff = async () => {
    try {
      await deleteStaff(selectedEmail);
      toast.success("Staff member deleted successfully!");
      fetchStaffData();
      setStaffDelete(false);
      setSelectedId("");
      setSelectedEmail("");
    } catch (error) {
      console.error("Failed to delete staff:", error);
      toast.error("Failed to delete staff member.");
    }
  };

  const handleUpdateOpen = (person: StaffType) => {
    setEdit(true);
    setShowAddStaffModal(true);
    setFormData({
      name: person.name as string,
      email: person.email as string,
      phone: person.phone as string,
      _id: person._id as string,
    });
    setSelectedId(person.email as string);
  };

  const handleCreateStaffModalClose = () => {
    setShowAddStaffModal(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      _id: "",
    });
    setSelectedId("");
    setEdit(false);
    setStaffCreate(false);
  };

  // Direct Task Assignment Submit
  const handleCreateAssignedTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskData.title || !newTaskData.dueDate || !newTaskData.dueTime) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsLoading(true);
    try {
      await createTask({
        title: newTaskData.title,
        status: "pending",
        priority: newTaskData.priority.toLowerCase(),
        timeline: {
          dueDate: newTaskData.dueDate,
          dueTime: newTaskData.dueTime,
        },
        note: newTaskData.note,
        taskType: newTaskData.taskType.toLowerCase(),
        assignee: assigneeForNewTask,
        entity_id: "sample_entity_id",
        userId: profile?.id as string,
      });
      toast.success("Task assigned successfully!");
      setShowAssignModal(false);
      setNewTaskData({
        title: "",
        taskType: "General task",
        priority: "Low",
        dueDate: "",
        dueTime: "",
        note: "",
      });
      fetchStaffData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign task.");
    } finally {
      setIsLoading(false);
    }
  };

  // Farmer checking off a worker task
  const handleToggleTaskStatus = async (task: ApiTask) => {
    try {
      const newStatus = task.status === "completed" ? "pending" : "completed";
      await updateTask(task.id, {
        status: newStatus,
      });
      toast.success(`Task status updated to ${newStatus}`);
      fetchStaffData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update task status.");
    }
  };

  // Metrics calculations
  const totalStaff = staff.length;
  const activeStaff = staff.filter((s) => s.isVerified === "true" || String(s.isVerified) === "true").length;
  const pendingStaff = totalStaff - activeStaff;

  const staffEmails = staff.map((s) => s.email?.toLowerCase());
  const totalActiveTasks = tasks.filter(
    (t) =>
      t.assignee &&
      staffEmails.includes(t.assignee.toLowerCase()) &&
      t.status?.toLowerCase() !== "completed"
  ).length;

  // Workload and verification rendering helper
  const getWorkloadPill = (count: number) => {
    if (count === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full">
          <CheckCircle className="h-3 w-3" /> Available
        </span>
      );
    } else if (count <= 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-full">
          <Clock className="h-3 w-3" /> Active Tasks ({count})
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-full">
          <TriangleAlert className="h-3 w-3" /> Overloaded ({count})
        </span>
      );
    }
  };

  const getVerificationBadge = (isVerified: boolean | string | undefined) => {
    const verified = isVerified === true || isVerified === "true";
    if (verified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full">
          Verified
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-full">
          Pending
        </span>
      );
    }
  };

  // Staff lookup helper for activity feed
  const getStaffNameByEmail = (email: string) => {
    if (!email) return "Unassigned";
    const found = staff.find((s) => s.email?.toLowerCase() === email.toLowerCase());
    return found ? found.name : email;
  };

  // Live updates calculation from task changes
  const recentUpdates = [...tasks]
    .filter((t) => t.assignee)
    .sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(a.createdTime || 0);
      const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(b.createdTime || 0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 6);

  // Sorting and Filtering logic
  const filteredAndSortedStaff = staff
    .filter((person) => {
      // Search term
      const matchesSearch = (person.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (person.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // Verification Status
      const isPersonVerified = person.isVerified === "true" || String(person.isVerified) === "true";
      if (filterStatus === "verified" && !isPersonVerified) return false;
      if (filterStatus === "pending" && isPersonVerified) return false;

      // Workload status
      const personTasks = tasks.filter(
        (t) => t.assignee?.toLowerCase() === person.email?.toLowerCase()
      );
      const activeCount = personTasks.filter(
        (t) => t.status?.toLowerCase() !== "completed"
      ).length;

      if (filterWorkload === "available" && activeCount > 0) return false;
      if (filterWorkload === "busy" && (activeCount === 0 || activeCount > 2)) return false;
      if (filterWorkload === "overloaded" && activeCount <= 2) return false;

      return true;
    })
    .sort((a, b) => {
      const getActiveCount = (email?: string) => {
        if (!email) return 0;
        return tasks.filter(
          (t) => t.assignee?.toLowerCase() === email.toLowerCase() && t.status?.toLowerCase() !== "completed"
        ).length;
      };

      if (sortBy === "name-asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "name-desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      if (sortBy === "workload-desc") {
        return getActiveCount(b.email) - getActiveCount(a.email);
      }
      if (sortBy === "workload-asc") {
        return getActiveCount(a.email) - getActiveCount(b.email);
      }
      return 0;
    });

  return (
    <div className="p-0 md:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Staff</p>
              <h3 className="text-xl font-bold text-gray-800">{totalStaff}</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Verified Active</p>
              <h3 className="text-xl font-bold text-gray-800">{activeStaff}</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <UserMinus className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Pending Onboarding</p>
              <h3 className="text-xl font-bold text-gray-800">{pendingStaff}</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Active Workload</p>
              <h3 className="text-xl font-bold text-gray-800">{totalActiveTasks}</h3>
            </div>
          </div>
        </div>

        {/* Dynamic Filters and Options Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff members by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-250 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Actions button */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setShowAddStaffModal(true);
                  setFormError(null);
                }}
                disabled={!profile || isLoading}
                className="flex items-center px-4 py-2 text-sm font-semibold text-white rounded-lg bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors w-fit justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Invite Staff
              </button>
            </div>
          </div>

          {/* Inline filters */}
          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-600">
            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-3.5 w-3.5 text-gray-450" />
              <span>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-gray-200 rounded px-2.5 py-1 text-gray-750 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="workload-desc">Workload (Highest First)</option>
                <option value="workload-asc">Workload (Lowest First)</option>
              </select>
            </div>

            {/* Verification status filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-3.5 w-3.5 text-gray-450" />
              <span>Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-slate-50 border border-gray-200 rounded px-2.5 py-1 text-gray-750 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
              >
                <option value="all">All Statuses</option>
                <option value="verified">Verified / Active Only</option>
                <option value="pending">Pending Invitations Only</option>
              </select>
            </div>

            {/* Workload filter */}
            <div className="flex items-center space-x-2">
              <Briefcase className="h-3.5 w-3.5 text-gray-450" />
              <span>Capacity:</span>
              <select
                value={filterWorkload}
                onChange={(e) => setFilterWorkload(e.target.value as any)}
                className="bg-slate-50 border border-gray-200 rounded px-2.5 py-1 text-gray-750 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
              >
                <option value="all">All Capacities</option>
                <option value="available">Available (0 tasks)</option>
                <option value="busy">Busy (1-2 tasks)</option>
                <option value="overloaded">Overloaded (3+ tasks)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dashboard Content Split Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          {/* Staff Members Grid (Left 3 Columns) */}
          <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAndSortedStaff.length > 0 ? (
              filteredAndSortedStaff.map((person) => {
                const personTasks = tasks.filter(
                  (t) => t.assignee?.toLowerCase() === person.email?.toLowerCase()
                );
                const personActiveCount = personTasks.filter(
                  (t) => t.status?.toLowerCase() !== "completed"
                ).length;
                const personCompletedCount = personTasks.length - personActiveCount;

                return (
                  <div
                    key={person.email}
                    className="bg-white rounded-2xl border border-gray-150 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-5 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-base flex items-center justify-center shadow-inner uppercase">
                            {person.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 text-base capitalize leading-tight">
                              {person.name}
                            </h4>
                            <p className="text-xs text-gray-450 lowercase break-all mt-0.5">
                              {person.email}
                            </p>
                          </div>
                        </div>
                        {getVerificationBadge(person.isVerified)}
                      </div>

                      {/* Workload overview */}
                      <div className="pt-3 border-t border-gray-55 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 font-semibold">Phone:</span>
                          <span className="font-bold text-gray-700">{person.phone || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 font-semibold">Workload Status:</span>
                          {getWorkloadPill(personActiveCount)}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 font-semibold">Overall Progress:</span>
                          <span className="font-bold text-emerald-600">
                            {personCompletedCount} / {personTasks.length} tasks completed
                          </span>
                        </div>
                      </div>

                      {/* Card Specific Actions */}
                      <div className="pt-2 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setSelectedStaffForTasks(person);
                            setShowViewTasksModal(true);
                          }}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-xs border border-slate-200 transition-colors"
                        >
                          <Eye size={13} /> View Tasks
                        </button>
                        <button
                          onClick={() => {
                            setAssigneeForNewTask(person.email || "");
                            setShowAssignModal(true);
                          }}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs border border-emerald-150 transition-colors"
                        >
                          <Plus size={13} /> Assign Task
                        </button>
                      </div>
                    </div>

                    {/* Footer delete/update */}
                    <div className="px-5 py-3.5 bg-slate-50 border-t border-gray-100 flex justify-between items-center">
                      <button
                        onClick={() => {
                          setStaffDelete(true);
                          setSelectedId(person._id as string);
                          setSelectedEmail(person.email as string);
                        }}
                        disabled={isLoading}
                        className="flex items-center text-xs font-semibold text-rose-600 hover:text-rose-800 disabled:text-gray-450 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remove Member
                      </button>
                      <button
                        className="flex items-center text-xs font-semibold text-emerald-650 hover:text-emerald-800 transition-colors"
                        onClick={() => handleUpdateOpen(person)}
                      >
                        <SquarePen className="h-3.5 w-3.5 mr-1" />
                        Edit details
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 col-span-full border-2 border-dashed border-gray-300 rounded-2xl bg-white shadow-sm">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-semibold">No matching staff members found.</p>
                <p className="text-gray-400 text-sm mt-1">
                  Adjust filters or search parameters to see registered accounts.
                </p>
              </div>
            )}
          </div>

          {/* Activity Feed (Right 1 Column) */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={15} className="text-emerald-600" /> Live Update Feed
                </h3>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {recentUpdates.map((task) => {
                  const staffName = getStaffNameByEmail(task.assignee);
                  const date = task.updatedAt ? new Date(task.updatedAt) : new Date(task.createdTime || Date.now());
                  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div key={task.id} className="text-xs space-y-1.5 border-l-2 border-emerald-500 pl-3 py-0.5">
                      <p className="text-gray-700 font-semibold leading-snug">
                        <span className="capitalize text-emerald-700">{staffName}</span> updated status to{" "}
                        <span className="font-bold text-slate-800 capitalize bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                          {task.status}
                        </span>
                      </p>
                      <p className="text-gray-500 font-medium italic">"{task.title}"</p>
                      {task.note && (
                        <p className="text-[11px] text-gray-600 bg-slate-50 p-2 rounded border border-gray-100 italic leading-tight">
                          "{task.note}"
                        </p>
                      )}
                      <span className="text-[9px] text-gray-400 font-bold block">{timeStr}</span>
                    </div>
                  );
                })}
                {recentUpdates.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">No recent task activity recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* --- ADD STAFF MODAL --- */}
      <Modal
        show={showAddStaffModal}
        onClose={() => {
          setShowAddStaffModal(false);
          setFormError(null);
        }}
        title={edit ? "Edit Staff Details" : "Invite New Staff Member"}
      >
        <form onSubmit={handleAddStaff} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="w-full p-2.5 border border-gray-250 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={edit}
              placeholder="e.g. john@example.com"
              className="w-full p-2.5 border border-gray-250 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +1 (555) 000-0000"
              className="w-full p-2.5 border border-gray-250 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <div className="pt-4 border-t border-gray-100">
            {formError && (
              <p className="mb-3 text-sm text-rose-600 flex items-start">
                <TriangleAlert className="h-4 w-4 mt-0.5 mr-1 flex-shrink-0" />
                <span>{formError}</span>
              </p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full flex justify-center items-center rounded-lg py-2.5 px-4 text-sm font-bold shadow-md transition-colors text-white
                ${
                  isLoading
                    ? "bg-emerald-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }
              `}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-1.5" />
              )}
              {isLoading ? "Saving..." : edit ? "Save Changes" : "Create Account"}
            </button>
          </div>
        </form>
      </Modal>

      {/* --- DIRECT TASK ASSIGNMENT MODAL --- */}
      <Modal
        show={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={`Assign Task to ${getStaffNameByEmail(assigneeForNewTask)}`}
      >
        <form onSubmit={handleCreateAssignedTask} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-xs font-bold text-gray-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              id="task-title"
              value={newTaskData.title}
              onChange={(e) => setNewTaskData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Water greenhouse crop"
              required
              className="w-full p-2.5 border border-gray-250 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-type" className="block text-xs font-bold text-gray-700 mb-1">
                Task Type
              </label>
              <select
                id="task-type"
                value={newTaskData.taskType}
                onChange={(e) => setNewTaskData(prev => ({ ...prev, taskType: e.target.value }))}
                className="w-full p-2.5 border border-gray-250 rounded-lg text-sm text-gray-850 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="General task">General Task</option>
                <option value="Crop task">Crop Task</option>
                <option value="Livestock task">Livestock Task</option>
              </select>
            </div>
            <div>
              <label htmlFor="task-priority" className="block text-xs font-bold text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="task-priority"
                value={newTaskData.priority}
                onChange={(e) => setNewTaskData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full p-2.5 border border-gray-250 rounded-lg text-sm text-gray-850 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-date" className="block text-xs font-bold text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                id="task-date"
                required
                value={newTaskData.dueDate}
                onChange={(e) => setNewTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full p-2.5 border border-gray-250 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="task-time" className="block text-xs font-bold text-gray-700 mb-1">
                Due Time *
              </label>
              <input
                type="time"
                id="task-time"
                required
                value={newTaskData.dueTime}
                onChange={(e) => setNewTaskData(prev => ({ ...prev, dueTime: e.target.value }))}
                className="w-full p-2.5 border border-gray-250 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="task-notes" className="block text-xs font-bold text-gray-700 mb-1">
              Instructions / Notes
            </label>
            <textarea
              id="task-notes"
              rows={2}
              value={newTaskData.note}
              onChange={(e) => setNewTaskData(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Add details, locations, or requirements..."
              className="w-full p-2.5 border border-gray-250 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAssignModal(false)}
              className="px-4 py-2 text-xs font-bold text-gray-650 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-5 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow"
            >
              {isLoading && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
              Assign Task
            </button>
          </div>
        </form>
      </Modal>

      {/* --- STAFF TASK INSPECTOR MODAL --- */}
      {selectedStaffForTasks && (
        <Modal
          show={showViewTasksModal}
          onClose={() => {
            setShowViewTasksModal(false);
            setSelectedStaffForTasks(null);
          }}
          title={`Task Sheet: ${selectedStaffForTasks.name}`}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase pb-2 border-b border-gray-100">
              <span>Task List</span>
              <span>
                {tasks.filter((t) => t.assignee?.toLowerCase() === selectedStaffForTasks.email?.toLowerCase()).length} Assigned
              </span>
            </div>
            
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {tasks
                .filter((t) => t.assignee?.toLowerCase() === selectedStaffForTasks.email?.toLowerCase())
                .map((task) => {
                  const isCompleted = task.status === "completed";
                  return (
                    <div 
                      key={task.id} 
                      className={`p-3.5 rounded-xl border transition-all flex justify-between items-start ${
                        isCompleted 
                          ? "bg-slate-50 border-gray-200 opacity-80" 
                          : "bg-white border-slate-200 shadow-sm"
                      }`}
                    >
                      <div className="space-y-1 max-w-[75%]">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                            task.priority === "high"
                              ? "bg-red-50 border-red-100 text-red-600"
                              : task.priority === "medium"
                              ? "bg-amber-50 border-amber-100 text-amber-600"
                              : "bg-slate-50 border-slate-100 text-slate-500"
                          }`}>
                            {task.priority}
                          </span>
                          <span className="text-[10px] text-gray-400 capitalize">{task.taskType}</span>
                        </div>
                        <h5 className={`text-sm font-bold text-gray-800 capitalize leading-tight ${isCompleted ? 'line-through text-gray-400' : ''}`}>
                          {task.title}
                        </h5>
                        {task.note && (
                          <p className="text-xs text-gray-500 italic leading-snug">
                            "{task.note}"
                          </p>
                        )}
                        <p className="text-[10px] text-gray-450 font-semibold flex items-center gap-1">
                          <Calendar size={11} /> Due: {task.timeline?.dueDate ? new Date(task.timeline.dueDate).toLocaleDateString() : "N/A"} · {task.timeline?.dueTime}
                        </p>
                      </div>

                      <button
                        onClick={() => handleToggleTaskStatus(task)}
                        className={`flex items-center justify-center p-2 rounded-lg border transition-all ${
                          isCompleted
                            ? "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                            : "bg-white border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-250"
                        }`}
                        title={isCompleted ? "Mark Pending" : "Mark Completed"}
                      >
                        <CheckSquare className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  );
                })}

              {tasks.filter((t) => t.assignee?.toLowerCase() === selectedStaffForTasks.email?.toLowerCase()).length === 0 && (
                <div className="text-center py-8 text-gray-400 text-xs font-semibold">
                  No tasks currently assigned to this staff member.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowViewTasksModal(false);
                  setSelectedStaffForTasks(null);
                }}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-250"
              >
                Close Sheet
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- Staff Creation Successful --- */}
      <Modal
        show={staffCreate}
        onClose={handleCreateStaffModalClose}
        title="Staff member added successfully!"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-650">
            A staff account has been set up with the following login details:
          </p>
          <div className="bg-slate-50 border border-gray-150 rounded-xl p-4 space-y-2">
            <p className="flex justify-between items-center text-sm">
              <span className="font-semibold text-gray-500">Email:</span>
              <span className="font-bold text-gray-850">{formData.email}</span>
            </p>
            <p className="flex justify-between items-center text-sm">
              <span className="font-semibold text-gray-500">Temporary Password:</span>
              <span className="font-bold text-gray-850">12345678</span>
            </p>
          </div>
          <p className="text-xs text-amber-600 font-medium">
            Note: Please share these temporary credentials securely with the staff member.
          </p>
        </div>
        <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleCreateStaffModalClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-250 transition-colors"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* --- Staff Deletion Confirmation --- */}
      <Modal
        show={staffDelete}
        onClose={() => setStaffDelete(false)}
        title="Delete Staff Member"
      >
        <div className="space-y-3">
          <p className="text-gray-600 font-medium text-base">
            Are you sure you want to delete this staff member?
          </p>
          <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-100 p-2.5 rounded-lg flex items-center gap-1.5">
            <TriangleAlert className="h-4.5 w-4.5 flex-shrink-0" />
            This will remove their access to the farm operations, and this action cannot be undone.
          </p>
        </div>

        <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={() => setStaffDelete(false)}
            className="px-4 py-2 text-sm font-semibold text-gray-750 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteStaff}
            className="px-6 py-2 bg-rose-600 text-white text-sm font-bold rounded-lg hover:bg-rose-700 transition-colors shadow-sm"
          >
            Confirm Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default StaffManagement;
