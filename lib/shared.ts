// @aldel/react-firebase-login
// Copyright © 2025 Alan deLespinasse
// License: MIT
import { type FirebaseError } from 'firebase/app';

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
};
