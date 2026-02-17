import type {
  AuthResponse,
  GoogleAuthRequest,
  Resume,
  ResumeCreate,
  ApiError,
} from '../types';

const API_URL = process.env.PLASMO_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Helper function to handle API responses
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: 'An unexpected error occurred',
    }));
    throw new Error(error.detail);
  }
  return response.json();
}

/**
 * Helper function to get auth headers
 */
function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Authenticate with Google ID token (for web app)
 */
export async function loginWithGoogle(
  idToken: string
): Promise<AuthResponse> {
  const payload: GoogleAuthRequest = { id_token: idToken };

  const response = await fetch(`${API_URL}/auth/google`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse<AuthResponse>(response);
}

/**
 * Authenticate with Google access token (for Chrome extension)
 */
export async function loginWithGoogleAccessToken(
  accessToken: string
): Promise<AuthResponse> {
  const payload = { access_token: accessToken };

  const response = await fetch(`${API_URL}/auth/google/access-token`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse<AuthResponse>(response);
}

/**
 * Get user's master resume
 */
export async function getMasterResume(token: string): Promise<Resume> {
  const response = await fetch(`${API_URL}/resume/master`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  return handleResponse<Resume>(response);
}

/**
 * Create or update master resume
 */
export async function updateMasterResume(
  token: string,
  resumeText: string
): Promise<Resume> {
  const payload: ResumeCreate = { raw_text: resumeText };

  const response = await fetch(`${API_URL}/resume/master`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  return handleResponse<Resume>(response);
}

/**
 * Delete master resume
 */
export async function deleteMasterResume(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/resume/master`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: 'An unexpected error occurred',
    }));
    throw new Error(error.detail);
  }
}
