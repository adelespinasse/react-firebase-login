import { type PropsWithChildren, useCallback, useEffect, useState } from 'react';
import {
  type Auth,
  type User,
  onAuthStateChanged,
  onIdTokenChanged,
  getAuth,
  getIdToken,
  sendEmailVerification,
} from 'firebase/auth';
import { type FirebaseError } from 'firebase/app';

import { LogOutButton } from '../LogOutButton/LogOutButton';

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
    console.log('Sending verification email');
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
      setError((err as FirebaseError).message);
    } finally {
      setSending(false);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
      if (user) {
        console.log('Signed in as', user.email, user.uid);
        console.log('Last signed in:', user.metadata.lastSignInTime);
        setUser(user);
        if (requireVerification && !user.emailVerified) {
          console.log('Email not verified');
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
        console.log('Not signed in');
        setUser(null);
        setVerified(false);
      }
      setInitialized(true);
    });
    return unsubscribe;
  }, [authInstance, requireVerification, sendVerification]);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(authInstance, async (user) => {
      console.log('onIdTokenChanged', user);
    });
    return unsubscribe;
  }, [authInstance]);

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
          <a onClick={() => getIdToken(user, true)}>
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
