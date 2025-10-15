"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  MapPin,
  Settings,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { API_URL } from "../../../../config";
import { useAuthStore } from "@/lib/store/authStore";
import { countries } from "@/lib/services/countries";
export default function ModernFarmRegistration() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const { token } = useAuthStore();

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    phoneNumber: "",

    // Farm Information
    farmName: "",
    farmType: "crop",
    farmSize: "",
    farmSizeUnit: "hectares",
    establishedYear: "", // Changed to empty string to make it truly optional

    // Location Information
    country: "", // Changed from hardcoded 'Nigeria' to empty string
    state: "",
    city: "",
    address: "",
    coordinates: { latitude: "", longitude: "" },

    // Farm Settings
    currency: "NGN",
    timezone: "Africa/Lagos",
    farmingMethods: [],
    seasonalPattern: "year-round",
    language: "en",
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, title: "Personal", icon: User, description: "Your information" },
    {
      id: 2,
      title: "Farm Details",
      icon: Building2,
      description: "About your farm",
    },
    { id: 3, title: "Location", icon: MapPin, description: "Farm location" },
    {
      id: 4,
      title: "Preferences",
      icon: Settings,
      description: "Customize settings",
    },
  ];


  // will be used later on
  // const farmingMethodOptions = [
  //   'Organic', 'Conventional', 'Integrated Pest Management', 'Precision Agriculture',
  //   'Greenhouse', 'Hydroponics', 'Sustainable', 'Traditional'
  // ];

  const farmingMethodOptions = [
    "organic",
    "irrigation",
    "mechanized",
    "manual",
  ];

  const countryData = countries;

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // This file assumes a function definition for validateStep
  // that accepts formData, currentStep, and the setErrors function.

  /**
   * Validates the current form data based on the step.
   * Returns true if valid (no errors), false if invalid (errors exist).
   * @param {object} formData - The current state of the form data.
   * @param {number} currentStep - The step number to validate.
   * @param {function} setErrors - Function to update the error state in the parent component.
   */
  const validateStep = (formData, currentStep, setErrors) => {
    let newErrors = {};

    switch (currentStep) {
      case 1:
        // Personal Information validation - exact match to backend
        if (
          !formData.firstName ||
          formData.firstName.toString().trim() === ""
        ) {
          newErrors.firstName = "First name is required";
        }
        if (!formData.lastName || formData.lastName.toString().trim() === "") {
          newErrors.lastName = "Last name is required";
        }
        if (
          !formData.phoneNumber ||
          formData.phoneNumber.toString().trim() === ""
        ) {
          newErrors.phoneNumber = "Phone number is required";
        }
        break;

      case 2:
        // Farm Details validation - exact match to backend
        if (!formData.farmName || formData.farmName.toString().trim() === "") {
          newErrors.farmName = "Farm name is required";
        }
        if (!formData.farmType || formData.farmType.toString().trim() === "") {
          newErrors.farmType = "Farm type is required";
        }
        if (!formData.farmSize || formData.farmSize.toString().trim() === "") {
          newErrors.farmSize = "Farm size is required";
        } else if (
          isNaN(parseFloat(formData.farmSize)) ||
          parseFloat(formData.farmSize) <= 0
        ) {
          newErrors.farmSize = "Farm size must be a positive number";
        }
        if (
          !formData.farmSizeUnit ||
          formData.farmSizeUnit.toString().trim() === ""
        ) {
          newErrors.farmSizeUnit = "Farm size unit is required";
        }

        // Enhanced validation for establishedYear - matches backend exactly
        if (
          formData.establishedYear &&
          formData.establishedYear.toString().trim() !== ""
        ) {
          const year = parseInt(formData.establishedYear);
          if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
            newErrors.establishedYear =
              "Established year must be a valid year between 1900 and current year";
          }
        }
        break;

      case 3:
        // Location validation - exact match to backend
        // Country, State, and City are required. Address is optional.
        if (!formData.country || formData.country.toString().trim() === "") {
          newErrors.country = "Country is required";
        }
        if (!formData.state || formData.state.toString().trim() === "") {
          newErrors.state = "State is required";
        }
        if (!formData.city || formData.city.toString().trim() === "") {
          newErrors.city = "City is required";
        }
        // Address validation block has been removed, making it optional.

        // Enhanced coordinates validation - matches backend exactly
        if (formData.coordinates) {
          const lat = formData.coordinates.latitude || formData.coordinates.lat;
          const lng =
            formData.coordinates.longitude || formData.coordinates.lng;

          if (lat || lng) {
            if (!lat || !lng) {
              newErrors.coordinates =
                "Both latitude and longitude are required when coordinates are provided";
            } else if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
              newErrors.coordinates =
                "Latitude and longitude must be valid decimal numbers";
            } else {
              const latitude = parseFloat(lat);
              const longitude = parseFloat(lng);

              if (latitude < -90 || latitude > 90) {
                newErrors.coordinates =
                  "Latitude must be between -90 and 90 degrees";
              } else if (longitude < -180 || longitude > 180) {
                newErrors.coordinates =
                  "Longitude must be between -180 and 180 degrees";
              }
            }
          }
        }
        break;

      case 4:
        // Preferences validation - exact match to backend
        if (!formData.currency || formData.currency.toString().trim() === "") {
          newErrors.currency = "Currency is required";
        }
        if (!formData.timezone || formData.timezone.toString().trim() === "") {
          newErrors.timezone = "Timezone is required";
        }
        if (!formData.language || formData.language.toString().trim() === "") {
          newErrors.language = "Language is required";
        } else if (!/^[a-z]{2}$/.test(formData.language.toLowerCase())) {
          newErrors.language =
            "Language must be a valid ISO 639-1 code (e.g., en, yo, fr, es)";
        }

        // Enhanced seasonal pattern validation - matches backend
        if (
          !formData.seasonalPattern ||
          (Array.isArray(formData.seasonalPattern) &&
            formData.seasonalPattern.length === 0) ||
          (typeof formData.seasonalPattern === "string" &&
            formData.seasonalPattern.trim() === "")
        ) {
          newErrors.seasonalPattern = "Seasonal pattern is required";
        }


        break;

      default:
        break;
    }

    // Update the state so errors are displayed to the user
    if (setErrors) {
      setErrors(newErrors);
    }

    // CRITICAL: Return true only if there are NO errors
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(formData, currentStep, setErrors)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(formData, currentStep, setErrors)) return;

    setLoading(true);
    setRegistrationError("");

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

        farmingMethods: formData.farmingMethods
          .map((method) => method.trim())
          .filter((method) => method !== ""),
        seasonalPattern: Array.isArray(formData.seasonalPattern)
          ? formData.seasonalPattern[0].trim()
          : formData.seasonalPattern.trim(),
        language: formData.language.trim().toLowerCase(), // Ensure lowercase for ISO format
      };

      const response = await fetch(`${API_URL}/api/create-farm-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || errorData.errors?.join(", ") || errorData.error || "Registration failed" 
        );
      }

      const result = await response.json();

      router.push("/dashboard");

      console.log("Registration successful:", result);
    } catch (error) {
      console.error("Registration error:", error.errors);
      setRegistrationError(
        error.message ||
          error?.errors ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  const toggleMethod = (method) => {
    const current = formData.farmingMethods;
    const updated = current.includes(method)
      ? current.filter((m) => m !== method)
      : [...current, method];
    updateFormData("farmingMethods", updated);
  };

  const renderStepIndicator = () => (
    <div className=" flex items-center justify-center mb-12">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center md:items-center">
          <div
            className={`group relative flex items-center justify-center w-8 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-2xl border-2 transition-all duration-300 ${
              currentStep >= step.id
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                : currentStep === step.id
                  ? "border-emerald-300 text-emerald-600 bg-emerald-50"
                  : "border-gray-200 text-gray-400 bg-white"
            }`}
          >
            {currentStep > step.id ? (
              <CheckCircle size={24} />
            ) : (
              <step.icon size={24} />
            )}
            {currentStep === step.id && (
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-2xl blur opacity-30 animate-pulse"></div>
            )}
          </div>

          <div className="ml-4 mr-0 lg:mr-8 hidden md:block">
            <p
              className={`font-semibold text-sm ${
                currentStep >= step.id ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              {step.title}
            </p>
            <p className="text-xs text-gray-500">{step.description}</p>
          </div>

          {index < steps.length - 1 && (
            <div
              className={`w-4 md:w-6 lg:w-16  h-1 mx-4 rounded-full transition-all duration-300 ${
                currentStep > step.id
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                  : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <User className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
          Personal Information
        </h2>
        <p className="text-gray-500 text-lg">
          Tell us about yourself to get started
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            First Name
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
            onChange={(e) => updateFormData("firstName", e.target.value)}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm font-medium">
              {errors.firstName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Last Name
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
            onChange={(e) => updateFormData("lastName", e.target.value)}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm font-medium">
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Phone Number
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
          onChange={(e) => updateFormData("phoneNumber", e.target.value)}
        />
        {errors.phoneNumber && (
          <p className="text-red-500 text-sm font-medium">
            {errors.phoneNumber}
          </p>
        )}
      </div>
    </div>
  );

  const renderFarmDetails = () => (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
          Farm Information
        </h2>
        <p className="text-gray-500 text-lg">
          Tell us about your farming operation
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Farm Name
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
          onChange={(e) => updateFormData("farmName", e.target.value)}
        />
        {errors.farmName && (
          <p className="text-red-500 text-sm font-medium">{errors.farmName}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Farm Type
        </label>
        <select
          className="w-full px-5 py-4 border-2 border-gray-200 bg-gray-50 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:bg-white hover:border-gray-300 transition-all duration-200"
          value={formData.farmType}
          onChange={(e) => updateFormData("farmType", e.target.value)}
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
          <label className="block text-sm font-semibold text-gray-700">
            Farm Size
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
            onChange={(e) => updateFormData("farmSize", e.target.value)}
          />
          {errors.farmSize && (
            <p className="text-red-500 text-sm font-medium">
              {errors.farmSize}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Unit
          </label>
          <select
            className="w-full px-5 py-4 border-2 border-gray-200 bg-gray-50 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:bg-white hover:border-gray-300 transition-all duration-200"
            value={formData.farmSizeUnit}
            onChange={(e) => updateFormData("farmSizeUnit", e.target.value)}
          >
            <option value="hectares">Hectares</option>
            <option value="acres">Acres</option>
            <option value="plots">Plots</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
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
          onChange={(e) => updateFormData("establishedYear", e.target.value)}
        />
        {errors.establishedYear && (
          <p className="text-red-500 text-sm font-medium">
            {errors.establishedYear}
          </p>
        )}
      </div>
    </div>
  );

  const renderLocation = () => (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
          Farm Location
        </h2>
        <p className="text-gray-500 text-lg">
          Tell us where your farm is located
        </p>
      </div>

      <div className="p-2 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-800 mb-3 tracking-wide">
              Country
            </label>
            <div className="relative">
              <select
                className={`w-full px-5 py-4 bg-white border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer shadow-sm hover:shadow-md ${
                  errors.country
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                value={formData.country}
                onChange={(e) => updateFormData("country", e.target.value)}
              >
                {countryData.map((country) => (
                  <option key={country.name} value={country.name.toLowerCase()}>
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
            <label className="block text-sm font-semibold text-gray-800 mb-3 tracking-wide">
              State
            </label>
            <div className="relative">
              <select
                className={`w-full px-5 py-4 bg-white border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer shadow-sm hover:shadow-md ${
                  errors.state
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                value={formData.state}
                onChange={(e) => updateFormData("state", e.target.value)}
              >
                <option value="">Choose your state</option>
                {countryData
                  .find(
                    (c) =>
                      c.name.toLowerCase() === formData.country?.toLowerCase()
                  )
                  ?.states.map((state) => (
                    <option key={state.name} value={state.name.toLowerCase()}>
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
            <label className="block text-sm font-semibold text-gray-800 mb-3 tracking-wide">
              City/Town
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
              onChange={(e) => updateFormData("city", e.target.value)}
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
          <label className="block text-sm font-semibold text-gray-800 mb-3 tracking-wide">
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
            onChange={(e) => updateFormData("address", e.target.value)}
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
                  updateFormData("coordinates", {
                    ...formData.coordinates,
                    latitude: e.target.value,
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
                  updateFormData("coordinates", {
                    ...formData.coordinates,
                    longitude: e.target.value,
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
                Providing accurate location data enables personalized weather
                forecasts, soil analysis, crop recommendations, and connects you
                with local agricultural resources.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-8 max-w-4xl mx-2 md:mx-auto">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Settings className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
          Farm Preferences
        </h2>
        <p className="text-gray-500 text-base md:text-lg">
          Customize your farm management settings to get personalized
          recommendations
        </p>
      </div>
      <div className="p-0  md:p-4 space-y-8">


        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <label className=" text-lg font-semibold text-gray-800 mb-4 flex items-center">
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
            Farming Methods
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
            <label className=" text-sm font-semibold text-gray-800 mb-3 tracking-wide flex items-center">
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
              Currency
            </label>
            <div className="relative">
              <select
                className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer shadow-sm hover:shadow-md"
                value={formData.currency}
                onChange={(e) => updateFormData("currency", e.target.value)}
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
            <label className=" text-sm font-semibold text-gray-800 mb-3 tracking-wide flex items-center">
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
              Seasonal Pattern
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
                  updateFormData("seasonalPattern", e.target.value)
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
            <label className=" text-sm font-semibold text-gray-800 mb-3 tracking-wide flex items-center">
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
              Language
            </label>
            <div className="relative">
              <select
                className={`w-full px-5 py-4 bg-white border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer shadow-sm hover:shadow-md ${
                  errors.language
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200"
                }`}
                value={formData.language}
                onChange={(e) => updateFormData("language", e.target.value)}
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
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderFarmDetails();
      case 3:
        return renderLocation();
      case 4:
        return renderPreferences();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl text-center md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-emerald-800 to-slate-900 bg-clip-text text-transparent mb-6 leading-tight">
          Welcome to
          <span className=" text-emerald-600"> Famtech</span>
        </h2>

        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed text-center mb-8">
          Our diverse team of experts combines decades of experience in
          agriculture, technology, and business to revolutionize farming through
          innovation.
        </p>

        {renderStepIndicator()}

        <div className="bg-white rounded-3xl shadow-xl p-4 md:p-8 lg:p-12">
          {renderCurrentStep()}

          {registrationError && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm font-medium">
                {registrationError}
              </p>
            </div>
          )}

          <div className="text-xs md:text-base flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center space-x-0 md:space-x-2 px-0 md:px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>

            <div className="text-xs md:text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </div>

            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-0 md:space-x-2 bg-green-600 text-white px-3 md:px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-all"
              >
                <span>Next</span>
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center text-xs md:text-base space-x-0 md:space-x-2 bg-green-600 text-white px-3 md:px-8 py-3 rounded-xl font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>Submit</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
