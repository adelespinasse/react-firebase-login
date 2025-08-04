
export type FrameComponent = (children: React.ReactNode) => React.ReactNode;

export const NoFrame: FrameComponent = (children) => children;

export const FullPageFrame: FrameComponent = (children) => (
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
    {children}
  </div>
);
