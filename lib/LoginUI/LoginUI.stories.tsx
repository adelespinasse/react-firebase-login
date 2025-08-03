import type { Meta, StoryObj } from '@storybook/react';
import { LoginUI, useUser } from './LoginUI';
import { LogOutButton } from '../LogOutButton';

const meta = {
  title: 'LoginUI',
  component: LoginUI,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof LoginUI>;

export default meta;

type Story = StoryObj<typeof LoginUI>;

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
    children: <UserProfile />,
  },
};

export const MultipleMethods: Story = {
  args: {
    methods: ['google', 'apple', 'github', 'facebook', 'email'],
    popup: false,
    children: <UserProfile />,
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
    frame: ({ children }) => (
      <div style={{ border: '2px solid #ccc', padding: '2rem', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>Welcome Back</h2>
        {children}
        <p style={{ marginBottom: 0, fontSize: '0.8em', color: '#666' }}>
          By signing in, you agree to our terms.
        </p>
      </div>
    ),
  },
};