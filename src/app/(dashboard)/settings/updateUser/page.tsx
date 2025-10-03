"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useAuthStore, User } from "@/lib/store/authStore";
// Import your country data and types from your files
import { countries } from "@/lib/services/countries";

// --- START: Re-defined Types (Assuming these are in your global types or countries.js) ---
interface State {
  name: string;
}

interface Country {
  name: string;
  states: State[];
}

// Define the API call structure for updating the user
// Replace this with your actual API function from "@/lib/api/auth"
const updateUser = async (updateData: Partial<UpdateFormInputs>): Promise<{ data: { user: User }, message: string }> => {
  console.log("Simulating API call to update user with:", updateData);
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // NOTE: You MUST implement the actual backend API call here.
  // Example: 
  // const res = await fetch('/api/user/update', { 
  //   method: 'PUT', 
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(updateData)
  // });
  // const data = await res.json();
  // return data; 
  
  // Simulation: Assuming success and returning the updated data
  const currentUser = useAuthStore.getState().user;
  if (!currentUser) throw new Error("User not authenticated for update simulation.");
  
  const updatedUser: User = {
      ...currentUser,
      ...updateData,
      country: updateData.country || currentUser.country,
      state: updateData.state || currentUser.state,
  };

  return { 
      data: { user: updatedUser }, 
      message: "Details updated successfully!" 
  };
};
// --- END: Placeholder API Function ---

// Define the structure for the update form inputs
interface UpdateFormInputs {
  country: string;
  state: string;
}

// Helper to get country list with correct typing
const countryList = countries as Country[];

export default function UpdateDetailsForm() {
  const { user, setUser } = useAuthStore();
  const [initialLoading, setInitialLoading] = useState(true);

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
    reset, // Used to reset form state after a successful submission
  } = useForm<UpdateFormInputs>({
    // Set default values from the user state
    defaultValues: {
      country: user?.country?.toLowerCase() || "",
      state: user?.state?.toLowerCase() || "",
    },
    mode: "onBlur" // Validate on blur for a better UX
  });

  // Watch selected country to populate the state dropdown
  const selectedCountryName = watch("country");

  // Find the selected country object
  const selectedCountry = countryList.find(
    (country) => country.name.toLowerCase() === selectedCountryName
  );

  // Set initial form values and handle hydration from the store
  useEffect(() => {
    if (user) {
      reset({ // Use reset to set defaults and mark form as "pristine"
        country: user.country?.toLowerCase() || "",
        state: user.state?.toLowerCase() || "",
      });
      setInitialLoading(false);
    } else {
      // Handle case where user is null (e.g., redirect to login)
      // For this component, we'll just show a message.
      setInitialLoading(false);
      toast.error("User data not found. Please log in.");
    }
  }, [user, reset]); // Dependency on user and reset

  // Logic to clear the state selection when the country changes
  useEffect(() => {
    // Only clear if a country is selected and the component has loaded
    if (!initialLoading && selectedCountryName) {
      const currentState = watch("state");
      
      // Check if the current state still belongs to the new country
      const stateExists = selectedCountry?.states.some(
        (s) => s.name.toLowerCase() === currentState
      );
      
      // If the state is not valid for the new country, or if it's the initial load with no state, clear it.
      if (!stateExists) {
        setValue("state", "", { shouldValidate: true, shouldDirty: true });
      }
    }
  }, [selectedCountryName, setValue, watch, initialLoading, selectedCountry]);

  // Handle form submission
  const onSubmit = async (data: UpdateFormInputs) => {
    if (!user) {
      toast.error("Authentication error. Please log in again.");
      return;
    }
    
    // Only send fields that have actually changed
    const dataToUpdate: Partial<UpdateFormInputs> = {};
    if (data.country?.toLowerCase() !== user.country?.toLowerCase()) {
      dataToUpdate.country = data.country;
    }
    if (data.state?.toLowerCase() !== user.state?.toLowerCase()) {
      dataToUpdate.state = data.state;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      toast("No changes detected.", { icon: 'ℹ️' });
      return;
    }

    try {
      const res = await updateUser(dataToUpdate);

      const { data: resData, message } = res;
      const { user: responseUser } = resData;

      if (!responseUser) {
        throw new Error("No user returned from server after update");
      }

      // Update the user state in the store
      const updatedUser: User = {
        ...user,
        country: responseUser.country ?? data.country,
        state: responseUser.state ?? data.state,
      };
      
      setUser(updatedUser); // Update the global state
      
      // Reset the form with the new values to clear the 'isDirty' state
      reset({
        country: updatedUser.country?.toLowerCase() || "",
        state: updatedUser.state?.toLowerCase() || "",
      });

      toast.success(message || "Your details have been successfully updated! 🎉");
    } catch (err: unknown) {
      console.error("Update failed:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Update failed. Please try again.";
      toast.error(errorMessage);
    }
  };
  
  if (initialLoading) {
    return <div className="text-center p-8">Loading user data...</div>;
  }
  
  if (!user) {
      return <div className="text-center p-8 text-red-600">User data not available.</div>;
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Update Sign-In Details
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Email - Read-only and masked */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <div className="mt-1 p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 font-mono">
            {user.email}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Email cannot be changed via this form.
          </p>
        </div>

        {/* Password - Read-only and masked */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="mt-1 p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 tracking-widest font-bold">
            ********
          </div>
          <p className="mt-1 text-xs text-gray-500">
            To change your password, please use the dedicated &#34;Change Password&#34; section.
          </p>
        </div>

        {/* --- Editable Fields --- */}
        <hr className="border-gray-200" />
        
        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
          <select
            id="country"
            {...register("country", { required: "Country is required" })}
            className="mt-1 w-full p-3 border-gray-300 border rounded-xl focus:ring-green-500 focus:border-green-500"
          >
            <option value="" hidden>Select Country</option>
            {countryList.map((country: Country) => (
              <option 
                key={country.name} 
                value={country.name?.toLowerCase()}
              >
                {country.name}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="mt-1 text-red-600 text-sm">{errors.country.message}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
          <select
            id="state"
            {...register("state", { required: "State is required" })}
            className="mt-1 w-full p-3 border-gray-300 border rounded-xl focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
            disabled={!selectedCountry}
          >
            <option value="" hidden>Select State</option>
            {selectedCountry?.states.map((state: State) => (
              <option 
                key={state.name} 
                value={state.name.toLowerCase()}
              >
                {state.name}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="mt-1 text-red-600 text-sm">{errors.state.message}</p>
          )}
        </div>

        {/* Submission Button */}
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="w-full bg-green-600 text-white p-3 rounded-xl font-semibold hover:bg-green-700 transition duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Updating..." : "Update Details"}
        </button>
        {isDirty && !isSubmitting && (
            <p className="text-center text-sm text-blue-600">
                You have unsaved changes.
            </p>
        )}
      </form>
    </div>
  );
}