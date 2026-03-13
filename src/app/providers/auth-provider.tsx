import { createContext, useEffect, useState, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { authService } from "@/features/auth/services/auth.service";
import type { Models } from "appwrite";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  sessionExpired: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  loginWithGoogle: () => void;
  loginWithDiscord: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setSessionExpired(false);
      // Ensure profile + preferences docs exist (handles first-time OAuth users)
      if (currentUser) {
        authService.ensureUserDocs(currentUser.$id, currentUser.name).catch(() => {});
      }
    } catch {
      // Network/server error (not 401) — session may have expired
      if (user) {
        setUser(null);
        setSessionExpired(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Store checkAuth in a ref to avoid stale closures in the visibility listener
  const checkAuthRef = useRef(checkAuth);
  checkAuthRef.current = checkAuth;

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-check session when tab regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuthRef.current();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password);
    setSessionExpired(false);
    await checkAuth();
  };

  const signUp = async (email: string, password: string, name?: string) => {
    await authService.signUp(email, password, name);
    // signUp now auto-creates session + profile + preferences
    await checkAuth();
  };

  const loginWithGoogle = () => {
    authService.loginWithGoogle();
  };

  const loginWithDiscord = () => {
    authService.loginWithDiscord();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    window.location.href = "/auth/sign-in";
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, sessionExpired, signIn, signUp, loginWithGoogle, loginWithDiscord, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
