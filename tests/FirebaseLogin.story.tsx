import {
  FirebaseLogin,
  fullPageFrame,
  LogoutButton,
  useAuth,
  type LoginMethodList,
  type PhoneInputComponentProps,
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

function AltPhoneInputComponent({ value, onChange, disabled }: PhoneInputComponentProps) {
  return (
    <div style={{ border: '2px solid #00c' }}>
      <p>This is an alternative phone input</p>
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Phone numberrr"
        style={{ border: '3px solid #00c' }}
        disabled={disabled}
      />
    </div>
  );
}

export function FirebaseLoginStory() {
  const params = new URLSearchParams(window.location.search);
  const methodList = JSON.parse(params.get('methods') || '["google"]');
  const methods = methodList.map((method) => (
    method[0] === 'phone' && method[1] === 'altInput'
      ? ['phone', { inputComponent: AltPhoneInputComponent }]
      : method
  )) as LoginMethodList;
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
