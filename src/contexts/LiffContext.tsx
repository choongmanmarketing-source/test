import React, { createContext, useContext, useEffect, useState } from "react";
import {
  initializeLiff,
  isLineLoggedIn,
  getLineUserProfile,
  getLineIdToken,
  LineUserProfile,
} from "@/lib/liff";
import { trpc } from "@/lib/trpc";

interface LiffContextType {
  isLineLoggedInStatus: boolean;
  lineProfile: LineUserProfile | null;
  isLoading: boolean;
  error: string | null;
  refreshLoginStatus: () => Promise<void>;
}

const LiffContext = createContext<LiffContextType | undefined>(undefined);

export function LiffProvider({ children }: { children: React.ReactNode }) {
  const [isLineLoggedInStatus, setIsLineLoggedIn] = useState(false);
  const [lineProfile, setLineProfile] = useState<LineUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshLoginStatus = async () => {
    try {
      // Check if user is logged in
      const loggedIn = isLineLoggedIn();
      setIsLineLoggedIn(loggedIn);

      if (loggedIn) {
        const profile = await getLineUserProfile();
        setLineProfile(profile);
        
        // Establish backend session using LINE ID token
        try {
          const idToken = await getLineIdToken();
          if (idToken) {
            // Call backend to create session using fetch to avoid React hook issues
            const response = await fetch("/api/trpc/auth.lineLogin", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken }),
              credentials: "include",
            });
            if (!response.ok) {
              throw new Error(`Backend session failed: ${response.statusText}`);
            }
          }
        } catch (err) {
          console.error("Failed to establish backend session:", err);
        }
      } else {
        setLineProfile(null);
      }
    } catch (err) {
      console.error("Failed to refresh login status:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh login status");
    }
  };

  useEffect(() => {
    const initLiff = async () => {
      try {
        // Get LIFF ID from environment or meta tag
        const liffId =
          import.meta.env.VITE_LINE_LIFF_ID ||
          document.querySelector('meta[name="line-liff-id"]')?.getAttribute("content");

        if (!liffId) {
          console.warn("LIFF ID not configured");
          setIsLoading(false);
          return;
        }

        await initializeLiff(liffId);

        // Check if user is logged in
        const loggedIn = isLineLoggedIn();
        setIsLineLoggedIn(loggedIn);

        if (loggedIn) {
          const profile = await getLineUserProfile();
          setLineProfile(profile);
          
          // Establish backend session using LINE ID token
          try {
            const idToken = await getLineIdToken();
            if (idToken) {
              // Call backend to create session using fetch to avoid React hook issues
              const response = await fetch("/api/trpc/auth.lineLogin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
                credentials: "include",
              });
              if (!response.ok) {
                throw new Error(`Backend session failed: ${response.statusText}`);
              }
            }
          } catch (err) {
            console.error("Failed to establish backend session:", err);
          }
        }
      } catch (err) {
        console.error("Failed to initialize LIFF:", err);
        setError(err instanceof Error ? err.message : "Failed to initialize LIFF");
      } finally {
        setIsLoading(false);
      }
    };

    initLiff();
  }, []);

  // Listen for visibility changes to refresh login status when app comes to foreground
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // App came to foreground, refresh login status
        refreshLoginStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <LiffContext.Provider
      value={{
        isLineLoggedInStatus,
        lineProfile,
        isLoading,
        error,
        refreshLoginStatus,
      }}
    >
      {children}
    </LiffContext.Provider>
  );
}

export function useLiff() {
  const context = useContext(LiffContext);
  if (context === undefined) {
    throw new Error("useLiff must be used within LiffProvider");
  }
  return context;
}
