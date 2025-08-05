import {
  type PropsWithChildren,
  useCallback,
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
import { type FrameComponent, noFrame } from '../frames';
import { UserContext } from './useUser';

export type LogInMethod = 'apple' | 'facebook' | 'github' | 'google'
  | 'microsoft' | 'twitter' | 'yahoo' | 'email';

export type FirebaseLoginProps = PropsWithChildren<{
  /** The Firebase Auth instance to use. If not provided, the default auth instance will be used. */
  auth?: Auth;
  /** If true, users will be required to verify their email address when they sign up. With
   * some providers (e.g. Google), verification is automatic. */
  requireVerification?: boolean;
  /** If true, users will automatically be signed in anonymously. */
  allowAnonymous?: boolean;
  /** The login methods that will be displayed to the user. */
  methods?: LogInMethod[];
  /** If true, login methods that support a popup sign-in will use a popup. Otherwise, the
   * sign-in will be done in a redirect. */
  popup?: boolean;
  /** A header to display above the login buttons. */
  header?: React.ReactNode;
  /** A footer to display below the login buttons. */
  footer?: React.ReactNode;
  /** A function that modifies the login UI. When any login UI is displayed, it is first passed
   * through this function. This may be used to add extra decoration around the login UI. */
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

/** A wrapper for components that require the user to be authenticated with Firebase
 * Authentication. If the user is authenticated (and other requirements are met, such as
 * requiring email verification when enabled), the children are rendered unaltered. Otherwise a
 * UI is displayed that allows the user to sign in (and verify their email address if required).
 *
 * Components inside this wrapper can access user data and other controls via the `useUser` hook. */
export function FirebaseLogin({
  auth,
  requireVerification = true,
  allowAnonymous = false,
  methods,
  popup,
  header = null,
  footer = null,
  frame = noFrame,
  children,
}: FirebaseLoginProps) {
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
