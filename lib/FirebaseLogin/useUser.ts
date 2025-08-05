import {
  createContext,
  useContext,
} from 'react';
import { type User } from 'firebase/auth';

export type UserContextType = {
  /** The User object for the current user. This is always valid because the hook can only be
   * used within a FirebaseLogin component. */
  user: User,
  /** The user's claims, including standard and custom claims. */
  claims: Record<string, unknown>,
  /** A callback function that allows the user to sign in and link a new provider. */
  signInAndLink: () => void,
};

export const UserContext = createContext<UserContextType | null>(null);

/** A hook that provides access to the user's authentication state.
 *
 * This hook must only be used within a FirebaseLogin component. */
export function useUser(): UserContextType {
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error('useUser must be used within a FirebaseLogin component');
  }
  return userContext;
}
