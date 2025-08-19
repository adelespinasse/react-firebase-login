import {
  FirebaseLogin,
  fullPageFrame,
  LogoutButton,
  useAuth,
  type LoginMethodList,
} from '../lib';

function InnerContent({ link }: { link: boolean }) {
  const { user, claims, signIn } = useAuth();
  return (
    <div className="inner-content">
      <p>
        Logged in as { user.isAnonymous ? 'Anonymous User' : user.email || user.phoneNumber || '(No email)' }
      </p>
      <pre id="uid">{user.uid}</pre>
      <p>
        { user.isAnonymous ? (
          <button onClick={() => signIn(link)}>
            Sign in
          </button>
        ) : (
          <LogoutButton />
        )}
      </p>
      User object:
      <pre style={{ maxWidth: '800px', overflow: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>{JSON.stringify(user, null, 2)}</pre>
      Claims:
      <pre style={{ maxWidth: '800px', overflow: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>{JSON.stringify(claims, null, 2)}</pre>
    </div>
  );
}

export function FirebaseLoginStory() {
  const params = new URLSearchParams(window.location.search);
  const methods = JSON.parse(params.get('methods') || '["google"]') as LoginMethodList;
  const requireVerification = params.get('requireVerification') === 'true';
  const allowAnonymous = params.get('allowAnonymous') === 'true';
  // For historical reasons, we use popup=true instead of redirect=false.
  const popup = params.get('popup') === 'true';
  const link = params.get('linkAccount') === 'true';
  return (
    <FirebaseLogin
      methods={methods}
      requireVerification={requireVerification}
      allowAnonymous={allowAnonymous}
      redirect={!popup}
      header={<h2>Firebase Login Test</h2>}
      footer={<p>login test footer</p>}
      frame={fullPageFrame}
    >
      <InnerContent link={link} />
    </FirebaseLogin>
  );
};

export default FirebaseLoginStory;
