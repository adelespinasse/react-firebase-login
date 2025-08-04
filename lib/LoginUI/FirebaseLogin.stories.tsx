import type { Meta, StoryObj } from '@storybook/react';
import { FirebaseLogin, useUser } from './FirebaseLogin';
import { LogOutButton } from '../LogOutButton';
import { FullPageFrame } from '../frames';

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
  const { user } = useUser();
  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Welcome, {user.email || 'User'}!</h2>
      <p>UID: {user.uid}</p>
      <LogOutButton />
    </div>
  );
}

export const Default: Story = {
  args: {
    popup: false,
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

export const WithPopup: Story = {
  args: {
    ...Default.args,
    popup: true,
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
    frame: FullPageFrame,
  },
};

function AnonymousChildren() {
  const { user, signInAndLink } = useUser();
  return <div style={{ textAlign: 'center' }}>
    <h2>User: { user.email || 'anonymous' }</h2>
    <p>UID: { user.uid }</p>
    { user.email ? <h3>Signed in</h3> : <button onClick={signInAndLink}>Sign in</button> }
  </div>
}

export const AnonymousAllowed: Story = {
  args: {
    ...Default.args,
    methods: ['google', 'email'],
    allowAnonymous: true,
    popup: true,
    children: <AnonymousChildren />,
  },
};
