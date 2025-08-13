import {
  createContext,
  useContext,
} from 'react';
import { type Auth, type User } from 'firebase/auth';

/** The type returned by the {@link useAuth} hook.
 * @expand
*/
export type AuthContextType = {
  /** The Firebase Auth instance used by FirebaseLogin. */
  auth: Auth,
  /** The User object for the current user. */
  user: User,
  /** The user's claims, including standard and custom claims. */
  claims: Record<string, unknown>,
  /** A callback function that allows the user to sign in even though they are
   * already authenticated. Calling this will display the login UI with a
   * "close" button that is not normally shown.
   *
   * If the `link` argument is true, the provider account they use will be
   * linked to the current user. However, if the provider account is already
   * linked to a Firebase user, the user will be shown an error.
   *
   * If `link` is false or not given, the user is just signed out of the
   * current user account and signed in to the new one.
   *
   * Most commonly this is used to convert an anonymously authenticated user to
   * a fully logged in user. */
  signIn: (link?: boolean) => void,
};

export const AuthContext = createContext<AuthContextType | null>(null);

/** A hook that provides access to the user's authentication state.
 *
 * This hook can only be used within a {@link FirebaseLogin} component. The
 * values it provides are therefore always valid. If called from outside a
 * {@link FirebaseLogin} component, an exception will be thrown. */
export function useAuth(): AuthContextType {
  const userContext = useContext(AuthContext);
  if (!userContext) {
    throw new Error('useAuth must be used within a FirebaseLogin component');
  }
  return userContext;
}
