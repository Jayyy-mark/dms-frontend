import { createContext, useContext, useState, useEffect } from "react";
import api from "../helpers/api";

type User = {
  id: number;
  user_id: string;
  username: string;
  email: string;
  role: string;
  staff_id: number;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  loading: boolean; // ✅ add this
};
const AuthContext = createContext<AuthContextType>(null!);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    await api.post("auth/logout/");
    setUser(null);
  };

  const fetchCurrentUser = async () => {
    try {
      const { data } = await api.get("auth/user/");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}