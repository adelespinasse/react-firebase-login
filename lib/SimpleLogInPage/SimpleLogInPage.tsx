import { type PropsWithChildren } from 'react';
import { LogInUI, type LogInUIProps, LogInPage } from '..';

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
    <LogInPage
      auth={auth}
      requireVerification={requireVerification}
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
