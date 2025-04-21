import React, { useCallback } from 'react';
import { type Auth, getAuth, signOut } from 'firebase/auth';

export type SignOutButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  auth?: Auth;
  onSignOut?: () => void;
};

export function SignOutButton({ auth, onSignOut, ...rest }: SignOutButtonProps) {
  const onClick = useCallback(async () => {
    try {
      await signOut(auth || getAuth());
      if (onSignOut) {
        onSignOut();
      }
    } catch (error) {
      alert(`Error signing out: ${(error as Error).message}`);
    }
  }, [auth, onSignOut]);

  return (
    <button
      onClick={onClick}
      {...rest}
    >
      Sign Out
    </button>
  );
}
