import { useCallback, useState } from 'react';
import {
  type Auth,
  type UserCredential,
  linkWithCredential,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  type ConfirmationResult,
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

/** A custom input component for the phone login method should implement these
 * props. It should display the input control(s) AND any instructions that are
 * needed (e.g. "Enter your phone number with country code"). */
export type PhoneInputComponentProps = {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
};

/** Options for the phone login method. */
export type PhoneOptions = {
  inputComponent?: React.FunctionComponent<PhoneInputComponentProps>;
};

export type PhoneLogInUIProps = {
  auth: Auth;
  onClose?: () => void;
  handleUserCredential: (credential: UserCredential) => Promise<void>;
  linking: boolean;
  options?: PhoneOptions;
};

function DefaultInputComponent({ value, onChange, disabled }: PhoneInputComponentProps) {
  return (
    <>
      <p>Sign in with your phone number (including country code, e.g. <b>+1</b>):</p>
      <input
        type="tel"
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Phone number (e.g., +1234567890)"
        style={inputStyle}
        disabled={disabled}
      />
    </>
  );
}

export function PhoneLogInUI({ auth, onClose, handleUserCredential, linking, options }: PhoneLogInUIProps) {
  const InputComponent = options?.inputComponent || DefaultInputComponent;
  const [loginState, setLoginState] = useState<'phone' | 'verify'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('+1 ');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  const setFirebaseError = useCallback((error: FirebaseError) => {
    setError(formatFirebaseError(error));
  }, []);

  const setupRecaptcha = useCallback(() => {
    if (recaptchaVerifier) {
      return recaptchaVerifier;
    }

    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber
      },
      'expired-callback': () => {
        setError('reCAPTCHA expired. Please try again.');
      }
    });

    setRecaptchaVerifier(verifier);
    return verifier;
  }, [auth, recaptchaVerifier]);

  const sendCode = useCallback(async () => {
    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const verifier = setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(confirmation);
      setLoginState('verify');
      verifier.clear();
    } catch (error) {
      setFirebaseError(error as FirebaseError);
      // Clear the reCAPTCHA on error
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        setRecaptchaVerifier(null);
      }
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, auth, setupRecaptcha, setFirebaseError, recaptchaVerifier]);

  const verifyCode = useCallback(async () => {
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    if (!confirmationResult) {
      setError('No confirmation result found. Please request a new code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userCredential = await (async () => {
        if (auth.currentUser && linking) {
          const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, verificationCode);
          return linkWithCredential(auth.currentUser, credential);
        }
        return confirmationResult.confirm(verificationCode);
      })();

      await handleUserCredential(userCredential);
    } catch (error) {
      setFirebaseError(error as FirebaseError);
    } finally {
      setLoading(false);
    }
  }, [verificationCode, confirmationResult, auth, linking, handleUserCredential, setFirebaseError]);

  const inner = () => {
    const phoneButtonDisabled = loading || !phoneNumber;
    const verifyButtonDisabled = loading || !verificationCode;

    switch (loginState) {
      case 'phone':
        return (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendCode();
            }}
          >
            <InputComponent
              value={phoneNumber}
              onChange={(value) => {
                setPhoneNumber(value);
                setError(null);
              }}
              disabled={loading}
            />
            <div id="recaptcha-container"></div>
            <div style={buttonContainerStyle}>
              <button
                type="submit"
                disabled={phoneButtonDisabled}
              >
                Send Code
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        );
      case 'verify':
        return (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              verifyCode();
            }}
          >
            <p>Enter the verification code sent to {phoneNumber}:</p>
            <input
              type="text"
              autoFocus
              key="code-input"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value);
                setError(null);
              }}
              placeholder="Verification code"
              style={inputStyle}
              disabled={loading}
            />
            <div style={buttonContainerStyle}>
              <button
                type="submit"
                disabled={verifyButtonDisabled}
              >
                Verify
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        );
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