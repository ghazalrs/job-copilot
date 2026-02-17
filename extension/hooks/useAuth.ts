import { useState, useEffect } from 'react';
import type { User, AuthResponse } from '../types';
import { loginWithGoogleAccessToken } from '../lib/api-client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth from chrome.storage on mount
  useEffect(() => {
    chrome.storage.local.get(['auth_token', 'auth_user'], (result) => {
      if (result.auth_token && result.auth_user) {
        setToken(result.auth_token);
        setUser(JSON.parse(result.auth_user));
      }
      setIsLoading(false);
    });
  }, []);

  const login = async () => {
    try {
      // Get Google OAuth token using Chrome Identity API
      const googleAccessToken = await new Promise<string>((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (token) {
            resolve(token);
          } else {
            reject(new Error('No token received'));
          }
        });
      });

      // Exchange Google access token for our backend JWT
      const response: AuthResponse = await loginWithGoogleAccessToken(googleAccessToken);

      // Store in chrome.storage.local
      await chrome.storage.local.set({
        auth_token: response.token,
        auth_user: JSON.stringify(response.user),
      });

      // Update state
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    // Get current token to revoke it
    const googleToken = await new Promise<string | null>((resolve) => {
      chrome.identity.getAuthToken({ interactive: false }, (token) => {
        resolve(token || null);
      });
    });

    // Remove cached token from Chrome
    if (googleToken) {
      await new Promise<void>((resolve) => {
        chrome.identity.removeCachedAuthToken({ token: googleToken }, () => {
          resolve();
        });
      });
    }

    // Clear storage
    await chrome.storage.local.remove(['auth_token', 'auth_user']);

    // Clear state
    setToken(null);
    setUser(null);
  };

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
  };
}
