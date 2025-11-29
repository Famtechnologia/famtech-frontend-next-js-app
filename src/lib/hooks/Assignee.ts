import { useAuthStore } from "@/lib/store/authStore";

import { useEffect, useCallback, useState } from "react";
import { getStaffById, StaffType } from "../services/staff";

export const useAssignee = () => {
  const { token, loading, logout: storeLogout } = useAuthStore();
  const [user, setUser] = useState<StaffType>({});

  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      const userData = await getStaffById(token);
      setUser(userData);
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = () => {
    storeLogout();
  };

  return {
    fetchUser,
    user,
    setUser,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    logout,
  };
};
