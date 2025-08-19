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
  linkWithCredential,
  linkWithPopup,
  linkWithRedirect,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  TwitterAuthProvider,
  type AuthProvider,
  getAdditionalUserInfo,
  type UserCredential,
  isSignInWithEmailLink,
  signInWithEmailLink,
  EmailAuthProvider,
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
import { EmailLinkLogInUI, EMAIL_FOR_SIGNIN_KEY } from '../EmailLinkLogInUI';
import { PhoneLogInUI } from '../PhoneLogInUI';
import { LogoutButton } from '../LogoutButton/LogoutButton';
import { containerStyle, formatFirebaseError } from '../shared';
import { type FrameFunction, noFrame } from '../frames';
import { AuthContext } from './useAuth';

const REDIRECT_STATE_KEY = 'aldel-react-firebase-login-redirect';

/** Supported login methods. 'email' means classic email and password login.
 * Use 'email_link' instead if you have "Email link (passwordless sign-in)"
 * enabled in the Firebase console. Since Firebase email login can only be
 * configured to work one way or the other, you must not include both 'email'
 * and 'email_link' in the methods list.
 * @expand */
export type LoginMethodName = 'apple' | 'facebook' | 'github' | 'google'
  | 'microsoft' | 'twitter' | 'yahoo' | 'email' | 'email_link' | 'phone';

/** Options for OAuth login methods. */
export type OAuthOptions = {
  /** Extra OAuth scopes to request. */
  scopes?: string[];
};

/** A login method with any options it supports. */
export type LoginMethodWithOptions = readonly ['apple', OAuthOptions?]
   | readonly ['facebook', OAuthOptions?]
   | readonly ['github', OAuthOptions?]
   | readonly ['google', OAuthOptions?]
   | readonly ['microsoft', OAuthOptions?]
   | readonly ['twitter', OAuthOptions?]
   | readonly ['yahoo', OAuthOptions?]
   | readonly ['email']
   | readonly ['email_link']
   | readonly ['phone'];

/** A login method can be specified with either just the name
 * ({@link LoginMethodName}), or a tuple of the name plus options
 * ({@link LoginMethodWithOptions}). */
export type LoginMethod = LoginMethodName | LoginMethodWithOptions;

/** An array of {@link LoginMethodName}s. Should not contain duplicates, nor
 * should it ever contain both `email` and `email_link`, but those restrictions
 * are not checked. */
export type LoginMethodList = readonly LoginMethod[];

// Converts a LoginMethod to a LoginMethodWithOptions, if it is not already.
function withOptions(method: LoginMethod): LoginMethodWithOptions {
  if (Array.isArray(method)) {
    // Don't think the cast should be necessary, but TypeScript doesn't infer it correctly.
    return method as LoginMethodWithOptions;
  }
  // Don't think the cast should be necessary, but TypeScript doesn't infer it correctly.
  return [method] as LoginMethodWithOptions;
}

/** The props for the {@link FirebaseLogin} component.
 * @expand */
export type FirebaseLoginProps = {
  /** The Firebase Auth instance to use. If not provided, the default auth instance will be used. */
  auth?: Auth;
  /** Defaults to true. If true, users will be required to verify their email
   * address when they sign up. With some providers (e.g. Google), verification
   * is automatic. With phone login, verification is automatically bypassed. */
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
  /** The login methods that will be displayed to the user, in the order that
   * they will be displayed. */
  methods?: LoginMethodList;
  /** If true, federated login methods will sign in with a redirect. Otherwise,
   * the sign-in will be done with a popup. If using redirect, you should
   * follow [best
   * practices](https://firebase.google.com/docs/auth/web/redirect-best-practices)
   * and be aware that it [won't work locally without the
   * emulator](https://github.com/firebase/firebase-js-sdk/issues/7342). */
  redirect?: boolean;
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

const PhoneLoginButton = createButton({
  text: 'Sign in with Phone',
  icon: () => '📱',
  style: {
    backgroundColor: '#fff',
    color: '#000',
  },
});

// This should have been exported by firebase/auth, but it isn't.
type BaseOAuthProvider = AuthProvider & {
  addScope: (scope: string) => AuthProvider;
};

function clearEmailLinkSearchParams(searchParams: URLSearchParams) {
  for (const param of ['mode', 'lang', 'oobCode', 'apiKey', 'emailLinkReSigningIn', 'emailLinkLinking']) {
    searchParams.delete(param);
  }
  const url = new URL(window.location.href);
  url.search = searchParams.toString();
  window.history.replaceState({}, '', url.toString());
}
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
  methods: methodList = ['google'],
  redirect,
  header = null,
  footer = null,
  frame = noFrame,
  children,
}: FirebaseLoginProps) {
  const popup = !redirect;
  const methods = methodList.map((m) => withOptions(m));
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
  const onlyEmail = methods?.length === 1 && methods[0]?.[0] === 'email';
  const onlyEmailLink = methods?.length === 1 && methods[0]?.[0] === 'email_link';
  const onlyPhone = methods?.length === 1 && methods[0]?.[0] === 'phone';
  const [page, setPage] = useState<'home' | 'email' | 'email_link' | 'phone'>(
    onlyEmail ? 'email' : onlyEmailLink ? 'email_link' : onlyPhone ? 'phone' : 'home'
  );
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
    if (credential.user.providerData[0]?.providerId === 'phone') {
      setVerified(true);
    } else if (requireVerification) {
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
          localStorage.removeItem(REDIRECT_STATE_KEY);
          await handleUserCredential(result);
        }
      } catch (err) {
        console.error('Error getting redirect result:', err);
        setFirebaseError(err as FirebaseError);
        const stored = localStorage.getItem(REDIRECT_STATE_KEY);
        const [wasReSigningIn, wasLinking] = JSON.parse(stored || '[false, false]');
        localStorage.removeItem(REDIRECT_STATE_KEY);
        setReSigningIn(wasReSigningIn);
        setLinking(wasLinking);
      }
    })();
  }, [authInstance, setFirebaseError, handleUserCredential]);

  useEffect(() => {
    if (!initialized) {
      return;
    }
    (async () => {
      const emailLink = window.location.href;
      // Check if the user is completing an email link sign-in
      if (!isSignInWithEmailLink(authInstance, emailLink)) {
        return;
      }
      const searchParams = new URLSearchParams(window.location.search);
      const wasReSigningIn = searchParams.get('emailLinkReSigningIn') === 'true';
      const wasLinking = searchParams.get('emailLinkLinking') === 'true';
      const emailForSignIn = window.localStorage.getItem(EMAIL_FOR_SIGNIN_KEY);
      if (!emailForSignIn) {
        // User opened the link on a different device or browser. To avoid session fixation
        // attacks, we require it to be on the same device and browser.
        setReSigningIn(wasReSigningIn);
        setLinking(wasLinking);
        setError('You must open the sign-in link on the same device and browser where you \
requested it, and it can only be used once.');
        clearEmailLinkSearchParams(searchParams);
        return;
      }

      try {
        if (wasLinking) {
          if (!user) {
            return;
          }
          const credential = EmailAuthProvider.credentialWithLink(emailForSignIn, emailLink);
          await linkWithCredential(user, credential);
        } else {
          await signInWithEmailLink(authInstance, emailForSignIn, emailLink);
        }
        window.localStorage.removeItem(EMAIL_FOR_SIGNIN_KEY);
        clearEmailLinkSearchParams(searchParams);
        if (wasLinking && user) {
          // If linking to a new provider, apparently we need to reload the page.
          window.location.reload();
        }
      } catch (error) {
        const fbError = error as FirebaseError;
        console.error('Error signing in with email link:', error);
        setReSigningIn(wasReSigningIn);
        setLinking(wasLinking);
        setFirebaseError(fbError);
        clearEmailLinkSearchParams(searchParams);
      }
    })();
  }, [authInstance, handleUserCredential, initialized, setFirebaseError, user]);

  const doOAuthSignIn = useCallback(
    async (provider: BaseOAuthProvider, options: OAuthOptions | undefined) => {
      setError(null);
      setLoading(true);
      if (options?.scopes) {
        for (const scope of options.scopes) {
          provider.addScope(scope);
        }
      }
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
          localStorage.setItem(REDIRECT_STATE_KEY, JSON.stringify([reSigningIn, linking]));
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

  const methodMap = ([name, options]: LoginMethodWithOptions) => {
    switch (name) {
      case 'apple': return (
        <AppleLoginButton
          onClick={() => doOAuthSignIn(new OAuthProvider('apple.com'), options)}
          disabled={loading}
          key="apple"
        >
          Sign in with Apple
        </AppleLoginButton>
      );
      case 'facebook': return (
        <FacebookLoginButton
          onClick={() => doOAuthSignIn(new FacebookAuthProvider(), options)}
          disabled={loading}
          key="facebook"
        >
          Sign in with Facebook
        </FacebookLoginButton>
      );
      case 'github': return (
        <GithubLoginButton
          onClick={() => doOAuthSignIn(new GithubAuthProvider(), options)}
          disabled={loading}
          key="github"
        >
          Sign in with GitHub
        </GithubLoginButton>
      );
      case 'google': return (
        <GoogleLoginButton
          onClick={() => doOAuthSignIn(new GoogleAuthProvider(), options)}
          disabled={loading}
          key="google"
        >
          Sign in with Google
        </GoogleLoginButton>
      );
      case 'microsoft': return (
        <MicrosoftLoginButton
          onClick={() => doOAuthSignIn(new OAuthProvider('microsoft.com'), options)}
          disabled={loading}
          key="microsoft"
        >
          Sign in with Microsoft
        </MicrosoftLoginButton>
      );
      case 'twitter' : return (
        <XLoginButton
          onClick={() => doOAuthSignIn(new TwitterAuthProvider(), options)}
          disabled={loading}
          key="twitter"
        >
          Sign in with X
        </XLoginButton>
      );
      case 'yahoo': return (
        <YahooLoginButton
          onClick={() => doOAuthSignIn(new OAuthProvider('yahoo.com'), options)}
          disabled={loading}
          key="yahoo"
        >
          Sign in with Yahoo
        </YahooLoginButton>
      );
      case 'email': return (
        <EmailLoginButton
          onClick={() => {
            setError(null);
            setPage('email');
          }}
          disabled={loading}
          key="email"
        />
      );
      case 'email_link': return (
        <EmailLoginButton
          onClick={() => {
            setError(null);
            setPage('email_link');
          }}
          disabled={loading}
          key="email_link"
        />
      );
      case 'phone': return (
        <PhoneLoginButton
          onClick={() => {
            setError(null);
            setPage('phone');
          }}
          disabled={loading}
          key="phone"
        />
      );
    }
  };

  const renderLoginContent = () => {
    if (page === 'email') {
      return <EmailLogInUI
        auth={authInstance}
        onClose={onlyEmail ? undefined : () => setPage('home')}
        handleUserCredential={handleUserCredential}
        linking={linking}
      />;
    }

    if (page === 'email_link') {
      return <EmailLinkLogInUI
        auth={authInstance}
        onClose={onlyEmailLink ? undefined : () => setPage('home')}
        reSigningIn={reSigningIn}
        linking={linking}
      />;
    }

    if (page === 'phone') {
      return <PhoneLogInUI
        auth={authInstance}
        onClose={onlyPhone ? undefined : () => setPage('home')}
        handleUserCredential={handleUserCredential}
        linking={linking}
      />;
    }

    return (
      <div
        style={containerStyle}
        className="react-firebase-login-ui-container"
      >
        { methods.map(methodMap) }
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
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
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
      </div>
    );
  }

  if (reSigningIn) {
    return wrapped(renderLoginContent());
  }

  if (!tokenResult) {
    return wrapped(null);
  }

  const claims = tokenResult.claims;

  return (
    <AuthContext.Provider value={{ auth: authInstance, user, claims, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}
