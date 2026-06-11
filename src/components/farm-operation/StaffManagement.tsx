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
  KeyRound,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useProfile } from "@/lib/hooks/useProfile";
import {
  createStaff,
  StaffType,
  getStaffs,
  deleteStaff,
  updateStaff,
  regenerateStaffPassword,
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

  // Password Generation and Reset states
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [staffRegenerateShow, setStaffRegenerateShow] = useState(false);
  const [regeneratedPassword, setRegeneratedPassword] = useState("");
  const [selectedStaffForRegen, setSelectedStaffForRegen] = useState<StaffType | null>(null);

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
      const response = await createStaff({ ...formData, farmId: profile.id });
      setGeneratedPassword(response.tempPassword || "");
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
    setGeneratedPassword("");
  };

  const handleRegeneratePassword = async () => {
    if (!selectedStaffForRegen?.email) return;
    setIsLoading(true);
    try {
      const response = await regenerateStaffPassword(selectedStaffForRegen.email);
      setRegeneratedPassword(response.tempPassword);
      toast.success("Password reset and generated successfully!");
    } catch (error) {
      console.error("Failed to regenerate password:", error);
      toast.error("Failed to regenerate password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateModalClose = () => {
    setStaffRegenerateShow(false);
    setRegeneratedPassword("");
    setSelectedStaffForRegen(null);
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
              className="flex flex-col justify-between h-full bg-white rounded-2xl border border-gray-150 shadow-sm hover:shadow-md transition-all duration-300 capitalize p-5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    {/* Letter Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-base flex items-center justify-center shadow-inner uppercase flex-shrink-0">
                      {person.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-base capitalize leading-tight">
                        {person.name}
                      </h4>
                      <p className="text-xs text-gray-455 lowercase break-all mt-0.5 font-medium">
                        {person.email}
                      </p>
                    </div>
                  </div>
                  {person.isVerified === "true" || String(person.isVerified) === "true" ? (
                    <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/50 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100/50 rounded-full">
                      Pending
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Phone Number</span>
                  <span className="font-semibold text-gray-800">{person.phone || "N/A"}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3.5 border-t border-gray-100 flex justify-between items-center bg-white">
                <button
                  onClick={() => {
                    setStaffDelete(true);
                    setSelectedId(person._id as string);
                    setSelectedEmail(person.email as string);
                  }}
                  disabled={isLoading}
                  className="flex items-center text-xs font-bold text-rose-600 hover:text-rose-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
                <div className="flex items-center gap-3">
                  <button
                    className="flex items-center text-xs font-bold text-amber-600 hover:text-amber-800 transition-colors"
                    onClick={() => {
                      setSelectedStaffForRegen(person);
                      setStaffRegenerateShow(true);
                    }}
                  >
                    <KeyRound className="h-3.5 w-3.5 mr-1" />
                    Reset PW
                  </button>
                  <button
                    className="flex items-center text-xs font-bold text-emerald-650 hover:text-emerald-800 transition-colors"
                    onClick={() => handleUpdateOpen(person)}
                  >
                    <SquarePen className="h-4 w-4 mr-1" />
                    Update
                  </button>
                </div>
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
        onClose={() => {
          setShowAddStaffModal(false);
          setFormError(null);
        }}
        title={edit ? "Edit Staff Details" : "Add New Staff Member"}
      >
        <form onSubmit={handleAddStaff} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm text-gray-800"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={edit}
              placeholder="e.g. john@example.com"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-gray-700"
            >
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +1 (555) 000-0000"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm text-gray-800"
            />
          </div>
          <div className="pt-4 border-t border-gray-200">
            {formError && (
              <p className="mb-3 text-sm text-red-600 flex items-start">
                <TriangleAlert className="h-4 w-4 mt-0.5 mr-1 flex-shrink-0" />
                <span>{formError}</span>
              </p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`
                    w-full flex justify-center items-center rounded-lg border border-transparent py-2.5 px-4 text-sm font-bold shadow-md transition-colors text-white
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
                <Plus className="h-4 w-4 mr-2" />
              )}
              {isLoading ? "Saving..." : edit ? "Save Changes" : "Save Staff"}
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
          <p className="text-sm text-gray-655">
            A staff account has been set up with the following login details:
          </p>
          <div className="bg-slate-50 border border-gray-150 rounded-xl p-4 space-y-2">
            <p className="flex justify-between items-center text-sm">
              <span className="font-semibold text-gray-500">Email:</span>
              <span className="font-bold text-gray-850 lowercase">{formData.email}</span>
            </p>
            <p className="flex justify-between items-center text-sm">
              <span className="font-semibold text-gray-500">Temporary Password:</span>
              <span className="font-bold text-emerald-700 tracking-wider text-base">{generatedPassword || "12345678"}</span>
            </p>
          </div>
          <p className="text-xs text-amber-600 font-medium">
            Note: Please share these temporary credentials securely with the staff member.
          </p>
        </div>
        <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleCreateStaffModalClose}
            className="px-4 py-2 text-sm font-semibold text-gray-750 bg-gray-100 rounded-lg hover:bg-gray-250 transition-colors"
          >
            Close
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
