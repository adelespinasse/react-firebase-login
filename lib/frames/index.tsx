import { type FrameComponent } from '../LoginUI/LoginUI';

// eslint-disable-next-line react/prop-types
export const FullPageFrame: FrameComponent = ({ children }) => (
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

// eslint-disable-next-line react/prop-types
export const ModalFrame: FrameComponent = ({ children }) => (
  <div
    className="react-firebase-login-modal-overlay"
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}
  >
    <div
      className="react-firebase-login-modal"
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
      }}
    >
      {children}
    </div>
  </div>
);

// eslint-disable-next-line react/prop-types
export const InlineFrame: FrameComponent = ({ children }) => (
  <div className="react-firebase-login-inline">
    {children}
  </div>
);