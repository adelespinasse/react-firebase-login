import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { LogOutButton, SimpleLogInPage } from '../../lib';

import { firebaseConfig } from './firebaseConfig';
import './main.css';

initializeApp(firebaseConfig);

function InnerContent() {
  return (
    <div className="inner-content">
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
      methods={[
        'google', 'facebook', 'apple', 'microsoft',
        'twitter', 'yahoo', 'github', 'email',
      ]}
      requireVerification
      popup
      header={<h1>Demo App</h1>}
    >
      <InnerContent />
    </SimpleLogInPage>
  );
}

export default App;
