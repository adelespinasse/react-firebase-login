import { type PropsWithChildren } from 'react';
import { LogInUI, type LogInUIProps, RequireLogin } from '..';

export type SimpleLogInPageProps = PropsWithChildren<LogInUIProps & {
  requireVerification?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}>;

export function SimpleLogInPage({
  auth,
  methods,
  requireVerification,
  popup,
  header,
  footer,
  children,
}: SimpleLogInPageProps) {
  return (
    <RequireLogin
      requireVerification={requireVerification}
      loginComponent={
        <div
          className="react-firebase-login-simple-login-page"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
          }}
        >
          { header }
          <LogInUI
            auth={auth}
            methods={methods}
            popup={popup}
          />
          { footer }
        </div>
      }
    >
      { children }
    </RequireLogin>
  );
}
