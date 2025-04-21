import { type PropsWithChildren, useEffect, useState } from 'react';
import { type Auth, onAuthStateChanged, getAuth } from 'firebase/auth';

export type RequireLoginProps = PropsWithChildren<{
  auth?: Auth;
  loginComponent: React.ReactNode;
}>;

export function RequireLogin({ auth, loginComponent, children }: RequireLoginProps) {
  const authInstance = auth || getAuth();
  const [initialized, setInitialized] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    console.log('Initializing auth state listener');
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      if (user) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
      setInitialized(true);
    });
    return unsubscribe;
  }, [authInstance]);

  if (!initialized) {
    return null;
  }
  if (!loggedIn) {
    return loginComponent;
  }

  return children;
}
