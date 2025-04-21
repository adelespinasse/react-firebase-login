import React, { useCallback } from 'react';
import { type Auth, getAuth, signOut } from 'firebase/auth';

export type LogOutButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  auth?: Auth;
  onLogOut?: () => void;
};

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
      onClick={onClick}
      {...rest}
    >
      Log Out
    </button>
  );
}
