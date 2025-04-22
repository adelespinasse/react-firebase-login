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
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      if (user) {
        console.log('Signed in as', user.email);
        setLoggedIn(true);
      } else {
        console.log('Not signed in');
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
