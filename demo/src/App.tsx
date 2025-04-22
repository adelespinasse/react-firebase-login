import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { LogOutButton, SimpleLogInPage } from '../../lib';

const firebaseConfig = {
  apiKey: "AIzaSyCnT91mQqEiQW6yS2lAbbezpnUX8pzk_no",
  authDomain: "react-firebase-login-273c0.firebaseapp.com",
  projectId: "react-firebase-login-273c0",
};

initializeApp(firebaseConfig);

function InnerContent() {
  return (
    <div>
      <p>
        Logged in as { getAuth().currentUser?.email }
      </p>
      <LogOutButton />
    </div>
  );
}

function App() {
  return (
    <SimpleLogInPage
      methods={['email', 'google']}
      popup
      header={<h1>Demo App</h1>}
    >
      <InnerContent />
    </SimpleLogInPage>
  );
}

export default App;
