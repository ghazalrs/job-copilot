import { useState, useEffect } from 'react';
import type { Resume } from '../types';
import { getMasterResume, updateMasterResume, deleteMasterResume } from '../lib/api-client';

export function useResume(token: string | null) {
  const [resume, setResume] = useState<Resume | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load resume on mount or when token changes
  useEffect(() => {
    if (token) {
      loadResume();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  // Track changes
  useEffect(() => {
    if (resume) {
      // If resume exists, check if text changed
      setHasChanges(resumeText !== resume.raw_text);
    } else {
      // If no resume exists, enable save if there's any text
      setHasChanges(resumeText.trim().length > 0);
    }
  }, [resumeText, resume]);

  const loadResume = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getMasterResume(token);
      setResume(data);
      setResumeText(data.raw_text);
    } catch (err) {
      // If 404, user has no resume yet (not an error)
      if (err instanceof Error && err.message.includes('404')) {
        setResume(null);
        setResumeText('');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load resume');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveResume = async () => {
    if (!token) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await updateMasterResume(token, resumeText);
      setResume(updated);
      setHasChanges(false);
      setSuccessMessage('Resume saved successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save resume');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteResume = async () => {
    if (!token) return;

    if (!window.confirm('Are you sure you want to delete your resume? This cannot be undone.')) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await deleteMasterResume(token);
      setResume(null);
      setResumeText('');
      setSuccessMessage('Resume deleted successfully!');

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resume');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    resume,
    resumeText,
    setResumeText,
    isLoading,
    isSaving,
    hasChanges,
    error,
    successMessage,
    saveResume,
    deleteResume,
  };
}
