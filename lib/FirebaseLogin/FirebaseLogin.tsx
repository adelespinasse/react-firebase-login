import {
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
import { LogoutButton } from '../LogoutButton/LogoutButton';
import { containerStyle, formatFirebaseError } from '../shared';
import { type FrameFunction, noFrame } from '../frames';
import { AuthContext } from './useAuth';

/** Supported login methods. */
export type LogInMethod = 'apple' | 'facebook' | 'github' | 'google'
  | 'microsoft' | 'twitter' | 'yahoo' | 'email';

/** The props for the {@link FirebaseLogin} component.
 * @expand
*/
export type FirebaseLoginProps = {
  /** The Firebase Auth instance to use. If not provided, the default auth instance will be used. */
  auth?: Auth;
  /** Defaults to true. If true, users will be required to verify their email address when they
   * sign up. With some providers (e.g. Google), verification is automatic. */
  requireVerification?: boolean;
  /** If true, the user does not need to sign in; they will automatically be
   * signed in anonymously, and the children will be displayed. The login UI is
   * displayed only when the `signIn` function, provided by the {@link useAuth}
   * hook, is called. If `signIn` is called with its `link` argument set to
   * `true`, when the user then signs in, the anonymous account will be
   * upgraded to a normal account with an email address.
   *
   * The login UI is displayed with a "cancel" button so the user can dismiss
   * it.
   *
   * If `allowAnonymous` and `requireVerification` are both true, the user will
   * be required to verify their email address only when they sign in. */
  allowAnonymous?: boolean;
  /** The login methods that will be displayed to the user. */
  methods?: LogInMethod[];
  /** If true, federated login methods that support a popup sign-in will use a popup.
   * Otherwise, the sign-in will be done with a redirect. */
  popup?: boolean;
  /** A header to display above the login buttons. */
  header?: React.ReactNode;
  /** A footer to display below the login buttons. */
  footer?: React.ReactNode;
  /** A function that modifies the login UI. When any login UI is displayed, it is first passed
   * through this function. This may be used to add extra decoration around the login UI.
   *
   * The default is {@link noFrame}, which passes the login UI through unchanged. See
   * {@link fullPageFrame} for another example. */
  frame?: FrameFunction;
  /** The children to render when the user is authenticated. */
  children?: React.ReactNode;
};

const EmailLoginButton = createButton({
  text: 'Sign in with Email',
  icon: () => '📧',
  style: {
    backgroundColor: '#fff',
    color: '#000',
  },
});

/** A React component that provides Firebase Authentication to its children. If the user is
 * authenticated (and other requirements are met, such as requiring email verification when
 * enabled), the children are rendered unaltered. Otherwise a UI is displayed that allows the
 * user to sign in (and verify their email address if required).
 *
 * Components inside this wrapper can access user data and other controls via the
 * {@link useAuth} hook. */
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
  const [reSigningIn, setReSigningIn] = useState(false);
  const [linking, setLinking] = useState(false);
  const [page, setPage] = useState<'home' | 'email'>('home');
  const [loading, setLoading] = useState(false);

  const signIn = useCallback((link: boolean = false) => {
    if (!user) {
      setError('Something is broken: re-signing in without a current user');
      return;
    }
    setError(null);
    setLinking(link);
    setReSigningIn(true);
  }, [user]);

  const cancelReSigningIn = useCallback(() => {
    setReSigningIn(false);
    setLinking(false);
  }, []);

  const sendVerification = useCallback(async (user: User) => {
    if (!user) {
      setError('Something is broken: can\'t send verification email without a user');
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
  }, []);

  const handleUserCredential = useCallback(async (credential: UserCredential) => {
    if (requireVerification) {
      const additionalInfo = getAdditionalUserInfo(credential);
      if (additionalInfo?.isNewUser && !credential.user.emailVerified) {
        await sendVerification(credential.user);
      }
    }
    setReSigningIn(false);
    setLinking(false);
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
    (async () => {
      // When signing in with popup, you just await the sign-in function and it
      // either resolves or throws an error. With a redirect, you lose all the
      // page state, so then you call getRedirectResult(), which succeeds or
      // fails pretty much like the popup sign-in functions (or resolves to
      // null if there was no redirect).
      try {
        const result = await getRedirectResult(authInstance);
        if (result) {
          localStorage.removeItem('aldel-react-firebase-login-redirect');
          await handleUserCredential(result);
        }
      } catch (err) {
        console.error('Error getting redirect result:', err);
        setFirebaseError(err as FirebaseError);
        const stored = localStorage.getItem('aldel-react-firebase-login-redirect');
        const [wasReSigningIn, wasLinking] = JSON.parse(stored || '[false, false]');
        localStorage.removeItem('aldel-react-firebase-login-redirect');
        setReSigningIn(wasReSigningIn);
        setLinking(wasLinking);
      }
    })();
  }, [authInstance, setFirebaseError, handleUserCredential]);

  const doSignIn = useCallback(
    async (provider: AuthProvider) => {
      setError(null);
      setLoading(true);
      try {
        if (popup) {
          const getCredential = () => {
            if (user && linking) {
              // User is already authenticated (possibly anonymously), and we
              // want to link a new provider to the user account. Most commonly
              // this means upgrading an anonymous account to a named account.
              return linkWithPopup(user, provider);
            }
            return signInWithPopup(authInstance, provider);
          };
          const credential = await getCredential();
          await handleUserCredential(credential);
        } else {
          // Save state for after redirect and getRedirectResult... ugh
          localStorage.setItem('aldel-react-firebase-login-redirect', JSON.stringify([reSigningIn, linking]));
          if (user && linking) {
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
    [popup, handleUserCredential, user, linking, authInstance, reSigningIn, setFirebaseError],
  );

  const methodMap = {
    apple: (
      <AppleLoginButton
        onClick={() => doSignIn(new OAuthProvider('apple.com'))}
        disabled={loading}
        key="apple"
      >
        Sign in with Apple
      </AppleLoginButton>
    ),
    facebook: (
      <FacebookLoginButton
        onClick={() => doSignIn(new FacebookAuthProvider())}
        disabled={loading}
        key="facebook"
      >
        Sign in with Facebook
      </FacebookLoginButton>
    ),
    github: (
      <GithubLoginButton
        onClick={() => doSignIn(new GithubAuthProvider())}
        disabled={loading}
        key="github"
      >
        Sign in with GitHub
      </GithubLoginButton>
    ),
    google: (
      <GoogleLoginButton
        onClick={() => doSignIn(new GoogleAuthProvider())}
        disabled={loading}
        key="google"
      >
        Sign in with Google
      </GoogleLoginButton>
    ),
    microsoft: (
      <MicrosoftLoginButton
        onClick={() => doSignIn(new OAuthProvider('microsoft.com'))}
        disabled={loading}
        key="microsoft"
      >
        Sign in with Microsoft
      </MicrosoftLoginButton>
    ),
    twitter : (
      <XLoginButton
        onClick={() => doSignIn(new TwitterAuthProvider())}
        disabled={loading}
        key="twitter"
      >
        Sign in with X
      </XLoginButton>
    ),
    yahoo: (
      <YahooLoginButton
        onClick={() => doSignIn(new OAuthProvider('yahoo.com'))}
        disabled={loading}
        key="yahoo"
      >
        Sign in with Yahoo
      </YahooLoginButton>
    ),
    email: (
      <EmailLoginButton
        onClick={() => {
          setError(null);
          setPage('email');
        }}
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
        linking={linking}
      />;
    }

    return (
      <div
        style={containerStyle}
        className="react-firebase-login-ui-container"
      >
        {(methods || ['google']).map((method) => methodMap[method])}
        {error && <p style={{ color: 'red', textAlign: 'center' }}>Error: {error}</p>}
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
        { reSigningIn && (
          <button
            className="react-firebase-login-cancel-linking-button"
            style={{
              position: 'absolute',
              top: 0, right: 0, zIndex: 1000,
              border: 'none',
              backgroundColor: 'transparent', color: '#447',
              margin: 0, padding: 2,
            }}
            onClick={cancelReSigningIn}
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
            click here
          </a>
          {' '}to continue.
        </p>
        <button
          onClick={() => sendVerification(user)}
        >
          Resend email
        </button>
        <LogoutButton />
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      </div>
    );
  }

  if (reSigningIn) {
    return wrapped(renderLoginContent());
  }

  if (!tokenResult) {
    return null;
  }

  const claims = tokenResult.claims;

  return (
    <AuthContext.Provider value={{ user, claims, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}
