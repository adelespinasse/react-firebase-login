// @aldel/react-firebase-login
// Copyright © 2025 Alan deLespinasse
// Dual license (See LICENSE.md for details):
// - Free use in applications with user-visible attribution
// - Paid license available without attribution

/** A function that modifies rendered React content. The input is generally included in the
 * output as children of a wrapper component. Used for the `frame` prop of the
 * {@link FirebaseLogin} component. */
export type FrameFunction = (children: React.ReactNode) => React.ReactNode;

/** @ignore for backwards compatibility */
export type FrameComponent = FrameFunction;

/** A {@link FrameFunction} that passes its input through unchanged. */
export const noFrame: FrameFunction = (children) => children;

/** A {@link FrameFunction} that returns a component that fills the viewport, with the input
 * centered in the middle. */
export const fullPageFrame: FrameFunction = (children) => (
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
