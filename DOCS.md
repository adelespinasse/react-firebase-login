# react-firebase-login

This package provides a React component that makes it extremely simple to do Firebase Authentication sign-in for your React wab app.

To install:
```
npm install @aldel/react-firebase-login
```

To use, in its simplest form:
```tsx
import { initializeApp } from "firebase/app";
import { FirebaseLogin } from '@aldel/react-firebase-login';
import { firebaseConfig } from './firebaseConfig';

initializeApp(firebaseConfig);

function App() {
  return (
    <FirebaseLogin>
      Ok, you are logged in!
    </FirebaseLogin>
  );
}

export default App;
```

That shows a "Sign in with Google" button when the user is not logged in, and "Ok, you are logged in!" when they are.

Here's a more complete example:
```tsx
import { initializeApp } from "firebase/app";
import { LogoutButton, FirebaseLogin, useAuth, fullPageFrame } from '@aldel/react-firebase-login';
import { firebaseConfig } from './firebaseConfig';

initializeApp(firebaseConfig);

function InnerContent() {
  const { user } = useAuth();
  return (
    <div>
      <p>
        Logged in as { user.email || user.phoneNumber || '(No email or phone)' }
      </p>
      <LogoutButton />
    </div>
  );
}

function App() {
  return (
    <FirebaseLogin
      methods={['google', 'facebook', 'github', 'email', 'phone']}
      redirect
      header={<h1>App Name</h1>}
      footer="© 2025 by Me"
      frame={fullPageFrame}
    >
      <InnerContent />
    </FirebaseLogin>
  );
}

export default App;
```

This adds:
* When not signed in:
    * 5 different "Sign in with" buttons for different methods (default is just Google)
    * Uses `signInWithRedirect` instead of `signInWithPopup` (the default) for Google, Facebook, and GitHub
    * Header and footer elements for the sign-in UI
    * A "frame" that centers the sign-in UI in the browser window
* When signed in, displays:
    * The user's email (or phone number if they used phone login)
    * A sign out button

It looks something like this:

<img src="images/react-firebase-login.png" alt="Login UI" width="400">

For many applications, the above is probably everything you need.

## Sign-in methods

The supported methods are shown [here](types/LoginMethodName.html). You must enable and properly configure each method you are using in the Firebase console.

If the methods list only has one method and it's `"email"`, `"email_link"`, or `"phone"`, the initial list of "Sign in with ..." buttons is not shown; it immediately shows the UI for the specified method.

Some methods support their own individual options. If not using the default options, instead of including just the method name, you can put it in its own 2-member array, with the options as the second member, i.e. `[["google", googleOptions], ...]`. Method options are described below in the sections for each method.

### Email verification

By default, the user's email needs to be verified before they are considered to be signed in. Some SSO methods automatically provide verification, but some may not. The `"email_link"` method automatically verifies the email by its very nature; `"email"` does not. The `"phone"` method does not require email verification even if verification is turned on.

If email verification is required, `FirebaseLogin` will send a verification
email and tell the user to open it and click on the link. They can also click a
button to re-send the email, or another button to cancel the login.

Under the Firebase emulator, the link is printed to the console instead of being emailed.

To disable the email verification requirement, set `requireVerification={false}` in the `FirebaseLogin` props.

### SSO (OAuth) methods

The SSO options are fairly obviously named; `"twitter"` is used instead of `"x"`.

By default, these methods use `signInWithPopup` to show a popup window. To use `signInWithRedirect` instead, use the `redirect` prop in `FirebaseLogin`.

Note that `signInWithRedirect` is somewhat error-prone. Make sure you follow [best practices for redirect](https://firebase.google.com/docs/auth/web/redirect-best-practices), and be aware that it [won't work locally without the emulator](https://github.com/firebase/firebase-js-sdk/issues/7342).

#### OAuth scopes

To request additional OAuth scopes for a given SSO method, use method options:
```tsx
methods=[
  [
    "google",
    { scopes: ["scope1", "scope2"]},
  ],
]
```

### Email and password

To allow sign-in with email and password, use the `"email"` method. This is only intended for use when you have NOT enabled "Email link (passwordless login)" in the Firebase console.

You can't use both `"email"` and `"email_link"` because they are the same "provider" in Firebase Authentication with different configuration.

### Email link

If "Email link (passwordless login)" is enabled in the Firebase console, use this instead of `"email"`.

Under the Firebase emulator, the link is printed to the console instead of being emailed.

### Phone

Phone login sends a confirmation code to the given phone number and waits for the user to enter it.

Phone authentication uses Google's ReCAPTCHA in "invisible" mode. This attempts to determine that the user is probably human without popping up an actual CAPTCHA, but sometimes it will not be sure, and will show a ReCAPTCHA that the user must solve before it will send the confirmation text.

Note that phone login with real phone numbers [does not work when running locally on "localhost"](https://www.reddit.com/r/Firebase/comments/1e8pdcf/firebase_error_authinvalidappcredentials_in/). You can set up fake phone numbers for testing in the Firebase console; or you can use the Firebase Emulator to emulate authentication, in which case the confirmation code will be printed out by the emulator instead of sent via text.

