// @aldel/react-firebase-login
// Copyright © 2025 Alan deLespinasse
// Dual license (See LICENSE.md for details):
// - Free use in applications with user-visible attribution
// - Paid license available without attribution
import React, { useCallback } from 'react';
import { type Auth, getAuth, signOut } from 'firebase/auth';

/** The props for the {@link LogoutButton} component.
 * @expand
 */
export type LogoutButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  /** The Firebase Auth instance to use. If not provided, the default auth instance will be used. */
  auth?: Auth;
  /** An extra function to call when the user logs out. */
  onLogOut?: () => void;
};

/** A "Sign Out" button component that logs the user out of Firebase Auth. */
export function LogoutButton({ auth, onLogOut, ...rest }: LogoutButtonProps) {
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
