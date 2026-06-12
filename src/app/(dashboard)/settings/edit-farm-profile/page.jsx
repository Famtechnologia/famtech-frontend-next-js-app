"use client";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  User, 
  Home, 
  MapPin, 
  Settings as SettingsIcon, 
  Check, 
  CheckCircle,
  Sprout,
  Plus,
  X,
  Smartphone,
  Globe,
  Layers,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/api/apiClient";
import { useAuthStore } from "@/lib/store/authStore";
import { countries } from "@/lib/services/countries";
import { toast } from "react-hot-toast";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from "@/lib/hooks/useProfile";

export default function ModernFarmRegistration() {
  const [loading, setLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const { user } = useAuth();
  const { profile, setProfile } = useProfile();
  
  // Custom crops input state
  const [newCrop, setNewCrop] = useState("");

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

  const [errors, setErrors] = useState({});

  // Populate form fields from profile hook when ready
  useEffect(() => {
    if (profile && Object.keys(profile).length > 0) {
      setFormData({
        firstName: profile?.owner?.firstName || "",
        lastName: profile?.owner?.lastName || "",
        phoneNumber: profile?.owner?.phoneNumber || "",
        farmName: profile?.farmName || "",
        farmType: profile?.farmType || "crop",
        farmSize: profile?.farmSize || "",
        farmSizeUnit: profile?.farmSizeUnit || "hectares",
        establishedYear: profile?.establishedYear || "",
        country: profile?.location?.country || "",
        state: profile?.location?.state || "",
        city: profile?.location?.city || "",
        address: profile?.location?.address || "",
        coordinates: {
          latitude: profile?.location?.coordinates?.latitude || "",
          longitude: profile?.location?.coordinates?.longitude || "",
        },
        currency: profile?.currency || "NGN",
        timezone: profile?.timezone || "Africa/Lagos",
        primaryCrops: profile?.primaryCrops || [],
        farmingMethods: profile?.farmingMethods || [],
        seasonalPattern: profile?.seasonalPattern || "year-round",
        language: profile?.language || "en",
      });
    }
  }, [profile]);

  const farmingMethodOptions = ["organic", "irrigation", "mechanized", "manual"];
  const popularCrops = ["Maize", "Cassava", "Yam", "Rice", "Cocoa", "Cowpea", "Tomato", "Pepper", "Cashew"];

  const timezoneOptions = [
    { value: "Africa/Lagos", label: "West Africa Time (Lagos)" },
    { value: "Africa/Nairobi", label: "East Africa Time (Nairobi)" },
    { value: "Africa/Johannesburg", label: "South Africa Standard Time (Johannesburg)" },
    { value: "UTC", label: "Coordinated Universal Time (UTC)" },
    { value: "Europe/London", label: "Greenwich Mean Time (London)" },
    { value: "America/New_York", label: "Eastern Standard Time (New York)" }
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    if (!formData.farmName.trim()) newErrors.farmName = "Farm name is required";
    if (!formData.farmType.trim()) newErrors.farmType = "Farm type is required";
    
    if (!formData.farmSize || isNaN(parseFloat(formData.farmSize)) || parseFloat(formData.farmSize) <= 0) {
      newErrors.farmSize = "Farm size must be a positive number";
    }
    
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.city.trim()) newErrors.city = "City/Town is required";
    if (!formData.currency.trim()) newErrors.currency = "Currency is required";
    if (!formData.timezone.trim()) newErrors.timezone = "Timezone is required";
    if (!formData.language.trim()) newErrors.language = "Language is required";
    
    if (formData.farmingMethods.length === 0) {
      newErrors.farmingMethods = "Select at least one farming method";
    }

    if (formData.establishedYear) {
      const year = parseInt(formData.establishedYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear) {
        newErrors.establishedYear = `Must be a valid year between 1900 and ${currentYear}`;
      }
    }

    if (formData.coordinates.latitude || formData.coordinates.longitude) {
      const lat = parseFloat(formData.coordinates.latitude);
      const lng = parseFloat(formData.coordinates.longitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.latitude = "Latitude must be between -90 and 90";
      }
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.longitude = "Longitude must be between -180 and 180";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly.");
      return;
    }

    setLoading(true);
    setUpdateError("");

    try {
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        farmName: formData.farmName.trim(),
        farmType: formData.farmType.trim(),
        farmSize: parseFloat(formData.farmSize),
        farmSizeUnit: formData.farmSizeUnit.trim(),
        establishedYear: formData.establishedYear ? parseInt(formData.establishedYear) : undefined,
        country: formData.country.trim(),
        state: formData.state.trim(),
        city: formData.city.trim(),
        address: formData.address ? formData.address.trim() : undefined,
        coordinates: formData.coordinates.latitude && formData.coordinates.longitude ? {
          latitude: parseFloat(formData.coordinates.latitude),
          longitude: parseFloat(formData.coordinates.longitude),
        } : undefined,
        currency: formData.currency.trim(),
        timezone: formData.timezone.trim(),
        primaryCrops: formData.primaryCrops.map(crop => crop.trim()).filter(crop => crop !== ""),
        farmingMethods: formData.farmingMethods.map(method => method.trim()).filter(method => method !== ""),
        seasonalPattern: Array.isArray(formData.seasonalPattern)
          ? formData.seasonalPattern[0].trim()
          : formData.seasonalPattern.trim(),
        language: formData.language.trim().toLowerCase(),
      };

      const response = await apiClient.put(
        `/api/update-farm-profile/${user?._id}`,
        registrationData
      );

      const result = response.data;

      if (result?.success) {
        // Instantly update local profile state
        if (result?.data?.farmProfile) {
          setProfile(result.data.farmProfile);
        }
        toast.success("Farm profile updated successfully!");
      } else {
        throw new Error(result?.message || "Failed to update profile");
      }
    } catch (error) {
      const errMsg = error.response?.data?.errors?.[0] || error.message || "Update failed. Please try again.";
      setUpdateError(errMsg);
      toast.error(errMsg);
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

  const handleAddCrop = (e) => {
    e.preventDefault();
    if (!newCrop.trim()) return;
    if (formData.primaryCrops.includes(newCrop.trim())) {
      setNewCrop("");
      return;
    }
    setFormData({
      ...formData,
      primaryCrops: [...formData.primaryCrops, newCrop.trim()]
    });
    setNewCrop("");
  };

  const handleRemoveCrop = (cropToRemove) => {
    setFormData({
      ...formData,
      primaryCrops: formData.primaryCrops.filter(c => c !== cropToRemove)
    });
  };

  const togglePopularCrop = (crop) => {
    const current = formData.primaryCrops;
    const updated = current.includes(crop)
      ? current.filter(c => c !== crop)
      : [...current, crop];
    setFormData({ ...formData, primaryCrops: updated });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div className="space-y-1">
          <Link 
            href="/settings/profile" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1.5 rounded-lg transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Profile
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Edit Farm Profile
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Update your operational parameters, location, and account details.
          </p>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-95 transition-all duration-150 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {updateError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-2xl flex items-center gap-2">
          <span>⚠️</span> {updateError}
        </div>
      )}

      {/* FORM BODY */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: OWNER & FARM IDENTITY */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Owner & Identity</h2>
              <p className="text-xs text-slate-400 font-medium font-sans">Primary owner and farm classification</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">First Name *</label>
              <input
                type="text"
                placeholder="First Name"
                className={`w-full px-4 py-3 bg-slate-50/50 border rounded-xl text-sm font-medium transition focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 ${
                  errors.firstName ? "border-red-300 bg-red-50/30" : "border-slate-200"
                }`}
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              {errors.firstName && <p className="text-red-500 text-xs font-medium">{errors.firstName}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Last Name *</label>
              <input
                type="text"
                placeholder="Last Name"
                className={`w-full px-4 py-3 bg-slate-50/50 border rounded-xl text-sm font-medium transition focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 ${
                  errors.lastName ? "border-red-300 bg-red-50/30" : "border-slate-200"
                }`}
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
              {errors.lastName && <p className="text-red-500 text-xs font-medium">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
              <Smartphone className="h-3.5 w-3.5 text-slate-400" /> Phone Number *
            </label>
            <input
              type="tel"
              placeholder="+234..."
              className={`w-full px-4 py-3 bg-slate-50/50 border rounded-xl text-sm font-medium transition focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 ${
                errors.phoneNumber ? "border-red-300 bg-red-50/30" : "border-slate-200"
              }`}
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
            {errors.phoneNumber && <p className="text-red-500 text-xs font-medium">{errors.phoneNumber}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Farm Name *</label>
            <input
              type="text"
              placeholder="e.g. Green Roots Cooperative"
              className={`w-full px-4 py-3 bg-slate-50/50 border rounded-xl text-sm font-medium transition focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 ${
                errors.farmName ? "border-red-300 bg-red-50/30" : "border-slate-200"
              }`}
              value={formData.farmName}
              onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
            />
            {errors.farmName && <p className="text-red-500 text-xs font-medium">{errors.farmName}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Farm Type *</label>
              <select
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium transition focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500"
                value={formData.farmType}
                onChange={(e) => setFormData({ ...formData, farmType: e.target.value })}
              >
                <option value="crop">Crop Farming</option>
                <option value="livestock">Livestock</option>
                <option value="mixed">Mixed Farming</option>
                <option value="aquaculture">Aquaculture</option>
                <option value="poultry">Poultry</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Established Year</label>
              <input
                type="number"
                placeholder="e.g. 2018"
                className={`w-full px-4 py-3 bg-slate-50/50 border rounded-xl text-sm font-medium transition focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 ${
                  errors.establishedYear ? "border-red-300 bg-red-50/30" : "border-slate-200"
                }`}
                value={formData.establishedYear}
                onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
              />
              {errors.establishedYear && <p className="text-red-500 text-xs font-medium">{errors.establishedYear}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Farm Size *</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 150"
                className={`w-full px-4 py-3 bg-slate-50/50 border rounded-xl text-sm font-medium transition focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 ${
                  errors.farmSize ? "border-red-300 bg-red-50/30" : "border-slate-200"
                }`}
                value={formData.farmSize}
                onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
              />
              {errors.farmSize && <p className="text-red-500 text-xs font-medium">{errors.farmSize}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Unit *</label>
              <select
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium transition focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500"
                value={formData.farmSizeUnit}
                onChange={(e) => setFormData({ ...formData, farmSizeUnit: e.target.value })}
              >
                <option value="hectares">Hectares</option>
                <option value="acres">Acres</option>
                <option value="plots">Plots</option>
              </select>
            </div>
          </div>
        </div>

        {/* CARD 2: LOCATION & GEOGRAPHY */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Location & Coordinates</h2>
              <p className="text-xs text-slate-400 font-medium font-sans">Geographic setting and layout mapping</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Country *</label>
              <select
                className={`w-full px-4 py-3 bg-slate-50/50 border rounded-xl text-sm font-medium transition focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 ${
                  errors.country ? "border-red-300" : "border-slate-200"
                }`}
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value, state: "" })}
              >
                <option value="">Choose Country</option>
                {countries.map((c) => (
                  <option key={c.name} value={c.name.toLowerCase()}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.country && <p className="text-red-500 text-xs font-medium">{errors.country}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">State *</label>
              <select
                className={`w-full px-4 py-3 bg-slate-50/50 border rounded-xl text-sm font-medium transition focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 ${
                  errors.state ? "border-red-300" : "border-slate-200"
                }`}
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              >
                <option value="">Choose State</option>
                {countries
                  .find((c) => c.name.toLowerCase() === formData.country?.toLowerCase())
                  ?.states.map((st) => (
                    <option key={st.name} value={st.name.toLowerCase()}>
                      {st.name}
                    </option>
                  ))}
              </select>
              {errors.state && <p className="text-red-500 text-xs font-medium">{errors.state}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">City *</label>
              <input
                type="text"
                placeholder="City/Town"
                className={`w-full px-4 py-3 bg-slate-50/50 border rounded-xl text-sm font-medium transition focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 ${
                  errors.city ? "border-red-300" : "border-slate-200"
                }`}
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              {errors.city && <p className="text-red-500 text-xs font-medium">{errors.city}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Street Address (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Km 12, Lagos-Ibadan Expressway"
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium transition focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">GPS Coordinates</span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full">Optional</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">Latitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 6.5244"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition ${
                    errors.latitude ? "border-red-300" : "border-slate-200"
                  }`}
                  value={formData.coordinates.latitude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coordinates: { ...formData.coordinates, latitude: e.target.value },
                    })
                  }
                />
                {errors.latitude && <p className="text-red-500 text-[10px] font-medium">{errors.latitude}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">Longitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 3.3792"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition ${
                    errors.longitude ? "border-red-300" : "border-slate-200"
                  }`}
                  value={formData.coordinates.longitude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coordinates: { ...formData.coordinates, longitude: e.target.value },
                    })
                  }
                />
                {errors.longitude && <p className="text-red-500 text-[10px] font-medium">{errors.longitude}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: CROPS & METHODS */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 lg:col-span-2">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Operational profile & Preferences</h2>
              <p className="text-xs text-slate-400 font-medium font-sans">Cultivation systems and target crop portfolios</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Farming Methods */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Farming Methods *</label>
              <div className="grid grid-cols-2 gap-3">
                {farmingMethodOptions.map((method) => {
                  const isChecked = formData.farmingMethods.includes(method);
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => toggleMethod(method)}
                      className={`flex items-center gap-2.5 p-3.5 border rounded-xl text-sm font-bold capitalize transition text-left ${
                        isChecked
                          ? "bg-emerald-50/50 border-emerald-500 text-emerald-800"
                          : "border-slate-200 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                        isChecked ? "bg-emerald-600 border-emerald-600" : "border-slate-300"
                      }`}>
                        {isChecked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </div>
                      {method}
                    </button>
                  );
                })}
              </div>
              {errors.farmingMethods && <p className="text-red-500 text-xs font-medium">{errors.farmingMethods}</p>}
            </div>

            {/* Primary Crops Tagging */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Primary Crops</label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom crop..."
                  className="flex-1 px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500"
                  value={newCrop}
                  onChange={(e) => setNewCrop(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCrop(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCrop}
                  className="px-3 bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 rounded-xl transition flex items-center justify-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Popular crop suggestions */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suggestions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {popularCrops.map(crop => {
                    const isSelected = formData.primaryCrops.includes(crop);
                    return (
                      <button
                        key={crop}
                        type="button"
                        onClick={() => togglePopularCrop(crop)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                          isSelected 
                            ? "bg-blue-50 border-blue-200 text-blue-800" 
                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {crop}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Displayed active crops */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Selected Crops ({formData.primaryCrops.length}):</span>
                {formData.primaryCrops.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 min-h-[50px]">
                    {formData.primaryCrops.map((crop) => (
                      <span
                        key={crop}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-100 capitalize animate-fade-in"
                      >
                        <Sprout className="h-3 w-3 text-emerald-600" />
                        {crop}
                        <button
                          type="button"
                          onClick={() => handleRemoveCrop(crop)}
                          className="ml-1 text-emerald-500 hover:text-emerald-800 rounded transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs text-slate-400 italic">
                    No crops added yet. Choose from suggestions or type custom crops above.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-slate-400" /> Currency *
              </label>
              <select
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium transition focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="NGN">Nigerian Naira (₦)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-slate-400" /> Seasonal Cycle *
              </label>
              <select
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium transition focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500"
                value={formData.seasonalPattern}
                onChange={(e) => setFormData({ ...formData, seasonalPattern: e.target.value })}
              >
                <option value="year-round">Year-round Production</option>
                <option value="dry-season">Dry Season Only</option>
                <option value="rainy-season">Rainy Season Only</option>
                <option value="both-seasons">Both Seasons</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-slate-400" /> Language *
              </label>
              <select
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium transition focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                <option value="en">English</option>
                <option value="yo">Yoruba</option>
                <option value="ig">Igbo</option>
                <option value="ha">Hausa</option>
                <option value="fr">French</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                <SettingsIcon className="h-3.5 w-3.5 text-slate-400" /> Timezone *
              </label>
              <select
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium transition focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              >
                {timezoneOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

      </form>
      
      {/* BOTTOM BUTTON */}
      <div className="flex items-center justify-end pt-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full md:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
