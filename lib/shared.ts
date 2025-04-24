import { type FirebaseError } from 'firebase/app';
import {
  getAdditionalUserInfo,
  type User,
  type UserCredential,
} from 'firebase/auth';

export function formatFirebaseError(error: FirebaseError): string {
  const suffix = error.code?.split('/').splice(-1)[0];
  if (!suffix) {
    return error.message;
  }
  return suffix.replaceAll('-', ' ');
}

export const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '25em',
  minWidth: '20em',
  backgroundColor: '#fff',
  color: '#000',
  padding: '1em',
};

// Janky way for  signal to RequireLogin component that this is a new user

function newUserLocalStorageKey(user: User) {
  return `react-firebase-login-newuser-${user.uid}`;
}

export function setIsNewUser(userCredential: UserCredential) {
  if (getAdditionalUserInfo(userCredential)?.isNewUser) {
    window.localStorage.setItem(
      newUserLocalStorageKey(userCredential.user),
      'true',
    );
  }
}

// Resets the new user flag in local storage, so not idempotent!
export function isNewUser(user: User) {
  const key = newUserLocalStorageKey(user);
  const result = Boolean(window.localStorage.getItem(key));
  if (result) {
    window.localStorage.removeItem(key);
  }
  return result;
}
