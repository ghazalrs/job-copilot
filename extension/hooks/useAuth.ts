import { useState, useEffect } from 'react';
import type { User, AuthResponse } from '../types';
import { loginWithGoogle } from '../lib/api-client';

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

  const login = async (googleIdToken: string) => {
    try {
      const response: AuthResponse = await loginWithGoogle(googleIdToken);

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
