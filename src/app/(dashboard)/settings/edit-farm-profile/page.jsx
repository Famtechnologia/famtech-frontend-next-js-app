"use client";
import { useState, useEffect } from "react";

import { CheckCircle } from "lucide-react";
import apiClient from "@/lib/api/apiClient";
import { useAuthStore } from "@/lib/store/authStore";
import { countries } from "@/lib/services/countries";
import { toast } from "react-hot-toast";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from "@/lib/hooks/useProfile";

const GET_PROFILE_URL = "/api/get-profile";

export default function ModernFarmRegistration() {
  const [loading, setLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const { token } = useAuthStore();
  const [farmProfile, setFarmProfile] = useState({});
  const { user } = useAuth();
  const { profile } = useProfile();

  useEffect(() => {
    setFarmProfile(profile);
  }, [profile]);

  // 1️⃣ Keep this as an empty state initially
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    farmName: "",
    farmType: "crop",
    farmSize: "",
    farmSizeUnit: "hectares",
    establishedYear: "",
    country: "",
    state: "",
    city: "",
    address: "",
    coordinates: {
      latitude: "",
      longitude: "",
    },
    currency: "NGN",
    timezone: "Africa/Lagos",
    primaryCrops: [],
    farmingMethods: [],
    seasonalPattern: "year-round",
    language: "en",
  });

  // 2️⃣ When farmProfile updates (after fetching), populate the form fields
  useEffect(() => {
    if (farmProfile && Object.keys(farmProfile).length > 0) {
      console.log("farmProfile:", farmProfile);
      setFormData({
        firstName: farmProfile?.owner?.firstName || "",
        lastName: farmProfile?.owner?.lastName || "",
        phoneNumber: farmProfile?.owner?.phoneNumber || "",
        farmName: farmProfile?.farmName || "",
        farmType: farmProfile?.farmType || "crop",
        farmSize: farmProfile?.farmSize || "",
        farmSizeUnit: farmProfile?.farmSizeUnit || "hectares",
        establishedYear: farmProfile?.establishedYear || "",
        country: farmProfile?.location?.country || "",
        state: farmProfile?.location?.state || "",
        city: farmProfile?.location?.city || "",
        address: farmProfile?.location?.address || "",
        coordinates: {
          latitude: farmProfile?.location?.coordinates?.latitude || "",
          longitude: farmProfile?.location?.coordinates?.longitude || "",
        },
        currency: farmProfile?.currency || "NGN",
        timezone: farmProfile?.timezone || "Africa/Lagos",
        primaryCrops: farmProfile?.primaryCrop || [],
        farmingMethods: farmProfile?.farmingMethods || [],
        seasonalPattern: farmProfile?.seasonalPattern || "year-round",
        language: farmProfile?.language || "en",
      });
    }
  }, [farmProfile]);

  const [errors, setErrors] = useState({});

  const farmingMethodOptions = [
    "organic",
    "irrigation",
    "mechanized",
    "manual",
  ];

  const countryData = countries;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setUpdateError("");

    try {
      // Prepare data for backend API - matches backend expectations exactly
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        farmName: formData.farmName.trim(),
        farmType: formData.farmType.trim(),
        farmSize: parseFloat(formData.farmSize),
        farmSizeUnit: formData.farmSizeUnit.trim(),
        // Only include establishedYear if it has a value
        ...(formData.establishedYear &&
          formData.establishedYear.toString().trim() !== "" && {
            establishedYear: parseInt(formData.establishedYear),
          }),
        country: formData.country.trim(),
        state: formData.state.trim(),
        city: formData.city.trim(),
        // Only include address if it has a non-empty value
        ...(formData.address &&
          formData.address.toString().trim() !== "" && {
            address: formData.address.trim(),
          }),
        // Only include coordinates if both latitude and longitude are provided
        ...(formData.coordinates.latitude &&
          formData.coordinates.longitude && {
            coordinates: {
              latitude: parseFloat(formData.coordinates.latitude),
              longitude: parseFloat(formData.coordinates.longitude),
            },
          }),
        currency: formData.currency.trim(),
        timezone: formData.timezone.trim(),
        primaryCrops: formData.primaryCrops
          .map((crop) => crop.trim())
          .filter((crop) => crop !== ""),
        farmingMethods: formData.farmingMethods
          .map((method) => method.trim())
          .filter((method) => method !== ""),
        seasonalPattern: Array.isArray(formData.seasonalPattern)
          ? formData.seasonalPattern[0].trim()
          : formData.seasonalPattern.trim(),
        language: formData.language.trim().toLowerCase(), // Ensure lowercase for ISO format
      };

      const response = await apiClient.put(
        `/api/update-farm-profile/${user?._id}`,
        registrationData
      );

      const result = await response.data;

      toast.success(result?.message);
    } catch (error) {
      setUpdateError(error.message || "Update failed. Please try again.");
      toast.error(error.message || "Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMethod = (method) => {
    const current = formData.farmingMethods;
    const updated = current.includes(method)
      ? current.filter((m) => m !== method)
      : [...current, method];
    setFormData({ ...formData, farmingMethods: updated });
  };

  return (
    <div className="min-h-screen bg-none py-12 px-0 md:px-4">
      <div className="w-full">
        <h1 className="text-green-600 flex justify-start text-center md:text-start  text-3xl md:text-4xl font-bold mb-12">
          Update Farm Profile
        </h1>
        <div className="space-y-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm md:text-base font-semibold text-gray-700">
                First Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 ${
                  errors.firstName
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300"
                }`}
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm font-medium">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm md:text-base font-semibold text-gray-700">
                Last Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 ${
                  errors.lastName
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300"
                }`}
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm font-medium">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm md:text-base font-semibold text-gray-700">
              Phone Number<span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 ${
                errors.phoneNumber
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300"
              }`}
              placeholder="+234 XXX XXX XXXX"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm font-medium">
                {errors.phoneNumber}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-8 ">
          <div className="space-y-2">
            <label className="block text-sm md:text-base font-semibold text-gray-700">
              Farm Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 ${
                errors.farmName
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300"
              }`}
              placeholder="Enter your farm name"
              value={formData.farmName}
              onChange={(e) =>
                setFormData({ ...formData, farmName: e.target.value })
              }
            />
            {errors.farmName && (
              <p className="text-red-500 text-sm font-medium">
                {errors.farmName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Farm Type<span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-5 py-4 border-2 border-gray-200 bg-gray-50 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:bg-white hover:border-gray-300 transition-all duration-200"
              value={formData.farmType}
              onChange={(e) =>
                setFormData({ ...formData, farmType: e.target.value })
              }
            >
              <option value="crop">Crop Farming</option>
              <option value="livestock">Livestock</option>
              <option value="mixed">Mixed Farming</option>
              <option value="aquaculture">Aquaculture</option>
              <option value="poultry">Poultry</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm md:text-base font-semibold text-gray-700">
                Farm Size<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 ${
                  errors.farmSize
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300"
                }`}
                placeholder="Enter farm size"
                value={formData.farmSize}
                onChange={(e) =>
                  setFormData({ ...formData, farmSize: e.target.value })
                }
              />
              {errors.farmSize && (
                <p className="text-red-500 text-sm font-medium">
                  {errors.farmSize}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm md:text-base font-semibold text-gray-700">
                Unit
              </label>
              <select
                className="w-full px-5 py-4 border-2 border-gray-200 bg-gray-50 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:bg-white hover:border-gray-300 transition-all duration-200"
                value={formData.farmSizeUnit}
                onChange={(e) =>
                  setFormData({ ...formData, farmSizeUnit: e.target.value })
                }
              >
                <option value="hectares">Hectares</option>
                <option value="acres">Acres</option>
                <option value="plots">Plots</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm md:text-base font-semibold text-gray-700">
              Established Year(optional)
              <span className="text-gray-400 text-xs ml-1"></span>
            </label>
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              className={`w-full px-5 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 ${
                errors.establishedYear
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300"
              }`}
              placeholder="Enter establishment year"
              value={formData.establishedYear}
              onChange={(e) =>
                setFormData({ ...formData, establishedYear: e.target.value })
              }
            />
            {errors.establishedYear && (
              <p className="text-red-500 text-sm font-medium">
                {errors.establishedYear}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-8 w-full">
          <div className="p-2 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="group">
                <label className="block text-sm md:text-base font-semibold text-gray-800 mb-3 tracking-wide">
                  Country<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    className={`w-full px-5 py-4 bg-white border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer shadow-sm hover:shadow-md ${
                      errors.country
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  >
                    {countryData.map((country) => (
                      <option
                        key={country.name}
                        value={country.name.toLowerCase()}
                      >
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {errors.country && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.country}
                  </p>
                )}
              </div>

              <div className="group">
                <label className="block text-sm md:text-base font-semibold text-gray-800 mb-3 tracking-wide">
                  State<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    className={`w-full px-5 py-4 bg-white border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer shadow-sm hover:shadow-md ${
                      errors.state
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                  >
                    <option value="">Choose your state</option>
                    {countryData
                      .find(
                        (c) =>
                          c.name.toLowerCase() ===
                          formData.country?.toLowerCase()
                      )
                      ?.states.map((state) => (
                        <option
                          key={state.name}
                          value={state.name.toLowerCase()}
                        >
                          {state.name}
                        </option>
                      ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {errors.state && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.state}
                  </p>
                )}
              </div>

              <div className="group">
                <label className="block text-sm md:text-base font-semibold text-gray-800 mb-3 tracking-wide">
                  City/Town<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-5 py-4 bg-white border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder-gray-400 ${
                    errors.city
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="Enter your city or town"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.city}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm md:text-base font-semibold text-gray-800 mb-3 tracking-wide">
                Street Address(optional)
              </label>
              <input
                type="text"
                className={`w-full px-5 py-4 bg-white border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder-gray-400 ${
                  errors.address
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                placeholder="Enter your complete street address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.address}
                </p>
              )}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 mb-8">
              <div className="flex items-center mb-4">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800">
                  GPS Coordinates
                </h3>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  Optional
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder-gray-400"
                    placeholder="e.g., 6.5244"
                    value={formData.coordinates.latitude}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        coordinates: {
                          ...formData.coordinates,
                          latitude: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder-gray-400"
                    placeholder="e.g., 3.3792"
                    value={formData.coordinates.longitude}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        coordinates: {
                          ...formData.coordinates,
                          longitude: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {errors.coordinates && (
                <p className="text-red-500 text-sm mt-3 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.coordinates}
                </p>
              )}
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Why location matters
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    Providing accurate location data enables personalized
                    weather forecasts, soil analysis, crop recommendations, and
                    connects you with local agricultural resources.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 w-full mt-8">
          <div className="p-0  md:p-0 space-y-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <label className=" text-sm md:text-base font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
                Farming Methods<span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {farmingMethodOptions.map((method) => (
                  <label
                    key={method}
                    className="flex items-center space-x-3 cursor-pointer group"
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={formData.farmingMethods.includes(method)}
                        onChange={() => toggleMethod(method)}
                      />
                      <div
                        className={`w-5 h-5 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${
                          formData.farmingMethods.includes(method)
                            ? "bg-blue-500 border-blue-500 shadow-lg"
                            : "border-gray-300 group-hover:border-blue-400 bg-white"
                        }`}
                      >
                        {formData.farmingMethods.includes(method) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                      {method}
                    </span>
                  </label>
                ))}
              </div>
              {errors.farmingMethods && (
                <p className="text-red-500 text-sm mt-3 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.farmingMethods}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group">
                <label className=" text-sm md:text-base font-semibold text-gray-800 mb-3 tracking-wide flex items-center">
                  <svg
                    className="w-4 h-4 text-gray-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  Currency<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer shadow-sm hover:shadow-md"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                  >
                    <option value="NGN">Nigerian Naira (₦)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="group">
                <label className=" text-sm md:text-base font-semibold text-gray-800 mb-3 tracking-wide flex items-center">
                  <svg
                    className="w-4 h-4 text-gray-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Seasonal Pattern<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    className={`w-full px-5 py-4 bg-white border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer shadow-sm hover:shadow-md ${
                      errors.seasonalPattern
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200"
                    }`}
                    value={formData.seasonalPattern}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seasonalPattern: e.target.value,
                      })
                    }
                  >
                    <option value="year-round">Year-round Production</option>
                    <option value="dry-season">Dry Season Only</option>
                    <option value="rainy-season">Rainy Season Only</option>
                    <option value="both-seasons">Both Seasons</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {errors.seasonalPattern && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.seasonalPattern}
                  </p>
                )}
              </div>

              <div className="group">
                <label className="text-sm md:text-base font-semibold text-gray-800 mb-3 tracking-wide flex items-center">
                  <svg
                    className="w-4 h-4 text-gray-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                  Language<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    className={`w-full px-5 py-4 bg-white border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer shadow-sm hover:shadow-md ${
                      errors.language
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200"
                    }`}
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({ ...formData, language: e.target.value })
                    }
                  >
                    <option value="en">English</option>
                    <option value="yo">Yoruba</option>
                    <option value="ig">Igbo</option>
                    <option value="ha">Hausa</option>
                    <option value="fr">French</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {errors.language && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.language}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center text-xs md:text-base space-x-2 md:space-x-2 bg-green-600 text-white px-3 md:px-8 py-3 rounded-xl font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Updating Account...</span>
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              <span>Update</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
