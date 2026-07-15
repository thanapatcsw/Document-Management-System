"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  api,
  clearAccessToken,
  getStoredAccessToken,
  persistAccessToken,
} from "@/lib";

type AuthUser = {
  id: string;
  full_name: string;
  username: string;
  role: string;
  department: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PUBLIC_ROUTES = ["/auth/login", "/auth"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    persistAccessToken(token);
    api
      .get<AuthUser>("/api/auth/me")
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        clearAccessToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;

    const isPublic = PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );
    const hasToken = Boolean(getStoredAccessToken());

    if (!user && !isPublic && !hasToken) {
      router.replace("/auth/login");
      return;
    }

    if (user && pathname.startsWith("/auth")) {
      router.replace("/dashboard");
    }
  }, [user, loading, pathname, router]);

  const login = async (username: string, password: string) => {
    const response = await api.post<{ access_token: string; user: AuthUser }>(
      "/api/auth/login",
      { username: username.trim(), password }
    );
    const { access_token, user: profile } = response.data;

    persistAccessToken(access_token);
    await Promise.resolve();
    setUser(profile);

    return profile;
  };

  const logout = () => {
    clearAccessToken();
    setUser(null);
    router.replace("/auth/login");
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
