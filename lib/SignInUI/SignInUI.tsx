import { useCallback, useState } from 'react';
import {
  type Auth,
  type AuthProvider,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { GoogleLoginButton, createButton } from 'react-social-login-buttons';

const EmailLoginButton = createButton({
  text: 'Log in with Email',
  icon: () => '📧',
  style: {
    backgroundColor: '#fff',
    color: '#000',
  },
});

const containerStyle = {
  display: 'flex',
  'flex-direction': 'column',
  maxWidth: '20em',
  backgroundColor: '#fff',
  padding: '1em',
};

const buttonContainerStyle = {
  display: 'flex',
  'flex-direction': 'row',
  justifyContent: 'start',
  marginBottom: '0.5em',
  width: '100%',
  gap: '0.5em',
}

const buttonStyle = {
  backgroundColor: '#4275a4',
  color: '#fff',
  borderRadius: '0.2em',
  padding: '0.2em 1em',
  border: 'none',
  cursor: 'pointer',
};

const disabledButtonStyle = {
  ...buttonStyle,
  opacity: 0.5,
  cursor: 'not-allowed',
};

const inputStyle = {
  border: '1px solid #ccc',
  borderRadius: '0.2em',
  padding: '0.5em',
  marginBottom: '0.5em',
  width: '100%',
};

const linkStyle = {
  color: '#4275a4',
  textDecoration: 'underline',
  cursor: 'pointer',
};

export type SignInMethod = 'google' | 'email';

export type SignInUIProps = {
  auth: Auth;
  methods: SignInMethod[];
  popup?: boolean;
};

export function SignInUI({ auth, methods, popup }: SignInUIProps) {
  const [emailState, setEmailState] = useState<'none' | 'signin' | 'create'>('none');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = useCallback(
    (provider: AuthProvider) => {
      if (popup) {
        signInWithPopup(auth, provider);
      } else {
        signInWithRedirect(auth, provider);
      }
    },
    [auth, popup],
  );

  const methodMap = {
    google: (
      <GoogleLoginButton
        onClick={() => signIn(new GoogleAuthProvider())}
      />
    ),
    email: (
      <EmailLoginButton
        onClick={() => setEmailState('signin')}
      />
    ),
  };

  const inner = () => {
    // if (loading) {
    //   return <div>Loading...</div>;
    // }
    const signinButtonDisabled = loading || !email || !password;
    const createButtonDisabled = loading || !email || !password || !confirmPassword;
    switch (emailState) {
      case 'none':
        return methods.map((method) => (methodMap[method]));
      case 'signin':
        return (
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="Email"
              style={inputStyle}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="Password"
              style={inputStyle}
            />
            <div style={buttonContainerStyle}>
              <button
                onClick={() => {
                  setLoading(true);
                  signInWithEmailAndPassword(auth, email, password)
                    .catch((err) => {
                      setError(err.message);
                    })
                    .finally(() => {
                      setLoading(false);
                    });
                }}
                disabled={signinButtonDisabled}
                style={signinButtonDisabled ? disabledButtonStyle : buttonStyle}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setEmailState('none');
                  setError(null);
                }}
                disabled={loading}
                style={loading ? disabledButtonStyle : buttonStyle}
              >
                Cancel
              </button>
            </div>
            <p>
              Don&apos;t have an account?{' '}
              <a
                onClick={() => {
                  setEmailState('create');
                  setError(null);
                }}
                style={linkStyle}
              >
                Create one
              </a>
            </p>
          </div>
        );
      case 'create':
        return (
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="Email"
              style={inputStyle}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="Password"
              style={inputStyle}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError(null);
              }}
              placeholder="Confirm Password"
              style={inputStyle}
            />
            <div style={buttonContainerStyle}>
              <button
                onClick={() => {
                  if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    return;
                  }
                  setLoading(true);
                  createUserWithEmailAndPassword(auth, email, password)
                    .catch((err) => {
                      setError(err.message);
                    })
                    .finally(() => {
                      setLoading(false);
                    });
                }}
                disabled={createButtonDisabled}
                style={createButtonDisabled ? disabledButtonStyle : buttonStyle}
              >
                Create Account
              </button>
              <button
                onClick={() => {
                  setEmailState('none');
                  setError(null);
                }}
                disabled={loading}
                style={loading ? disabledButtonStyle : buttonStyle}
              >
                Cancel
              </button>
            </div>
            <p>
              Have an account already?{' '}
              <a
                onClick={() => {
                  setEmailState('signin');
                  setError(null);
                }}
                style={linkStyle}
              >
                Sign in
              </a>
            </p>
          </div>
        );
    }
  };

  return (
    <div style={containerStyle}>
      {inner()}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}
