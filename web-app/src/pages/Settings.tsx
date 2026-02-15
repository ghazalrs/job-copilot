import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getMasterResume, updateMasterResume, deleteMasterResume } from '../api/client';
import type { Resume } from '../types';

export default function Settings() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isLoading, logout } = useAuth();

  const [resume, setResume] = useState<Resume | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [isLoadingResume, setIsLoadingResume] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Load resume on mount
  useEffect(() => {
    if (token && isAuthenticated) {
      loadResume();
    }
  }, [token, isAuthenticated]);

  const loadResume = async () => {
    if (!token) return;

    setIsLoadingResume(true);
    try {
      const data = await getMasterResume(token);
      setResume(data);
      setResumeText(data.raw_text);
      setHasChanges(false);
    } catch (error) {
      // 404 is expected if no resume exists yet
      if (error instanceof Error && !error.message.includes('404')) {
        console.error('Error loading resume:', error);
      }
      setResume(null);
      setResumeText('');
    } finally {
      setIsLoadingResume(false);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumeText(e.target.value);
    setHasChanges(true);
    setMessage(null);
  };

  const handleSaveResume = async () => {
    if (!token) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const updatedResume = await updateMasterResume(token, resumeText);
      setResume(updatedResume);
      setHasChanges(false);
      setMessage({ type: 'success', text: 'Resume saved successfully!' });
    } catch (error) {
      console.error('Error saving resume:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save resume'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!token || !resume) return;

    const confirmed = window.confirm('Are you sure you want to delete your resume? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await deleteMasterResume(token);
      setResume(null);
      setResumeText('');
      setHasChanges(false);
      setMessage({ type: 'success', text: 'Resume deleted successfully' });
    } catch (error) {
      console.error('Error deleting resume:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete resume'
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading || isLoadingResume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Job Copilot Settings</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Status Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Resume Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Master Resume</h2>
            <p className="mt-1 text-sm text-gray-600">
              This is your master resume. You can edit it here and it will be used for tailoring.
            </p>
          </div>

          <div className="px-6 py-4">
            <div className="mb-4">
              <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
                Resume Text
              </label>
              <textarea
                id="resume"
                rows={20}
                value={resumeText}
                onChange={handleResumeChange}
                placeholder="Paste your resume text here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
              <p className="mt-2 text-xs text-gray-500">
                Character count: {resumeText.length}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveResume}
                disabled={!hasChanges || isSaving}
                className={`px-4 py-2 rounded-md font-medium ${
                  hasChanges && !isSaving
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Resume'}
              </button>

              {resume && (
                <button
                  onClick={handleDeleteResume}
                  className="px-4 py-2 border border-red-600 text-red-600 rounded-md font-medium hover:bg-red-50"
                >
                  Delete Resume
                </button>
              )}
            </div>

            {resume && (
              <div className="mt-4 text-sm text-gray-600">
                Last updated: {new Date(resume.updated_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Templates Section (Future) */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Templates</h2>
            <p className="mt-1 text-sm text-gray-600">
              Resume and cover letter templates (coming soon)
            </p>
          </div>

          <div className="px-6 py-4">
            <p className="text-gray-500 italic">
              Default templates will be provided. You'll be able to customize them in a future update.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
