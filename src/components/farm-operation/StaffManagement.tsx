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

const StaffManagement = () => {
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [staff, setStaff] = useState<StaffType[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [, setSelectedId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    _id: "",
  });

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
        fetchStaffData();
        setShowAddStaffModal(false);
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          _id: "",
        });
        setSelectedId("");

        return;
      }
      await createStaff({ ...formData, farmId: profile.id });
      fetchStaffData();
      setShowAddStaffModal(false);
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        _id: "",
      });
    } catch (error) {
      console.error("Failed to add staff:", error);
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      await deleteStaff(id);
      fetchStaffData();
    } catch (error) {
      console.error("Failed to delete staff:", error);
    }
  };

  const handleUpdateOpen = (person: StaffType) => {
    setEdit(true);
    setShowAddStaffModal(true);
    // Reset form
    setFormData({
      name: person.name as string,
      email: person.email as string,
      phone: person.phone as string,
      _id: person._id as string,
    });
    setSelectedId(person.email as string);
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            <ListFilter className="h-4 w-4 mr-2" /> Filter
          </button>
          <button className=" items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors hidden lg:flex">
            <LayoutGrid className="h-4 w-4 mr-2" /> Format
          </button>
          <button
            onClick={() => {
              setShowAddStaffModal(true);
              setFormError(null);
            }}
            disabled={!profile || isLoading}
            className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-green-600 hover:bg-green-700 shadow-md transition-colors w-fit md:w-auto justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Staff
          </button>
        </div>
      </div>

      {/* --- STAFF MEMBERS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.length > 0 ? (
          filteredStaff.map((person) => (
            <Card
              key={person.email}
              title={person.name}
              className="flex flex-col justify-between h-full shadow-lg hover:shadow-xl transition-shadow duration-300 capitalize"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <img
                    alt={person.name}
                    className="w-16 h-16 rounded-full"
                    src={"images/help/contact 1.png"}
                    width={100}
                    height={100}
                    // priority
                  />
                  <div>
                    <p className="font-semibold text-lg capitalize">
                      {person.name}
                    </p>
                    <p className="text-sm text-gray-500 lowercase">
                      {person.email}
                    </p>
                  </div>
                </div>
                <p className="flex justify-between text-sm">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-semibold text-gray-800">
                    {person.phone}
                  </span>
                </p>
              </div>
              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                <button
                  onClick={() => handleDeleteStaff(person.email as string)}
                  className="flex items-center text-sm font-medium text-red-600 hover:text-red-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
                <button
                  className="flex items-center text-sm font-medium text-green-600 hover:text-green-800 transition-colors"
                  onClick={() => handleUpdateOpen(person)}
                >
                  <SquarePen className="h-4 w-4 mr-1" />
                  Update
                </button>
              </div>
            </Card>
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
        title="Add New Staff Member"
      >
        <form onSubmit={handleAddStaff} className="space-y-6">
          {/* Form fields for staff details */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
                    w-full flex justify-center rounded-lg border border-transparent py-3 px-4 text-sm font-semibold shadow-md transition-colors text-white
                    ${
                      isLoading
                        ? "bg-green-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }
                `}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {isLoading ? "Saving..." : "Save Staff"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffManagement;
