import type { Meta, StoryObj } from '@storybook/react';
import { FirebaseLogin } from './FirebaseLogin';
import { useAuth } from './useAuth';
import { LogoutButton } from '../LogoutButton';
import { fullPageFrame } from '../frames';

const meta = {
  title: 'FirebaseLogin',
  component: FirebaseLogin,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof FirebaseLogin>;

export default meta;

type Story = StoryObj<typeof FirebaseLogin>;

function UserProfile() {
  const { user } = useAuth();
  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Welcome, {user.email || 'User'}!</h2>
      <p>UID: {user.uid}</p>
      <LogoutButton />
    </div>
  );
}

export const Default: Story = {
  args: {
    redirect: false,
    requireVerification: false,
    header: <h2>Welcome</h2>,
    footer: 'Please sign in to continue',
    children: <UserProfile />,
  },
};

export const MultipleMethods: Story = {
  args: {
    ...Default.args,
    methods: ['google', 'apple', 'github', 'facebook', 'email'],
  },
};

export const WithRedirect: Story = {
  args: {
    ...Default.args,
    redirect: true,
  },
};

export const WithFrame: Story = {
  args: {
    ...Default.args,
    frame: (children) => (
      <div style={{ border: '2px solid #ccc', padding: '2rem', borderRadius: '8px' }}>
        <p>extra header</p>
        {children}
        <p style={{ marginBottom: 0, fontSize: '0.8em', color: '#666' }}>
          extra footer
        </p>
      </div>
    ),
  },
};

export const WithFullPageFrame: Story = {
  args: {
    ...Default.args,
    frame: fullPageFrame,
  },
};

function AnonymousChildren() {
  const { user, signIn } = useAuth();
  return <div style={{ textAlign: 'center' }}>
    <h2>User: { user.email || 'anonymous' }</h2>
    <p>UID: { user.uid }</p>
    { user.email ? <h3>Signed in</h3> : <button onClick={() => signIn()}>Sign in</button> }
  </div>
}

export const AnonymousAllowed: Story = {
  args: {
    ...Default.args,
    methods: ['google', 'email'],
    allowAnonymous: true,
    redirect: false,
    children: <AnonymousChildren />,
  },
};
