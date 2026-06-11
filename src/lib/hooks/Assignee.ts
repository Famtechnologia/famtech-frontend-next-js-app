import { useAuth } from "./useAuth";

export const useAssignee = () => {
  const { token, user, setUser, loading, logout, fetchUser } = useAuth();

  return {
    fetchUser,
    user: user || {},
    setUser,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    logout,
  };
};
