import React, { useCallback } from 'react';
import { type Auth, getAuth, signOut } from 'firebase/auth';

export type LogOutButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  /** The Firebase Auth instance to use. If not provided, the default auth instance will be used. */
  auth?: Auth;
  /** An extra function to call when the user logs out. */
  onLogOut?: () => void;
};

/** A "Sign Out" button that logs the user out of Firebase Auth. */
export function LogOutButton({ auth, onLogOut, ...rest }: LogOutButtonProps) {
  const onClick = useCallback(async () => {
    try {
      await signOut(auth || getAuth());
      if (onLogOut) {
        onLogOut();
      }
    } catch (error) {
      alert(`Error signing out: ${(error as Error).message}`);
    }
  }, [auth, onLogOut]);

  return (
    <button
      className="react-firebase-login-log-out-button"
      onClick={onClick}
      {...rest}
    >
      Sign Out
    </button>
  );
}
