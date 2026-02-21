// User types
export interface User {
  id: string;
  google_sub: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Auth types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface GoogleAuthRequest {
  id_token: string;
}

// Resume types
export interface Resume {
  id: string;
  user_id: string;
  raw_text: string;
  created_at: string;
  updated_at: string;
}

export interface ResumeCreate {
  raw_text: string;
}

// Template types (for future use)
export interface Template {
  id: string;
  user_id: string;
  type: 'resume' | 'cover_letter';
  content: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateCreate {
  type: 'resume' | 'cover_letter';
  content: string;
}

export interface TemplateResponse {
  template_type: string;
  content: string;
}

// API Error type
export interface ApiError {
  detail: string;
}
