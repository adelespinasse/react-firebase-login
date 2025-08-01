import { type PropsWithChildren } from 'react';
import { LoginUI, type LogInMethod } from '../LoginUI/LoginUI';

export type SimpleLogInPageProps = PropsWithChildren<{
  auth?: import('firebase/auth').Auth;
  requireVerification?: boolean;
  allowAnonymous?: boolean;
  methods?: LogInMethod[];
  popup?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}>;

export function SimpleLogInPage({
  auth,
  methods,
  requireVerification = false,
  allowAnonymous = false,
  popup,
  header,
  footer,
  children,
}: SimpleLogInPageProps) {
  const frame = ({ children: frameChildren }: { children: React.ReactNode }) => (
    <div
      className="react-firebase-login-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        left: 0,
        top: 0,
        position: 'fixed',
      }}
    >
      {header}
      {frameChildren}
      {footer}
    </div>
  );

  return (
    <LoginUI
      auth={auth}
      requireVerification={requireVerification}
      allowAnonymous={allowAnonymous}
      methods={methods}
      popup={popup}
      frame={frame}
    >
      {children}
    </LoginUI>
  );
}
