**LICENSE NOTICE:** This is **not "free software".** This package is released under a [dual license](https://rfldocs.web.app/documents/LICENSE.html): you can use it for free in applications, with a **user-visible attribution notice**, or license it [for a fee](https://rfldocs.web.app/documents/PRICING.html) to use without the attribution notice. See the [license](https://rfldocs.web.app/documents/LICENSE.html) for full details.

Send inquiries to [me](mailto:adelespinasse@gmail.com).

# @aldel/react-firebase-login

A set of React components that make it stupidly simple to add Firebase Authentication login to a React web app.

Using it can be as simple as this:
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
That looks like this when the user is not signed in:

<img src="https://rfldocs.web.app/media/rfl-simplest.png" alt="Login UI" width="300">

And like this when they are:

<img src="https://rfldocs.web.app/media/rfl-simplest-authed.png" alt="Logged in" width="288">

[Full documentation](https://rfldocs.web.app)

[Live demo](https://react-firebase-login-273c0.firebaseapp.com/)

## Features

* Support for all built-in web authentication methods: Google, Apple, Facebook, GitHub, Microsoft, Twitter/X, Yahoo, email and password, email link, phone, and anonymous
* Use popup or redirect for SSO providers
* Optionally require email verification
* Easy access to user info and custom claims
* Sign in again without signing out (with option to link current account to new credentials, e.g. convert anonymous user to named user)
* Request additional scopes
* Customizable user interface

## License

[Dual community / commercial license](https://rfldocs.web.app/documents/LICENSE.html)

(c) 2025 Alan deLespinasse
