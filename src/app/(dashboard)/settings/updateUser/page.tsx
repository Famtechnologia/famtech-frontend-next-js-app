"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useAuthStore, User } from "@/lib/store/authStore";
import { countries } from "@/lib/services/countries";

// --- Types ---
interface State {
  name: string;
  subdivision?: string[];
}

interface Country {
  name: string;
  states: State[];
}

interface UpdateFormInputs {
  country: string;
  state: string;
  lga?: string;
}

const updateUser = async (
  updateData: Partial<UpdateFormInputs>
): Promise<{ data: { user: User }; message: string }> => {
  console.log("Simulating API call to update user with:", updateData);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const currentUser = useAuthStore.getState().user;
  if (!currentUser) throw new Error("User not authenticated for update simulation.");

  const updatedUser: User = {
    ...currentUser,
    ...updateData,
    country: updateData.country || currentUser.country,
    state: updateData.state || currentUser.state,
    lga: updateData.lga || currentUser.lga || "",
  };

  return {
    data: { user: updatedUser },
    message: "Details updated successfully!",
  };
};

const countryList = countries as Country[];

export default function UpdateDetailsForm() {
  const { user, setUser } = useAuthStore();
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<UpdateFormInputs>({
    defaultValues: {
      country: user?.country?.toLowerCase() || "",
      state: user?.state?.toLowerCase() || "",
      lga: user?.lga?.toLowerCase() || "",
    },
    mode: "onBlur",
  });

  // 🧭 Watch values
  const selectedCountryName = watch("country");
  const selectedStateName = watch("state");

  const selectedCountry = countryList.find(
    (country) => country.name.toLowerCase() === selectedCountryName
  );

  const selectedStateObj = selectedCountry?.states.find(
    (state) => state.name.toLowerCase() === selectedStateName
  );

  const lgas = selectedStateObj?.subdivision || [];

  // 🧠 Initialize form when user data is loaded
  useEffect(() => {
    if (user && !isFormInitialized) {
      reset({
        country: user.country?.toLowerCase() || "",
        state: user.state?.toLowerCase() || "",
        lga: user.lga?.toLowerCase() || "",
      });
      setIsFormInitialized(true);
    }
    if (!user) {
      setIsFormInitialized(false);
    }
  }, [user, reset, isFormInitialized]);

  // 🧹 Clear state (and lga) if country changes to something else
  useEffect(() => {
    if (isFormInitialized && selectedCountryName) {
      const currentState = watch("state");
      const stateExists = selectedCountry?.states.some(
        (s) => s.name.toLowerCase() === currentState
      );
      if (!stateExists) {
        setValue("state", "", { shouldValidate: true, shouldDirty: true });
        setValue("lga", "", { shouldValidate: false, shouldDirty: true });
      }
    }
  }, [selectedCountryName, setValue, watch, isFormInitialized, selectedCountry]);

  // 🧹 Clear lga if state changes to a new one
  useEffect(() => {
    if (isFormInitialized) {
      const currentLga = watch("lga");
      const lgaExists = lgas.includes(currentLga || "");
      if (!lgaExists) {
        setValue("lga", "", { shouldValidate: false, shouldDirty: true });
      }
    }
  }, [selectedStateName, setValue, watch, lgas, isFormInitialized]);

  const onSubmit = async (data: UpdateFormInputs) => {
    if (!user) {
      toast.error("Authentication error. Please log in again.");
      return;
    }

    const dataToUpdate: Partial<UpdateFormInputs> = {};
    if (data.country?.toLowerCase() !== user.country?.toLowerCase()) {
      dataToUpdate.country = data.country;
    }
    if (data.state?.toLowerCase() !== user.state?.toLowerCase()) {
      dataToUpdate.state = data.state;
    }
    if ((data.lga || "")?.toLowerCase() !== (user.lga || "").toLowerCase()) {
      dataToUpdate.lga = data.lga;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      toast("No changes detected.", { icon: "ℹ️" });
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
        lga: responseUser.lga ?? data.lga,
      };

      setUser(updatedUser);

      reset({
        country: updatedUser.country?.toLowerCase() || "",
        state: updatedUser.state?.toLowerCase() || "",
        lga: updatedUser.lga?.toLowerCase() || "",
      });

      toast.success(message || "Your details have been successfully updated!");
    } catch (err: unknown) {
      console.error("Update failed:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Update failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  if (!isFormInitialized && !user) {
    return <div className="text-center p-8">Loading user data...</div>;
  }

  if (!user) {
    return <div className="text-center p-8 text-red-600">User data not available. Please log in.</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Update Sign-In Details
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email - Read-only */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
         <div className="mt-1 p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 
          truncate max-w-3xl md:max-w-full">
            {user.email}
          </div>
          <p className="mt-1 text-xs text-gray-500">Email cannot be changed via this form.</p>
        </div>

        {/* Password - Read-only */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="mt-1 p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 tracking-widest font-bold">
            ********
          </div>
          <p className="mt-1 text-xs text-gray-500">
            To change your password, please use the dedicated "Change Password" section.
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
              <option key={country.name} value={country.name?.toLowerCase()}>
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
              <option key={state.name} value={state.name.toLowerCase()}>
                {state.name}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="mt-1 text-red-600 text-sm">{errors.state.message}</p>
          )}
        </div>

        {/* LGA - Optional */}
        {selectedCountryName === "nigeria" && lgas.length > 0 && (
          <div>
            <label htmlFor="lga" className="block text-sm font-medium text-gray-700">
              LGA (Optional)
            </label>
            <select
              id="lga"
              {...register("lga")}
              className="mt-1 w-full p-3 border-gray-300 border rounded-xl focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
              disabled={!selectedStateName}
            >
              <option value="">Select LGA (Optional)</option>
              {lgas.map((lga, index) => (
                <option key={index} value={lga.toLowerCase()}>
                  {lga}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="w-full flex items-center justify-center bg-green-600 text-white p-3 rounded-xl font-semibold hover:bg-green-700 transition duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Updating..." : "Update Details"}
        </button>

        
      </form>
    </div>
  );
}
