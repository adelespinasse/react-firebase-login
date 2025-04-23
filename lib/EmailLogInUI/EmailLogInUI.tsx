import { useCallback, useState } from 'react';
import {
  type Auth,
  type AuthProvider,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { type FirebaseError } from 'firebase/app';
import { GoogleLoginButton, createButton } from 'react-social-login-buttons';

const EmailLoginButton = createButton({
  text: 'Sign in with Email',
  icon: () => '📧',
  style: {
    backgroundColor: '#fff',
    color: '#000',
  },
});

const containerStyle = {
  display: 'flex',
  'flex-direction': 'column',
  maxWidth: '20em',
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
  methods?: LogInMethod[];
  popup?: boolean;
};

export function EmailLogInUI({ auth, methods, popup }: LogInUIProps) {
  const [emailState, setEmailState] = useState<'none' | 'signin' | 'create'>('none');
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

  const signIn = useCallback(
    async (provider: AuthProvider) => {
      try {
        if (popup) {
          await signInWithPopup(authInstance, provider);
        } else {
          await signInWithRedirect(authInstance, provider);
        }
      } catch (err) {
        setFirebaseError(err as FirebaseError);
      } finally {
        setLoading(false);
      }
    },
    [authInstance, popup, setFirebaseError],
  );

  const methodMap = {
    google: (
      <GoogleLoginButton
        onClick={() => signIn(new GoogleAuthProvider())}
        key="google"
      >
        Sign in with Google
      </GoogleLoginButton>
    ),
    email: (
      <EmailLoginButton
        onClick={() => setEmailState('signin')}
        key="email"
      />
    ),
  };

  const inner = () => {
    // if (loading) {
    //   return <div>Loading...</div>;
    // }
    const signinButtonDisabled = loading || !email || !password;
    const createButtonDisabled = loading || !email || !password || !confirmPassword;
    switch (emailState) {
      case 'none':
        return (methods || ['google']).map((method) => methodMap[method]);
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
                onClick={() => {
                  setEmailState('none');
                  setError(null);
                }}
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
                  setEmailState('create');
                  setError(null);
                }}
                style={linkStyle}
              >
                Create one
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
                onClick={() => {
                  setEmailState('none');
                  setError(null);
                }}
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
                  setEmailState('signin');
                  setError(null);
                }}
                style={linkStyle}
              >
                Sign in
              </span>
            </p>
          </form>
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
