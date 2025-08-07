import { sign } from 'crypto';
import {
  FirebaseLogin,
  LogOutButton,
  useUser,
  type LogInMethod,
} from '../lib';

export type FirebaseLoginStoryProps = {
  requireVerification?: boolean;
  allowAnonymous?: boolean;
  methods?: LogInMethod[];
  popup?: boolean;
};

function InnerContent() {
  const { user, claims, signInAndLink } = useUser();
  return (
    <div className="inner-content">
      <p>
        Logged in as { user.isAnonymous ? 'Anonymous User' : user.email || '(No email)' }
      </p>
      Full user object:
      <pre style={{ maxWidth: '800px', overflow: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>{JSON.stringify(user, null, 2)}</pre>
      Claims:
      <pre style={{ maxWidth: '800px', overflow: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>{JSON.stringify(claims, null, 2)}</pre>
      { user.isAnonymous ? (
        <button onClick={signInAndLink}>
          Sign in and link account
        </button>
      ) : (
        <LogOutButton />
      )}
    </div>
  );
}

export function FirebaseLoginStory({
  requireVerification = true,
  allowAnonymous = false,
  methods = ['google', 'facebook', 'apple', 'microsoft', 'twitter', 'yahoo', 'github', 'email'],
  popup = true,
}: FirebaseLoginStoryProps) {
  return (
    <FirebaseLogin
      methods={methods}
      requireVerification={requireVerification}
      allowAnonymous={allowAnonymous}
      popup={popup}
    >
      <InnerContent />
    </FirebaseLogin>
  );
};
