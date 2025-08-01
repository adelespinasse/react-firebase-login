import type { Meta, StoryObj } from '@storybook/react';
import { LoginUI } from './LoginUI';

const meta = {
  title: 'LoginUI',
  component: LoginUI,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof LoginUI>;

export default meta;

type Story = StoryObj<typeof LoginUI>;

export const Default: Story = {
  args: {
    popup: false,
  },
};

export const MultipleMethods: Story = {
  args: {
    methods: ['google', 'apple', 'github', 'facebook', 'email'],
    popup: false,
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