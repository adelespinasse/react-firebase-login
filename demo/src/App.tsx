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
        Logged in as { user.isAnonymous ? 'Anonymous' : user.email || user.phoneNumber || '(No email or phone)' }
      </p>
      Full user object:
      <pre style={{ maxWidth: '800px', overflow: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>{JSON.stringify(user, null, 2)}</pre>
      Claims:
      <pre style={{ maxWidth: '800px', overflow: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>{JSON.stringify(claims, null, 2)}</pre>
      <LogoutButton />
      <p>
        <a href="https://github.com/adelespinasse/react-firebase-login">View project on GitHub</a>
      </p>
    </div>
  );
}

function App() {
  return (
    <FirebaseLogin
      methods={['google', 'facebook', 'github', 'email', 'phone']}
      header={<h1>react-firebase-login demo</h1>}
      footer={<a href="https://github.com/adelespinasse/react-firebase-login">View project on GitHub</a>}
      frame={fullPageFrame}
    >
      <InnerContent />
    </FirebaseLogin>
  );
}

export default App;
