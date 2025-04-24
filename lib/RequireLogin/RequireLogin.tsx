import { type PropsWithChildren, useCallback, useEffect, useState } from 'react';
import {
  type Auth,
  type User,
  onAuthStateChanged,
  onIdTokenChanged,
  getAuth,
  reload,
  sendEmailVerification,
} from 'firebase/auth';
import { type FirebaseError } from 'firebase/app';

import { LogOutButton } from '../LogOutButton/LogOutButton';
import { formatFirebaseError } from '../shared';

export type RequireLoginProps = PropsWithChildren<{
  auth?: Auth;
  loginComponent: React.ReactNode;
  requireVerification?: boolean;
}>;

export function RequireLogin({
  auth,
  loginComponent,
  requireVerification = false,
  children,
}: RequireLoginProps) {
  const authInstance = auth || getAuth();
  const [initialized, setInitialized] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const sendVerification = useCallback(async () => {
    if (!user) {
      setError('Something is broken');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await sendEmailVerification(user);
    } catch(err) {
      console.error('Error sending verification email:', err);
      setError(formatFirebaseError(err as FirebaseError));
    } finally {
      setSending(false);
    }
  }, [user]);

  const authStateHandler = useCallback(async (user: User | null) => {
    if (user) {
      // console.log('Signed in as', user.email, user.uid);
      setUser(user);
      if (requireVerification && !user.emailVerified) {
        // Janky way to find out from EmailLogInUI component that this is a new user
        const storageKey = `react-firebase-login-newuser-${user.uid}`;
        const isNew = window.localStorage.getItem(storageKey);
        if (isNew) {
          window.localStorage.removeItem(storageKey);
          await sendVerification();
        }
      } else {
        setVerified(true);
      }
    } else {
      setUser(null);
      setVerified(false);
    }
    setInitialized(true);
  }, [requireVerification, sendVerification]);

  useEffect(
    () => onAuthStateChanged(authInstance, authStateHandler),
    [authInstance, authStateHandler],
  );

  // onAuthStateChanged isn't triggered by token refreshes, so handle those too.
  useEffect(
    () => onIdTokenChanged(authInstance, authStateHandler),
    [authInstance, authStateHandler],
  );

  if (!initialized) {
    return null;
  }
  if (!user) {
    return loginComponent;
  }
  if (sending) {
    return (
      <div className="react-firebase-login-verification-container">
        <h2>Sending verification email...</h2>
      </div>
    );
  }
  if (!verified) {
    return (
      <div className="react-firebase-login-verification-container">
        <p>
          A verification link has been sent to {user.email}. Click the provided link,
          then{' '}
          <a onClick={() => reload(user)}>
            click here.
          </a>
        </p>
        <button
          onClick={sendVerification}
        >
          Resend email
        </button>
        <LogOutButton />
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      </div>
    );
  }

  return children;
}
