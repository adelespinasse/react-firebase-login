import { initializeApp } from "firebase/app";

import { LogOutButton, FirebaseLogin, useUser, FullPageFrame } from '../../lib';

import { firebaseConfig } from './firebaseConfig';
import './main.css';

initializeApp(firebaseConfig);

function InnerContent() {
  const { user, claims } = useUser();
  return (
    <div className="inner-content">
      <p>
        Logged in as { user.email }
      </p>
      Full user object:
      <pre style={{ maxWidth: '800px', overflow: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>{JSON.stringify(user, null, 2)}</pre>
      Claims:
      <pre style={{ maxWidth: '800px', overflow: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>{JSON.stringify(claims, null, 2)}</pre>
      <LogOutButton />
    </div>
  );
}

function App() {
  return (
    <FirebaseLogin
      methods={[
        'google', 'facebook', 'apple', 'microsoft',
        'twitter', 'yahoo', 'github', 'email',
      ]}
      requireVerification
      popup
      header={<h1>Demo App</h1>}
      frame={FullPageFrame}
    >
      <InnerContent />
    </FirebaseLogin>
  );
}

export default App;
