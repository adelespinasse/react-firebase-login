import { type RequireLoginProps, RequireLogin } from '..';

export type LogInPageProps = RequireLoginProps;

export function LogInPage({
  auth,
  requireVerification = false,
  allowAnonymous = false,
  loginComponent,
  children,
}: LogInPageProps) {
  return (
    <RequireLogin
      auth={auth}
      requireVerification={requireVerification}
      allowAnonymous={allowAnonymous}
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
            left: 0,
            top: 0,
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
