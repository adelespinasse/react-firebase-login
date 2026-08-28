// @aldel/react-firebase-login
// Copyright © 2025 Alan deLespinasse
// License: MIT
import { useCallback, useState } from 'react';
import {
  type Auth,
  type UserCredential,
  getAuth,
  linkWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  EmailAuthProvider,
} from 'firebase/auth';
import { type FirebaseError } from 'firebase/app';

import { containerStyle, formatFirebaseError } from '../shared';

const buttonContainerStyle = {
  display: 'flex',
  'flex-direction': 'row',
  justifyContent: 'start',
  marginBottom: '0.5em',
  width: '100%',
  gap: '0.5em',
};

const inputStyle = {
  padding: '0.5em',
  marginBottom: '0.5em',
  width: '100%',
};

/** The props for the {@link EmailLogInUI} component.
 * @expand
 */
export type LogInUIProps = {
  auth?: Auth;
  onClose?: () => void;
  handleUserCredential?: (credential: UserCredential) => Promise<void>;
  linking: boolean;
};

export function EmailLogInUI({ auth, onClose, handleUserCredential, linking }: LogInUIProps) {
  const authInstance = auth || getAuth();
  const [loginState, setLoginState] = useState<'signin' | 'create' | 'forgot' | 'sent'>(
    authInstance.currentUser ?  'create' : 'signin',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Converts a FirebaseError to a relatively human-friendly string (the
  // err.message is not very human-friendly).
  const setFirebaseError = useCallback((error: FirebaseError) => {
    setError(formatFirebaseError(error));
  }, []);

  const inner = () => {
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
              autoFocus
              key="email-input-signin"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="Email"
              style={inputStyle}
              disabled={loading}
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
              disabled={loading}
            />
            <div style={buttonContainerStyle}>
              <button
                type="submit"
                disabled={signinButtonDisabled}
              >
                Sign In
              </button>
              { onClose && (
                <button
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
            <p>
              Don&apos;t have an account?{' '}
              <a
                onClick={() => {
                  setLoginState('create');
                  setError(null);
                }}
              >
                Create one
              </a>
            </p>
            <p>
              <a
                onClick={() => {
                  setLoginState('forgot');
                  setError(null);
                }}
              >
                Forgot password?
              </a>
            </p>
          </form>
        );
      case 'create':
        return (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
              }
              setLoading(true);
              try {
                const userCredential = await (async () => {
                  if (authInstance.currentUser && linking) {
                    const credential = EmailAuthProvider.credential(email, password);
                    return linkWithCredential(authInstance.currentUser, credential);
                  }
                  return createUserWithEmailAndPassword(authInstance, email, password);
                })();
                if (handleUserCredential) {
                  await handleUserCredential(userCredential);
                }
              } catch (err) {
                setFirebaseError(err as FirebaseError);
              } finally {
                setLoading(false);
              }
            }}
          >
            <p>Create an account:</p>
            <input
              type="email"
              autoFocus
              key="email-input-create"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="Email"
              style={inputStyle}
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
            <div style={buttonContainerStyle}>
              <button
                type="submit"
                disabled={createButtonDisabled}
              >
                Create Account
              </button>
              { onClose && (
                <button
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
            <p>
              Have an account already?{' '}
              <a
                onClick={() => {
                  setLoginState('signin');
                  setError(null);
                }}
              >
                Sign in
              </a>
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
              autoFocus
              key="email-input-forgot"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="Email"
              style={inputStyle}
              disabled={loading}
            />
            <div style={buttonContainerStyle}>
              <button
                type="submit"
                disabled={forgotButtonDisabled}
              >
                Send Reset Email
              </button>
              <button
                onClick={() => setLoginState('signin')}
                disabled={loading}
              >
                Back
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
                onClick={() => setLoginState('signin')}
                disabled={loading}
              >
                Back
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
