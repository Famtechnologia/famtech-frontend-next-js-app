"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useAuthStore, User } from "@/lib/store/authStore";
// Assuming this path is correct for your data
import { countries } from "@/lib/services/countries";

// --- START: Types and Placeholder API Function ---
interface State {
  name: string;
}

interface Country {
  name: string;
  states: State[];
}

interface UpdateFormInputs {
  country: string;
  state: string;
}

const updateUser = async (updateData: Partial<UpdateFormInputs>): Promise<{ data: { user: User }, message: string }> => {
  console.log("Simulating API call to update user with:", updateData);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
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
// --- END: Types and Placeholder API Function ---

const countryList = countries as Country[];

export default function UpdateDetailsForm() {
  const { user, setUser } = useAuthStore();
  
  // 🔑 NEW STATE: Tracks if the form has been initialized with user data after mounting/hydration
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<UpdateFormInputs>({
    // Set initial defaults. These will be overwritten by the useEffect below
    defaultValues: {
      country: user?.country?.toLowerCase() || "",
      state: user?.state?.toLowerCase() || "",
    },
    mode: "onBlur"
  });

  const selectedCountryName = watch("country");

  const selectedCountry = countryList.find(
    (country) => country.name.toLowerCase() === selectedCountryName
  );

  // 1. 🔑 CORE FIX: Set initial form values from the store only AFTER user data is available.
  useEffect(() => {
    // This condition ensures the reset runs only when 'user' is loaded and form hasn't been set yet.
    if (user && !isFormInitialized) { 
      reset({
        country: user.country?.toLowerCase() || "",
        state: user.state?.toLowerCase() || "",
      });
      setIsFormInitialized(true); // Mark as initialized to prevent rerunning
    }
    // Also, if the user becomes null (logged out), reset the initialization flag
    if (!user) {
        setIsFormInitialized(false);
    }
  }, [user, reset, isFormInitialized]);

  // 2. Logic to clear the state selection when the country changes
  useEffect(() => {
    // Only run this logic after the form has been initialized
    if (isFormInitialized && selectedCountryName) {
      const currentState = watch("state");
      
      const stateExists = selectedCountry?.states.some(
        (s) => s.name.toLowerCase() === currentState
      );
      
      if (!stateExists) {
        // Clear the state field, mark it as changed, and validate
        setValue("state", "", { shouldValidate: true, shouldDirty: true });
      }
    }
  }, [selectedCountryName, setValue, watch, isFormInitialized, selectedCountry]);

  // Handle form submission
  const onSubmit = async (data: UpdateFormInputs) => {
    if (!user) {
      toast.error("Authentication error. Please log in again.");
      return;
    }
    
    // Determine which fields have changed to send minimal data
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
  
  // Display loading until user data is loaded and the form is initialized
  if (!isFormInitialized && !user) {
    return <div className="text-center p-8">Loading user data...</div>;
  }
  
  if (!user) {
      return <div className="text-center p-8 text-red-600">User data not available. Please log in.</div>;
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Update Sign-In Details
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Email - Read-only */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <div className="mt-1 p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 font-mono">
            {user.email}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Email cannot be changed via this form.
          </p>
        </div>

        {/* Password - Read-only */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="mt-1 p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 tracking-widest font-bold">
            ********
          </div>
          <p className="mt-1 text-xs text-gray-500">
            To change your password, please use the dedicated &#34;Change Password&#34; section.
          </p>
        </div>

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
          className="w-full flex items-center justify-center bg-green-600 text-white p-3 rounded-xl font-semibold hover:bg-green-700 transition duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              {/* Assuming you have a loading icon (like Loader2 from lucide-react) */}
              {/* If you use a spinner: <Loader2 className="mr-2 h-4 w-4 animate-spin" /> */}
              Updating...
            </>
          ) : (
            "Update Details"
          )}
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