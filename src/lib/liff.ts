/**
 * LIFF (Line Frontend Framework) Integration
 * This module handles Line login and user profile retrieval
 */

declare global {
  interface Window {
    liff: any;
  }
}

export interface LineUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

let liffInitialized = false;

/**
 * Initialize LIFF
 * Note: You need to set up LIFF ID in your Line Developers console
 */
export async function initializeLiff(liffId: string): Promise<void> {
  if (liffInitialized) return;

  try {
    // Load LIFF SDK
    if (!window.liff) {
      const script = document.createElement("script");
      script.src = "https://static.line-scdn.net/liff/edge/2/sdk.js";
      document.head.appendChild(script);

      // Wait for LIFF to load
      await new Promise((resolve) => {
        script.onload = resolve;
      });
    }

    // Initialize LIFF
    await window.liff.init({ liffId });
    liffInitialized = true;
  } catch (error) {
    console.error("Failed to initialize LIFF:", error);
    throw error;
  }
}

/**
 * Check if user is logged in to Line
 */
export function isLineLoggedIn(): boolean {
  if (!window.liff) return false;
  return window.liff.isLoggedIn();
}

/**
 * Get Line user profile
 */
export async function getLineUserProfile(): Promise<LineUserProfile | null> {
  if (!window.liff || !window.liff.isLoggedIn()) {
    return null;
  }

  try {
    const profile = await window.liff.getProfile();
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
    };
  } catch (error) {
    console.error("Failed to get Line user profile:", error);
    return null;
  }
}

/**
 * Login with Line
 */
export function loginWithLine(): void {
  if (window.liff && !window.liff.isLoggedIn()) {
    window.liff.login();
  }
}

/**
 * Logout from Line
 */
export function logoutFromLine(): void {
  if (window.liff && window.liff.isLoggedIn()) {
    window.liff.logout();
  }
}

/**
 * Get Line ID token for backend authentication
 */
export async function getLineIdToken(): Promise<string | null> {
  if (!window.liff || !window.liff.isLoggedIn()) {
    return null;
  }

  try {
    return window.liff.getIDToken();
  } catch (error) {
    console.error("Failed to get Line ID token:", error);
    return null;
  }
}
