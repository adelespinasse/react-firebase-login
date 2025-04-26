import { useCallback, useState } from 'react';
import {
  FacebookAuthProvider,
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  TwitterAuthProvider,
  type Auth,
  type AuthProvider,
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
import { containerStyle, formatFirebaseError, setIsNewUser } from '../shared';

const EmailLoginButton = createButton({
  text: 'Sign in with Email',
  icon: () => '📧',
  style: {
    backgroundColor: '#fff',
    color: '#000',
  },
});

export type LogInMethod = 'apple' | 'facebook' | 'github' | 'google'
  | 'microsoft' | 'twitter' | 'yahoo' | 'email';

export type LogInUIProps = {
  auth?: Auth;
  methods?: LogInMethod[];
  popup?: boolean;
};

export function LogInUI({ auth, methods, popup }: LogInUIProps) {
  const [page, setPage] = useState<'home' | 'email'>('home');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const authInstance = auth || getAuth();

  // Converts a FirebaseError to a relatively human-friendly string (the
  // err.message is not very human-friendly).
  const setFirebaseError = useCallback((error: FirebaseError) => {
    setError(formatFirebaseError(error));
  }, []);

  const signIn = useCallback(
    async (provider: AuthProvider) => {
      setLoading(true);
      try {
        if (popup) {
          await signInWithPopup(authInstance, provider)
            .then((userCredential) => {
              setIsNewUser(userCredential);
            });
        } else {
          await signInWithRedirect(authInstance, provider)
            .then((userCredential) => {
              setIsNewUser(userCredential);
            });
        }
      } catch (err) {
        setFirebaseError(err as FirebaseError);
      } finally {
        setLoading(false);
      }
    },
    [authInstance, popup, setFirebaseError],
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

  if (page === 'email') {
    return <EmailLogInUI
      auth={authInstance}
      onClose={() => setPage('home')}
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
}
