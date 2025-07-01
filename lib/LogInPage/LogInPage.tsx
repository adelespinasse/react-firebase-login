import { type RequireLoginProps, RequireLogin } from '..';

export type LogInPageProps = RequireLoginProps;

export function LogInPage({
  auth,
  requireVerification,
  loginComponent,
  children,
}: LogInPageProps) {
  return (
    <RequireLogin
      auth={auth}
      requireVerification={requireVerification}
      loginComponent={
        <div
          className="react-firebase-login-page"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            position: 'fixed',
          }}
        >
          { loginComponent }
        </div>
      }
    >
      { children }
    </RequireLogin>
  );
}
