import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  type Auth,
  type User,
  onAuthStateChanged,
  onIdTokenChanged,
  getAuth,
  reload,
  sendEmailVerification,
  signInAnonymously,
  type IdTokenResult,
} from 'firebase/auth';
import { type FirebaseError } from 'firebase/app';

import { LogOutButton } from '../LogOutButton/LogOutButton';
import { formatFirebaseError, isNewUser } from '../shared';

export type UserContextType = {
  user: User,
  claims: Record<string, unknown>,
  linkProvider: () => void,
};

const UserContext = createContext<UserContextType | null>(null);

// Props for any component that behaves like RequireLogin, in that it requires
// authentication to show its children and shows something else if not
// authenticated.
export type LoginProps = PropsWithChildren<{
  auth?: Auth;
  requireVerification?: boolean;
  allowAnonymous?: boolean;
}>;

export type RequireLoginProps = LoginProps & {
  loginComponent: React.ReactNode;
};

export function RequireLogin({
  auth,
  requireVerification = false,
  allowAnonymous = false,
  loginComponent,
  children,
}: RequireLoginProps) {
  const authInstance = auth || getAuth();
  const [initialized, setInitialized] = useState(false);
  // This `verified` really means "verified OR anonymous user OR verification is not required"
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [tokenResult, setTokenResult] = useState<IdTokenResult | null>(null);
  const [linking, setLinking] = useState(false);

  const linkProvider = useCallback(() => {
    if (!user) {
      setError('Something is broken');
      return;
    }
    setLinking(true);
  }, [user]);

  const cancelLinking = useCallback(() => {
    setLinking(false);
  }, []);

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
      // console.log('Signed in as', user);
      if (!user.isAnonymous) {
        setUser(user);
        if (requireVerification && !user.emailVerified) {
          if (isNewUser(user)) {
            await sendVerification();
          }
        } else {
          setVerified(true);
        }
        setInitialized(true);
      } else {
        if (allowAnonymous) {
          setUser(user);
          setVerified(true);
          setInitialized(true);
        } else {
          setUser(null);
          setVerified(false);
          setInitialized(true);
        }
      }
    } else {
      if (allowAnonymous) {
        signInAnonymously(authInstance);
      } else {
        setUser(null);
        setVerified(false);
        setInitialized(true);
      }
    }
  }, [allowAnonymous, authInstance, requireVerification, sendVerification]);

  useEffect(
    () => onAuthStateChanged(authInstance, authStateHandler),
    [authInstance, authStateHandler],
  );

  // onAuthStateChanged isn't triggered by token refreshes, so handle those too.
  useEffect(
    () => onIdTokenChanged(authInstance, authStateHandler),
    [authInstance, authStateHandler],
  );

  useEffect(() => {
    if (!user) {
      return;
    }
    const fetchTokenResult = async () => {
      try {
        const result = await user.getIdTokenResult();
        setTokenResult(result);
      } catch (error) {
        console.error('Error fetching ID token result:', error);
        setTokenResult(null);
      }
    };

    fetchTokenResult();
  }, [user]);

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
  if (linking) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        { loginComponent }
        <button
          className="react-firebase-login-cancel-linking-button"
          style={{ position: 'absolute', top: 0, right: 0, zIndex: 1000 }}
          onClick={cancelLinking}
        >
          🗙
        </button>
      </div>
    );
  }
  if (!tokenResult) {
    return null;
  }
  const claims = tokenResult.claims;

  return (
    <UserContext.Provider value={{ user, claims, linkProvider }}>
      {children}
    </UserContext.Provider>
  );
}

// Throws an error if used outside of a RequireLogin component (or a component
// that uses RequireLogin, like LogInPage or SimpleLogInPage).
export function useUser(): UserContextType {
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error('useUser must be used within a RequireLogin component');
  }
  return userContext;
}
