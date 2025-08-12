import {
  FirebaseLogin,
  LogOutButton,
  useUser,
  type LogInMethod,
} from '../lib';

function InnerContent() {
  const { user, claims, signInAndLink } = useUser();
  return (
    <div className="inner-content">
      <p>
        Logged in as { user.isAnonymous ? 'Anonymous User' : user.email || '(No email)' }
      </p>
      <div>
        { user.isAnonymous ? (
          <button onClick={signInAndLink}>
            Sign in and link account
          </button>
        ) : (
          <LogOutButton />
        )}
      </div>
      Full user object:
      <pre style={{ maxWidth: '800px', overflow: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>{JSON.stringify(user, null, 2)}</pre>
      Claims:
      <pre style={{ maxWidth: '800px', overflow: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>{JSON.stringify(claims, null, 2)}</pre>
    </div>
  );
}

export function FirebaseLoginStory() {
  const params = new URLSearchParams(window.location.search);
  const methods = JSON.parse(params.get('methods') || '["google"]') as LogInMethod[];
  const requireVerification = params.get('requireVerification') === 'true';
  const allowAnonymous = params.get('allowAnonymous') === 'true';
  const popup = params.get('popup') === 'true';
  console.log(methods, requireVerification, allowAnonymous, popup);
  return (
    <FirebaseLogin
      methods={methods}
      requireVerification={requireVerification}
      allowAnonymous={allowAnonymous}
      popup={popup}
      header={<h2>Firebase Login Test</h2>}
      footer={<p>login test footer</p>}
    >
      <InnerContent />
    </FirebaseLogin>
  );
};

export default FirebaseLoginStory;
