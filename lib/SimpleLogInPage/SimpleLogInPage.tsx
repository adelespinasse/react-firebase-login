import { type PropsWithChildren } from 'react';
import { LogInUI, type LoginProps, type LogInUIProps, LogInPage } from '..';

export type SimpleLogInPageProps = PropsWithChildren<LoginProps & LogInUIProps & {
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
  return (
    <LogInPage
      auth={auth}
      requireVerification={requireVerification}
      allowAnonymous={allowAnonymous}
      loginComponent={
        <>
          { header }
          <LogInUI
            auth={auth}
            methods={methods}
            popup={popup}
          />
          { footer }
        </>
      }
    >
      { children }
    </LogInPage>
  );
}
