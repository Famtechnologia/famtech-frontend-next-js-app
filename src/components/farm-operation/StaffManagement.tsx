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
import { getTasks, Task as ApiTask } from "@/lib/services/taskplanner";
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

  const filteredStaff = (staff as StaffType[]).filter((person) =>
    (person.name as string).toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <p className="text-xs text-gray-500 font-medium">Active Tasks</p>
              <h3 className="text-xl font-bold text-gray-800">{totalActiveTasks}</h3>
            </div>
          </div>
        </div>

        {/* Control Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff members by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-250 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-250 rounded-lg hover:bg-gray-50 transition-colors">
              <ListFilter className="h-4 w-4 mr-2" /> Filter
            </button>
            <button className="hidden lg:flex items-center px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-250 rounded-lg hover:bg-gray-50 transition-colors">
              <LayoutGrid className="h-4 w-4 mr-2" /> Format
            </button>
            <button
              onClick={() => {
                setShowAddStaffModal(true);
                setFormError(null);
              }}
              disabled={!profile || isLoading}
              className="flex items-center px-4 py-2 text-sm font-semibold text-white rounded-lg bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors w-fit md:w-auto justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Staff
            </button>
          </div>
        </div>

        {/* Staff Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.length > 0 ? (
            filteredStaff.map((person) => {
              // Calculate task stats for this staff member
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
                  <div className="p-6 space-y-4">
                    {/* Header: Avatar, Name & Verification status */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-lg flex items-center justify-center shadow-inner uppercase">
                          {person.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-base capitalize leading-tight">
                            {person.name}
                          </h4>
                          <p className="text-xs text-gray-500 lowercase break-all mt-0.5">
                            {person.email}
                          </p>
                        </div>
                      </div>
                      {getVerificationBadge(person.isVerified)}
                    </div>

                    {/* Stats & Workload detail */}
                    <div className="pt-2 border-t border-gray-50 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-medium">Phone:</span>
                        <span className="font-semibold text-gray-700">{person.phone || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-medium">Workload Status:</span>
                        {getWorkloadPill(personActiveCount)}
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-medium">Completed tasks:</span>
                        <span className="font-bold text-emerald-600">{personCompletedCount} done</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex justify-between items-center">
                    <button
                      onClick={() => {
                        setStaffDelete(true);
                        setSelectedId(person._id as string);
                        setSelectedEmail(person.email as string);
                      }}
                      disabled={isLoading}
                      className="flex items-center text-xs font-semibold text-rose-600 hover:text-rose-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete Member
                    </button>
                    <button
                      className="flex items-center text-xs font-semibold text-emerald-650 hover:text-emerald-800 transition-colors"
                      onClick={() => handleUpdateOpen(person)}
                    >
                      <SquarePen className="h-3.5 w-3.5 mr-1" />
                      Edit Details
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 col-span-full border-2 border-dashed border-gray-300 rounded-2xl bg-white shadow-sm">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-semibold">No staff members found.</p>
              <p className="text-gray-400 text-sm mt-1">
                Try searching for a different name, or click the Add Staff button to invite someone new.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- ADD STAFF MODAL --- */}
      <Modal
        show={showAddStaffModal}
        onClose={() => {
          setShowAddStaffModal(false);
          setFormError(null);
        }}
        title={edit ? "Edit Staff Details" : "Add New Staff Member"}
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

      {/* --- Staff Creation Successful --- */}
      <Modal
        show={staffCreate}
        onClose={handleCreateStaffModalClose}
        title="Staff member added successfully!"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
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
