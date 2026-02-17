import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';

interface SignInViewProps {
  onSignIn: (googleIdToken: string) => Promise<void>;
}

export function SignInView({ onSignIn }: SignInViewProps) {
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      await onSignIn(credentialResponse.credential);
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to login. Please try again.');
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
    alert('Failed to login with Google. Please try again.');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      padding: 32
    }}>
      <h2 style={{ margin: 0, fontSize: 20 }}>Welcome to Job Copilot</h2>
      <p style={{ margin: 0, fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
        Sign in with Google to upload your resume and get started
      </p>

      <div style={{ marginTop: 16 }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          theme="outline"
          size="large"
          text="signin_with"
        />
      </div>
    </div>
  );
}
