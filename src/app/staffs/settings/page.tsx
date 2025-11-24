"use client";
import React, { useState, useEffect } from "react"; // <-- Ensure useEffect is imported
import { Pencil, Lock, Layers } from "lucide-react";
import { useAssignee } from "@/lib/hooks/Assignee";
import { ProfileType, getFarmProfile } from "@/lib/services/farm";
import {
  updateStaff,
  changeStaffPassword,
  StaffType,
} from "@/lib/services/staff";
import Modal from "@/components/ui/Modal";

// Assuming this path is correct for your skeleton component
import SettingsNavigationSkeleton from "@/components/layout/skeleton/settings/FarmSetting";

const Settings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [farmProfile, setFarmProfile] = React.useState<ProfileType | null>(
    null
  );
  const [isFarmProfileModalOpen, setIsFarmProfileModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [editFormData, setEditFormData] = useState<Partial<StaffType>>({});
  const [passwordFormData, setPasswordFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState("");

  const { user, fetchUser } = useAssignee();

  React.useEffect(() => {
    const fetchFarmProfile = async () => {
      if (!user?.farmId) return;
      const profile = await getFarmProfile(user.farmId);
      setFarmProfile(profile);
    };
    fetchFarmProfile();
  }, [user]);

  const openEditModal = () => {
    if (user) {
      setEditFormData({
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
      });
      setIsEditProfileModalOpen(true);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;

    setIsUpdating(true);
    try {
      await updateStaff({ ...editFormData, _id: user?._id });

      fetchUser();

      setIsEditProfileModalOpen(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changeStaffPassword({
        id: user._id,
        oldPassword: passwordFormData.oldPassword,
        newPassword: passwordFormData.newPassword,
        confirmPassword: passwordFormData.confirmPassword,
      });
      setIsChangePasswordModalOpen(false);
      setPasswordFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setError("Password changed successfully");
    } catch (error) {
      console.error("Failed to change password:", error);
      setError("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const settingsSections = [
    {
      title: "Farm Information",
      items: [
        {
          icon: <Layers className="h-6 w-6 text-green-600" />,
          label: "Farm Profile",
          description: "View information about the farm",
          action: "View",
          function: () => {
            setIsFarmProfileModalOpen(true);
          },
        },
      ],
    },
    {
      title: "General Setting",
      items: [
        {
          icon: <Pencil className="h-6 w-6 text-green-600" />,
          label: "Edit Profile",
          description: "Change personal information",
          action: "Edit",
          function: openEditModal,
        },
      ],
    },
    {
      title: "Password & Security",
      items: [
        {
          icon: <Lock className="h-6 w-6 text-blue-600" />,
          label: "Change Password",
          description: "Change your password",
          action: "Change Password",
          function: () => {
            setIsChangePasswordModalOpen(true);
          },
        },
      ],
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SettingsNavigationSkeleton />;
  }
  return (
    <div className="md:px-8 md:py-4 space-y-8 bg-gray-50 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Personalize your account</p>
      </div>

      {settingsSections.map((section, sectionIndex) => (
        <div
          key={sectionIndex}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {section.title}
            </h2>
          </div>
          <div className="px-2 py-4 md:p-6 space-y-4">
            {section.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start justify-start space-x-4">
                  <div className="p-2 rounded-full text-blue-600">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-base md:text-lg font-medium text-gray-800">
                      {item.label}
                    </p>
                    <p className="text-gray-600 text-sm md:text-base">
                      {item.description}
                    </p>
                  </div>
                </div>
                {/* Use item.href if available, otherwise default to a known path */}
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-200 focus:outline-none bg-gray-100"
                  onClick={item.function}
                >
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* view farm information modal */}
      <Modal
        show={isFarmProfileModalOpen}
        onClose={() => setIsFarmProfileModalOpen(false)}
        title={"Farm Profile"}
      >
        <div className="space-y-6">
          {!farmProfile ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* General Info */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-green-600" />
                  General Information
                </h3>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Farm Name
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {farmProfile.farmName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Farm Type
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {farmProfile.farmType}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Size
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {farmProfile.farmSize}{" "}
                      <span className="text-sm text-gray-600 font-normal">
                        {farmProfile.farmSizeUnit}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Established
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {farmProfile.establishedYear}
                    </p>
                  </div>
                </div>
              </section>

              {/* Location */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Pencil className="h-4 w-4 text-blue-600" />{" "}
                  {/* Using Pencil as placeholder icon, could be MapPin if imported */}
                  Location
                </h3>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Address
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {farmProfile.location.address},{" "}
                      {farmProfile.location.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      State
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {farmProfile.location.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Country
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {farmProfile.location.country}
                    </p>
                  </div>
                </div>
              </section>

              {/* Operations */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  Operations
                </h3>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-5">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">
                      Primary Crops
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {farmProfile.primaryCrops.map((crop, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200"
                        >
                          {crop}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">
                      Farming Methods
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {farmProfile.farmingMethods.map((method, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Owner */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  Owner Details
                </h3>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Name
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {farmProfile.owner.firstName} {farmProfile.owner.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Phone
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {farmProfile.owner.phoneNumber}
                    </p>
                  </div>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="pt-6 mt-8 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setIsFarmProfileModalOpen(false)}
                  className="px-8 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 focus:ring-4 focus:ring-gray-100 transition-all duration-200 shadow-lg shadow-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        show={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={editFormData.name || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={editFormData.email || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={editFormData.phone || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsEditProfileModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        show={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        title="Change Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-6">
          <div>
            <label
              htmlFor="oldPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Current Password
            </label>
            <input
              type="password"
              id="oldPassword"
              value={passwordFormData.oldPassword}
              onChange={(e) =>
                setPasswordFormData({
                  ...passwordFormData,
                  oldPassword: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter current password"
              required
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={passwordFormData.newPassword}
              onChange={(e) =>
                setPasswordFormData({
                  ...passwordFormData,
                  newPassword: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={passwordFormData.confirmPassword}
              onChange={(e) =>
                setPasswordFormData({
                  ...passwordFormData,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="Confirm new password"
              required
            />
          </div>
          {error && (
            <div className="px-4 py-2 text-sm font-medium bg-red-600/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              <p className="text-red-600 text-base font-light">{error}</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsChangePasswordModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isChangingPassword ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Settings;
