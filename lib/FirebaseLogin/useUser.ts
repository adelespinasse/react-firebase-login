import {
  createContext,
  useContext,
} from 'react';
import { type User } from 'firebase/auth';

/** The type returned by the {@link useUser} hook.
 * @expand
*/
export type UserContextType = {
  /** The User object for the current user. */
  user: User,
  /** The user's claims, including standard and custom claims. */
  claims: Record<string, unknown>,
  /** A callback function that allows the user to sign in and link a new provider. Calling this
   * will display the login UI, and when the user signs in, the provider account they use will
   * be linked to the current user. Most commonly this is used to convert an anonymously
   * authenticated user to a fully logged in user. */
  signInAndLink: () => void,
};

export const UserContext = createContext<UserContextType | null>(null);

/** A hook that provides access to the user's authentication state.
 *
 * This hook can only be used within a {@link FirebaseLogin} component. The values it provides
 * are therefore always valid. If called from outside a {@link FirebaseLogin} component, an
 * exception will be thrown. */
export function useUser(): UserContextType {
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error('useUser must be used within a FirebaseLogin component');
  }
  return userContext;
}
