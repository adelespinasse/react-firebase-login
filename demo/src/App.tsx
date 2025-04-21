import React from 'react';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { SignInUI, SignOutButton, RequireLogin } from '../../lib';

const firebaseConfig = {
  apiKey: "AIzaSyCnT91mQqEiQW6yS2lAbbezpnUX8pzk_no",
  authDomain: "react-firebase-login-273c0.firebaseapp.com",
  projectId: "react-firebase-login-273c0",
  storageBucket: "react-firebase-login-273c0.firebasestorage.app",
  messagingSenderId: "716701310686",
  appId: "1:716701310686:web:dddc862d5ebabbd7af6c4f"
};

initializeApp(firebaseConfig);

function App() {
  return (
    <div className="App">
      <RequireLogin loginComponent={<SignInUI methods={['email', 'google']} popup />}>
        <div>
          Logged in as { getAuth().currentUser?.email }
        </div>
        <SignOutButton />
      </RequireLogin>
    </div>
  );
}

export default App;
