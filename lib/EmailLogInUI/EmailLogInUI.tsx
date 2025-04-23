import { useCallback, useState } from 'react';
import {
  type Auth,
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { type FirebaseError } from 'firebase/app';

const containerStyle = {
  display: 'flex',
  'flex-direction': 'column',
  maxWidth: '35em',
  minWidth: '25em',
  backgroundColor: '#fff',
  color: '#000',
  padding: '1em',
};

const buttonContainerStyle = {
  display: 'flex',
  'flex-direction': 'row',
  justifyContent: 'start',
  marginBottom: '0.5em',
  width: '100%',
  gap: '0.5em',
};

const buttonStyle = {
  backgroundColor: '#4275a4',
  color: '#fff',
  borderRadius: '0.2em',
  padding: '0.2em 1em',
  border: 'none',
  cursor: 'pointer',
};

const disabledButtonStyle = {
  ...buttonStyle,
  opacity: 0.5,
  cursor: 'not-allowed',
};

const inputStyle = {
  border: '1px solid #ccc',
  borderRadius: '0.2em',
  padding: '0.5em',
  marginBottom: '0.5em',
  width: '100%',
};

const linkStyle = {
  color: '#4275a4',
  textDecoration: 'underline',
  cursor: 'pointer',
};

export type LogInUIProps = {
  auth?: Auth;
  onClose: () => void;
};

export function EmailLogInUI({ auth, onClose }: LogInUIProps) {
  const [loginState, setLoginState] = useState<'signin' | 'create' | 'forgot' | 'sent'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const authInstance = auth || getAuth();

  // Converts a FirebaseError to a relatively human-friendly string (the
  // err.message is not very human-friendly).
  const setFirebaseError = useCallback((error: FirebaseError) => {
    const suffix = error.code?.split('/').splice(-1)[0];
    if (!suffix) {
      setError(error.message);
      return;
    }
    setError(suffix.replace('-', ' '));
  }, []);

  const inner = () => {
    // if (loading) {
    //   return <div>Loading...</div>;
    // }
    const signinButtonDisabled = loading || !email || !password;
    const createButtonDisabled = loading || !email || !password || !confirmPassword;
    const forgotButtonDisabled = loading || !email;
    switch (loginState) {
      case 'signin':
        return (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setLoading(true);
              signInWithEmailAndPassword(authInstance, email, password)
                .catch((err: FirebaseError) => {
                  setFirebaseError(err);
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="Email"
              style={inputStyle}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="Password"
              style={inputStyle}
            />
            <div style={buttonContainerStyle}>
              <button
                type="submit"
                disabled={signinButtonDisabled}
                style={signinButtonDisabled ? disabledButtonStyle : buttonStyle}
              >
                Sign In
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                style={loading ? disabledButtonStyle : buttonStyle}
              >
                Cancel
              </button>
            </div>
            <p>
              Don&apos;t have an account?{' '}
              <span
                onClick={() => {
                  setLoginState('create');
                  setError(null);
                }}
                style={linkStyle}
              >
                Create one
              </span>
            </p>
            <p>
              <span
                onClick={() => {
                  setLoginState('forgot');
                  setError(null);
                }}
                style={linkStyle}
              >
                Forgot password?
              </span>
            </p>
          </form>
        );
      case 'create':
        return (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
              }
              setLoading(true);
              createUserWithEmailAndPassword(authInstance, email, password)
                .catch((err: FirebaseError) => {
                  setFirebaseError(err);
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
        >
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="Email"
              style={inputStyle}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="Password"
              style={inputStyle}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError(null);
              }}
              placeholder="Confirm Password"
              style={inputStyle}
            />
            <div style={buttonContainerStyle}>
              <button
                type="submit"
                disabled={createButtonDisabled}
                style={createButtonDisabled ? disabledButtonStyle : buttonStyle}
              >
                Create Account
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                style={loading ? disabledButtonStyle : buttonStyle}
              >
                Cancel
              </button>
            </div>
            <p>
              Have an account already?{' '}
              <span
                onClick={() => {
                  setLoginState('signin');
                  setError(null);
                }}
                style={linkStyle}
              >
                Sign in
              </span>
            </p>
          </form>
        );
      case 'forgot':
        return (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setLoading(true);
              sendPasswordResetEmail(authInstance, email)
                .then(() => {
                  setLoginState('sent');
                })
                .catch((err: FirebaseError) => {
                  setFirebaseError(err);
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="Email"
              style={inputStyle}
            />
            <div style={buttonContainerStyle}>
              <button
                type="submit"
                disabled={forgotButtonDisabled}
                style={forgotButtonDisabled ? disabledButtonStyle : buttonStyle}
              >
                Send Reset Email
              </button>
              <button
                onClick={() => setLoginState('signin')}
                disabled={loading}
                style={loading ? disabledButtonStyle : buttonStyle}
              >
                Back
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                style={loading ? disabledButtonStyle : buttonStyle}
              >
                Cancel
              </button>
            </div>
          </form>
        );
      case 'sent':
        return (
          <div>
            <p>
              A password reset email has been sent. If no email
              arrives, that probably means there is no account
              with that address (but check your spam folder).
            </p>
            <div style={buttonContainerStyle}>
              <button
                onClick={onClose}
                disabled={loading}
                style={loading ? disabledButtonStyle : buttonStyle}
              >
                Cancel
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      style={containerStyle}
      className="react-firebase-login-ui-container"
    >
      {inner()}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
    </div>
  );
}
