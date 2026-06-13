"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  TriangleAlert,
  Trash2,
  SquarePen,
  Loader2,
  Mail,
  CheckCircle,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useProfile } from "@/lib/hooks/useProfile";
import {
  inviteStaff,
  StaffType,
  getStaffs,
  deleteStaff,
  updateStaff,
} from "@/lib/services/staff";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

const StaffManagement = () => {
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [staff, setStaff] = useState<StaffType[]>([]);
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
  const [invitedEmail, setInvitedEmail] = useState("");

  const { profile } = useProfile();

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
      await inviteStaff({ name: formData.name, email: formData.email, farmId: profile.id });
      setInvitedEmail(formData.email);
      toast.success("Invite sent successfully!");
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
    setFormData({ name: "", email: "", phone: "", _id: "" });
    setSelectedId("");
    setEdit(false);
    setStaffCreate(false);
    setInvitedEmail("");
  };

  return (
    <div className="p-2 lg:pt-8 lg:pb-8 max-w-7xl mx-auto">
      {/* --- CONTROL BAR --- */}
      <div className="md:flex justify-between items-center space-y-4 md:space-y-0 mb-8">
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center px-3 py-2 text-sm font-semibold text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            <ListFilter className="h-4 w-4 mr-2" /> Filter
          </button>
          <button className="flex items-center px-3 py-2 text-sm font-semibold text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors hidden lg:flex">
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
            <Plus className="h-4 w-4 mr-2" /> Add Staff
          </button>
        </div>
      </div>

      {/* --- STAFF MEMBERS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.length > 0 ? (
          filteredStaff.map((person) => (
            <div
              key={person.email}
              className="flex flex-col justify-between h-full bg-white dark:bg-[#161b22] rounded-2xl border border-gray-100 dark:border-[#30363d] shadow-sm hover:shadow-md transition-all duration-300 capitalize p-5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-base flex items-center justify-center shadow-inner uppercase flex-shrink-0">
                      {person.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-[#e6edf3] text-base capitalize leading-tight">
                        {person.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-[#8b949e] lowercase break-all mt-0.5 font-medium">
                        {person.email}
                      </p>
                    </div>
                  </div>
                  {person.isVerified === "true" || String(person.isVerified) === "true" ? (
                    <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-[#4ade80] bg-emerald-50 dark:bg-[#0d2a1a] border border-emerald-100 dark:border-green-900 rounded-full whitespace-nowrap">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-full whitespace-nowrap">
                      Pending
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-[#30363d] flex justify-between items-center text-xs">
                  <span className="text-gray-400 dark:text-[#8b949e] font-bold uppercase tracking-wider text-[10px]">Invite Status</span>
                  <span className="font-semibold text-gray-800 dark:text-[#e6edf3]">
                    {person.inviteStatus === "accepted" ? "Accepted" : "Awaiting Acceptance"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3.5 border-t border-gray-100 dark:border-[#30363d] flex justify-between items-center">
                <button
                  onClick={() => { setStaffDelete(true); setSelectedId(person._id as string); setSelectedEmail(person.email as string); }}
                  disabled={isLoading}
                  className="flex items-center text-xs font-bold text-rose-600 hover:text-rose-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </button>
                <button
                  className="flex items-center text-xs font-bold text-emerald-600 dark:text-[#4ade80] hover:text-emerald-800 transition-colors"
                  onClick={() => handleUpdateOpen(person)}
                >
                  <SquarePen className="h-4 w-4 mr-1" /> Edit
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 col-span-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <p className="text-gray-500 text-lg font-medium">
              No staff members found.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Try a different search term or click Add Staff to get started.
            </p>
          </div>
        )}
      </div>

      {/* --- ADD STAFF MODAL --- */}
      <Modal
        show={showAddStaffModal}
        onClose={() => { setShowAddStaffModal(false); setFormError(null); }}
        title={edit ? "Edit Staff Details" : "Invite Staff Member"}
      >
        <form onSubmit={handleAddStaff} className="space-y-5">
          {!edit && (
            <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-[#0d2a1a] border border-emerald-100 dark:border-green-900 rounded-xl text-xs text-emerald-700 dark:text-[#4ade80]">
              <Mail className="h-4 w-4 shrink-0 mt-0.5" />
              <span>An invite link will be emailed to the staff member. They set their own password — no temporary credentials needed.</span>
            </div>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-[#e6edf3] mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Precious Adedoyin"
              className="block w-full border border-gray-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#e6edf3] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-[#e6edf3] mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={edit}
              placeholder="e.g. precious@example.com"
              className="block w-full border border-gray-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#e6edf3] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-[#30363d]">
            {formError && (
              <p className="mb-3 text-sm text-red-600 flex items-start gap-1.5">
                <TriangleAlert className="h-4 w-4 mt-0.5 shrink-0" />
                {formError}
              </p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 rounded-xl py-2.5 px-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : edit ? <SquarePen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
              {isLoading ? "Saving..." : edit ? "Save Changes" : "Send Invite"}
            </button>
          </div>
        </form>
      </Modal>

      {/* --- Invite sent confirmation --- */}
      <Modal show={staffCreate} onClose={handleCreateStaffModalClose} title="Invite Sent!">
        <div className="space-y-4 text-center py-2">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-[#1a3a2a] flex items-center justify-center mx-auto">
            <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-[#4ade80]" />
          </div>
          <div>
            <p className="text-sm text-gray-700 dark:text-[#e6edf3] font-medium">An invite email has been sent to</p>
            <p className="text-base font-bold text-emerald-700 dark:text-[#4ade80] mt-1 break-all">{invitedEmail}</p>
          </div>
          <p className="text-xs text-gray-500 dark:text-[#8b949e] leading-relaxed">
            They will receive a link to set their own password. The link expires in <strong>72 hours</strong>. Their account will show as <em>Pending</em> until they accept.
          </p>
        </div>
        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-[#30363d] flex justify-end">
          <button onClick={handleCreateStaffModalClose} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-[#e6edf3] bg-gray-100 dark:bg-[#21262d] rounded-lg hover:bg-gray-200 dark:hover:bg-[#30363d] transition-colors">
            Done
          </button>
        </div>
      </Modal>

      {/* --- Staff Deletion Confirmation --- */}
      <Modal
        show={staffDelete}
        onClose={() => setStaffDelete(false)}
        title="Delete Staff"
      >
        <div className="space-y-3">
          <p className="text-gray-600 font-medium text-base">
            Are you sure you want to delete this staff member?
          </p>
          <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-100 p-2.5 rounded-lg flex items-center gap-1.5">
            <TriangleAlert className="h-4.5 w-4.5 flex-shrink-0" />
            This action cannot be undone.
          </p>
        </div>

        <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={() => setStaffDelete(false)}
            className="px-4 py-2 text-sm font-semibold text-gray-750 bg-gray-100 rounded-lg hover:bg-gray-250"
          >
            Close
          </button>
          <button
            onClick={() => handleDeleteStaff()}
            className="px-6 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            Delete
          </button>
        </div>
      </Modal>

      {/* --- Password Regeneration Modal --- */}
      <Modal
        show={staffRegenerateShow}
        onClose={handleRegenerateModalClose}
        title={regeneratedPassword ? "New Password Generated" : "Reset Staff Password"}
      >
        {!regeneratedPassword ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-650">
              Are you sure you want to regenerate the password for <strong className="capitalize text-gray-800">{selectedStaffForRegen?.name}</strong>?
            </p>
            <p className="text-xs text-amber-650 bg-amber-50 border border-amber-100 p-2.5 rounded-lg">
              Their current password will be immediately invalidated and they will need the new password to log in.
            </p>
            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={handleRegenerateModalClose}
                className="px-4 py-2 text-sm font-semibold text-gray-750 bg-gray-150 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRegeneratePassword}
                disabled={isLoading}
                className="px-5 py-2 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700 transition-colors shadow-sm flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  "Confirm Reset"
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-655">
              The password has been successfully reset. Please share these credentials securely with the staff member:
            </p>
            <div className="bg-slate-50 border border-gray-150 rounded-xl p-4 space-y-2">
              <p className="flex justify-between items-center text-sm">
                <span className="font-semibold text-gray-500">Email:</span>
                <span className="font-bold text-gray-850 lowercase">{selectedStaffForRegen?.email}</span>
              </p>
              <p className="flex justify-between items-center text-sm">
                <span className="font-semibold text-gray-500">New Password:</span>
                <span className="font-bold text-emerald-700 tracking-wider text-base">{regeneratedPassword}</span>
              </p>
            </div>
            <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleRegenerateModalClose}
                className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffManagement;
