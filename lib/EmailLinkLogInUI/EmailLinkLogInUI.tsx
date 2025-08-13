import { useCallback, useState } from 'react';
import {
  type Auth,
  getAuth,
  sendSignInLinkToEmail,
} from 'firebase/auth';
import { type FirebaseError } from 'firebase/app';

import { containerStyle, formatFirebaseError } from '../shared';

const buttonContainerStyle = {
  display: 'flex',
  'flex-direction': 'row',
  justifyContent: 'start',
  marginBottom: '0.5em',
  width: '100%',
  gap: '0.5em',
};

const inputStyle = {
  padding: '0.5em',
  marginBottom: '0.5em',
  width: '100%',
};

/** The props for the {@link EmailLinkLogInUI} component.
 * @expand
 */
export type EmailLinkLogInUIProps = {
  auth?: Auth;
  onClose?: () => void;
  linking: boolean;
};

export function EmailLinkLogInUI({ auth, onClose, linking }: EmailLinkLogInUIProps) {
  const authInstance = auth || getAuth();
  const [loginState, setLoginState] = useState<'email' | 'waiting' | 'sent'>('email');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Converts a FirebaseError to a relatively human-friendly string (the
  // err.message is not very human-friendly).
  const setFirebaseError = useCallback((error: FirebaseError) => {
    setError(formatFirebaseError(error));
  }, []);


  const sendEmailLink = useCallback(async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be in the authorized domains list in the Firebase Console.
        url: window.location.href,
        // This must be true.
        handleCodeInApp: true,
      };

      if (authInstance.currentUser && linking) {
        // For linking, we need to use linkWithCredential instead
        // But since we can't create a credential until we get the link,
        // we'll handle this in the effect above
        await sendSignInLinkToEmail(authInstance, email, actionCodeSettings);
      } else {
        await sendSignInLinkToEmail(authInstance, email, actionCodeSettings);
      }

      // Save the email locally so you don't need to ask the user for it again
      // if they open the link on the same device.
      window.localStorage.setItem('aldel-react-firebase-login-emailForSignIn', email);

      setLoginState('sent');
    } catch (error) {
      setFirebaseError(error as FirebaseError);
    } finally {
      setLoading(false);
    }
  }, [email, authInstance, linking, setFirebaseError]);

  const inner = () => {
    const emailButtonDisabled = loading || !email;

    switch (loginState) {
      case 'email':
        return (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendEmailLink();
            }}
          >
            <p>Enter your email address to receive a sign-in link:</p>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="Email"
              style={inputStyle}
              disabled={loading}
            />
            <div style={buttonContainerStyle}>
              <button
                type="submit"
                disabled={emailButtonDisabled}
              >
                Send Sign-In Link
              </button>
              { onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        );

      case 'sent':
        return (
          <div>
            <p>
              A sign-in link has been sent to {email}. Click the link in your email to sign in.
            </p>
            <div style={buttonContainerStyle}>
              <button
                onClick={() => sendEmailLink()}
                disabled={loading}
              >
                Resend Link
              </button>
              <button
                onClick={() => {
                  setLoginState('email');
                  setError(null);
                }}
                disabled={loading}
              >
                Back
              </button>
              { onClose && (
                <button
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };


  return (
    <div
      style={containerStyle}
      className="react-firebase-login-ui-container"
    >
      {inner()}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
    </div>
  );
}