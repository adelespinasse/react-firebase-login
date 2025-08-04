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
  FacebookAuthProvider,
  getRedirectResult,
  GithubAuthProvider,
  GoogleAuthProvider,
  linkWithPopup,
  linkWithRedirect,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  TwitterAuthProvider,
  type AuthProvider,
  getAdditionalUserInfo,
  type UserCredential,
} from 'firebase/auth';
import { type FirebaseError } from 'firebase/app';
import {
  AppleLoginButton,
  createButton,
  FacebookLoginButton,
  GithubLoginButton,
  GoogleLoginButton,
  MicrosoftLoginButton,
  XLoginButton,
  YahooLoginButton,
} from 'react-social-login-buttons';

import { EmailLogInUI } from '../EmailLogInUI';
import { LogOutButton } from '../LogOutButton/LogOutButton';
import { containerStyle, formatFirebaseError } from '../shared';
import { type FrameComponent, NoFrame } from '../frames';

export type UserContextType = {
  user: User,
  claims: Record<string, unknown>,
  signInAndLink: () => void,
};

const UserContext = createContext<UserContextType | null>(null);

export type LogInMethod = 'apple' | 'facebook' | 'github' | 'google'
  | 'microsoft' | 'twitter' | 'yahoo' | 'email';

export type LoginUIProps = PropsWithChildren<{
  auth?: Auth;
  requireVerification?: boolean;
  allowAnonymous?: boolean;
  methods?: LogInMethod[];
  popup?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  frame?: FrameComponent;
}>;

const EmailLoginButton = createButton({
  text: 'Sign in with Email',
  icon: () => '📧',
  style: {
    backgroundColor: '#fff',
    color: '#000',
  },
});

export function LoginUI({
  auth,
  requireVerification = false,
  allowAnonymous = false,
  methods,
  popup,
  header = null,
  footer = null,
  frame = NoFrame,
  children,
}: LoginUIProps) {
  const authInstance = auth || getAuth();
  const [initialized, setInitialized] = useState(false);
  // This `verified` really means "verified OR anonymous user OR verification is not required"
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [tokenResult, setTokenResult] = useState<IdTokenResult | null>(null);
  const [linking, setLinking] = useState(false);
  const [page, setPage] = useState<'home' | 'email'>('home');
  const [loading, setLoading] = useState(false);

  const signInAndLink = useCallback(() => {
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

  const handleUserCredential = useCallback(async (credential: UserCredential) => {
    setLinking(false);
    if (requireVerification) {
      const additionalInfo = getAdditionalUserInfo(credential);
      if (additionalInfo?.isNewUser && !credential.user.emailVerified) {
        await sendVerification();
      }
    }
  }, [requireVerification, sendVerification]);

  const authStateHandler = useCallback(async (user: User | null) => {
    if (user) {
      // console.log('Signed in as', user);
      if (!user.isAnonymous) {
        setUser(user);
        if (requireVerification && !user.emailVerified) {
          // Verification will be handled during sign-in flow for new users
          setVerified(false);
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
  }, [allowAnonymous, authInstance, requireVerification]);

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

  // Converts a FirebaseError to a relatively human-friendly string (the
  // err.message is not very human-friendly).
  const setFirebaseError = useCallback((error: FirebaseError) => {
    setError(formatFirebaseError(error));
  }, []);

  useEffect(() => {
    const go = async () => {
      try {
        const result = await getRedirectResult(authInstance);
        if (result) {
          await handleUserCredential(result);
        }
      } catch (err) {
        setFirebaseError(err as FirebaseError);
      }
    };
    go();
  }, [authInstance, setFirebaseError, handleUserCredential]);

  const signIn = useCallback(
    async (provider: AuthProvider) => {
      setLoading(true);
      try {
        if (popup) {
          const getCredential = () => {
            if (user) {
              // User is already authenticated (possibly anonymously), so we want
              // to link a new provider to the user account. Most commonly this
              // means upgrading an anonymous account to a named account.
              return linkWithPopup(user, provider);
            }
            return signInWithPopup(authInstance, provider);
          };
          const credential = await getCredential();
          await handleUserCredential(credential);
        } else {
          if (user) {
            // User is already authenticated, etc.
            linkWithRedirect(user, provider);
          } else {
            signInWithRedirect(authInstance, provider);
          }
        }
      } catch (err) {
        setFirebaseError(err as FirebaseError);
      } finally {
        setLoading(false);
      }
    },
    [authInstance, popup, setFirebaseError, user, handleUserCredential],
  );

  const methodMap = {
    apple: (
      <AppleLoginButton
        onClick={() => signIn(new OAuthProvider('apple.com'))}
        disabled={loading}
        key="apple"
      >
        Sign in with Apple
      </AppleLoginButton>
    ),
    facebook: (
      <FacebookLoginButton
        onClick={() => signIn(new FacebookAuthProvider())}
        disabled={loading}
        key="facebook"
      >
        Sign in with Facebook
      </FacebookLoginButton>
    ),
    github: (
      <GithubLoginButton
        onClick={() => signIn(new GithubAuthProvider())}
        disabled={loading}
        key="github"
      >
        Sign in with GitHub
      </GithubLoginButton>
    ),
    google: (
      <GoogleLoginButton
        onClick={() => signIn(new GoogleAuthProvider())}
        disabled={loading}
        key="google"
      >
        Sign in with Google
      </GoogleLoginButton>
    ),
    microsoft: (
      <MicrosoftLoginButton
        onClick={() => signIn(new OAuthProvider('microsoft.com'))}
        disabled={loading}
        key="microsoft"
      >
        Sign in with Microsoft
      </MicrosoftLoginButton>
    ),
    twitter : (
      <XLoginButton
        onClick={() => signIn(new TwitterAuthProvider())}
        disabled={loading}
        key="twitter"
      >
        Sign in with X
      </XLoginButton>
    ),
    yahoo: (
      <YahooLoginButton
        onClick={() => signIn(new OAuthProvider('yahoo.com'))}
        disabled={loading}
        key="yahoo"
      >
        Sign in with Yahoo
      </YahooLoginButton>
    ),
    email: (
      <EmailLoginButton
        onClick={() => setPage('email')}
        disabled={loading}
        key="email"
      />
    ),
  };

  const renderLoginContent = () => {
    if (page === 'email') {
      return <EmailLogInUI
        auth={authInstance}
        onClose={() => setPage('home')}
        handleUserCredential={handleUserCredential}
      />;
    }

    return (
      <div
        style={containerStyle}
        className="react-firebase-login-ui-container"
      >
        {(methods || ['google']).map((method) => methodMap[method])}
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      </div>
    );
  };

  const wrapped = (children: React.ReactNode) => {
    return frame(
      <div
        className="react-firebase-login-container"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {header}
        { linking && (
          <button
            className="react-firebase-login-cancel-linking-button"
            style={{
              position: 'absolute',
              top: 0, right: 0, zIndex: 1000,
              border: 'none',
              backgroundColor: 'transparent', color: '#447',
              margin: 0, padding: 2,
            }}
            onClick={cancelLinking}
          >
            🗙
          </button>
        )}
        {children}
        {footer}
      </div>
    );
  };

  if (!initialized) {
    return wrapped(null);
  }

  if (!user) {
    return wrapped(renderLoginContent());
  }

  if (sending) {
    return wrapped(
      <div className="react-firebase-login-verification-container">
        <h2>Sending verification email...</h2>
      </div>
    );
  }

  if (!verified) {
    return wrapped(
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
    return wrapped(renderLoginContent());
  }

  if (!tokenResult) {
    return null;
  }

  const claims = tokenResult.claims;

  return (
    <UserContext.Provider value={{ user, claims, signInAndLink }}>
      {children}
    </UserContext.Provider>
  );
}

// Throws an error if used outside of a LoginUI component.
export function useUser(): UserContextType {
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error('useUser must be used within a LoginUI component');
  }
  return userContext;
}