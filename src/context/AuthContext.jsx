/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

const AuthContext = createContext(null);

const storageKeys = {
  token: "revastra_auth_token",
  user: "revastra_auth_user",
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(storageKeys.token));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem(storageKeys.user);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(token));

  const clearAuthState = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem(storageKeys.token, token);
    } else {
      localStorage.removeItem(storageKeys.token);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(storageKeys.user, JSON.stringify(user));
    } else {
      localStorage.removeItem(storageKeys.user);
    }
  }, [user]);

  const authFetch = useCallback(
    async (path, options = {}) => {
      const headers = {
        ...(options.headers || {}),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      return fetch(`${apiBaseUrl}${path}`, {
        ...options,
        headers,
      });
    },
    [token]
  );

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      if (!token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Session expired");
        }

        if (isMounted) {
          setUser(result.data);
        }
      } catch {
        if (isMounted) {
          clearAuthState();
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, [clearAuthState, token]);

  const login = useCallback(
    async ({ email, password, role }) => {
      setIsLoading(true);

      try {
        const response = await fetch(`${apiBaseUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, role }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Login failed");
        }

        setToken(result.data.token);
        setUser(result.data.user);
        setIsBootstrapping(false);

        return result.data.user;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async ({ name, email, password }) => {
      setIsLoading(true);

      try {
        const response = await fetch(`${apiBaseUrl}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Registration failed");
        }

        setToken(result.data.token);
        setUser(result.data.user);
        setIsBootstrapping(false);

        return result.data.user;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearAuthState();
    setIsBootstrapping(false);
  }, [clearAuthState]);

  const syncUser = useCallback((nextUser) => {
    setUser(nextUser || null);
  }, []);

  const value = useMemo(
    () => ({
      authFetch,
      isAuthenticated: Boolean(token && user),
      isBootstrapping,
      isLoading,
      login,
      logout,
      register,
      syncUser,
      token,
      user,
    }),
    [authFetch, isBootstrapping, isLoading, login, logout, register, syncUser, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
