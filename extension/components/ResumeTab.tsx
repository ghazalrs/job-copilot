import type { Resume } from '../types';

interface ResumeTabProps {
  resume: Resume | null;
  resumeText: string;
  setResumeText: (text: string) => void;
  isLoading: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  error: string | null;
  successMessage: string | null;
  saveResume: () => Promise<void>;
  deleteResume: () => Promise<void>;
}

export function ResumeTab({
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
}: ResumeTabProps) {
  if (isLoading) {
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <p>Loading resume...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <h3 style={{ margin: 0, fontSize: 16 }}>Master Resume</h3>

      {error && (
        <div style={{
          padding: 12,
          backgroundColor: '#fef2f2',
          color: '#ef4444',
          borderRadius: 6,
          fontSize: 14
        }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div style={{
          padding: 12,
          backgroundColor: '#f0fdf4',
          color: '#16a34a',
          borderRadius: 6,
          fontSize: 14
        }}>
          {successMessage}
        </div>
      )}

      <textarea
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        placeholder="Paste your resume here..."
        disabled={isSaving}
        style={{
          width: '100%',
          minHeight: 300,
          padding: 12,
          fontSize: 14,
          fontFamily: 'monospace',
          borderRadius: 6,
          border: '1px solid #d1d5db',
          resize: 'vertical',
        }}
      />

      <div style={{ fontSize: 12, color: '#6b7280' }}>
        {resumeText.length} characters
        {resume && ` • Last updated: ${new Date(resume.updated_at).toLocaleDateString()}`}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={saveResume}
          disabled={!hasChanges || isSaving}
          style={{
            flex: 1,
            padding: '10px 16px',
            backgroundColor: hasChanges ? '#3b82f6' : '#d1d5db',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: hasChanges && !isSaving ? 'pointer' : 'not-allowed',
            fontSize: 14,
            fontWeight: 'bold',
          }}>
          {isSaving ? 'Saving...' : 'Save Resume'}
        </button>

        {resume && (
          <button
            onClick={deleteResume}
            disabled={isSaving}
            style={{
              padding: '10px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontSize: 14,
            }}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
