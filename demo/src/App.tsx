import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

import { LogoutButton, FirebaseLogin, useAuth, fullPageFrame } from '../../lib';

import { firebaseConfig } from './firebaseConfig';
import './main.css';

initializeApp(firebaseConfig);

if (import.meta.env.DEV) {
  connectAuthEmulator(getAuth(), 'http://localhost:9099');
}

function InnerContent() {
  const { user, claims } = useAuth();
  return (
    <div className="inner-content">
      <p>
        Logged in as { user.email }
      </p>
      Full user object:
      <pre style={{ maxWidth: '800px', overflow: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>{JSON.stringify(user, null, 2)}</pre>
      Claims:
      <pre style={{ maxWidth: '800px', overflow: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>{JSON.stringify(claims, null, 2)}</pre>
      <LogoutButton />
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
      header={<h1>Demo App</h1>}
      frame={fullPageFrame}
    >
      <InnerContent />
    </FirebaseLogin>
  );
}

export default App;
