import type { Meta, StoryObj } from '@storybook/react';

import { LogOutButton } from '../LogOutButton';
import { SimpleLogInPage } from './SimpleLogInPage';
import { useUser } from '../LoginUI';
import './storybook.css';

const meta = {
  title: 'SimpleLogInPage',
  component: SimpleLogInPage,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SimpleLogInPage>;

export default meta;

type Story = StoryObj<typeof SimpleLogInPage>;

function Children() {
  const { user } = useUser();
  return <div style={{ textAlign: 'center' }}>
    <h2>User: { user.email }</h2>
    <LogOutButton />
  </div>
};

export const Default: Story = {
  args: {
    methods: ['google', 'github', 'twitter', 'email'],
    header: <h1>Welcome</h1>,
    footer: <p>Please sign in to continue</p>,
    popup: true,
    children: <Children />,
  },
};

function AnonymousChildren() {
  const { user, linkProvider } = useUser();
  return <div style={{ textAlign: 'center' }}>
    <h2>User: { user.email || 'anonymous' }</h2>
    <p>UID: { user.uid }</p>
    { user.email ? <LogOutButton /> : <button onClick={linkProvider}>Sign in</button> }
  </div>
}

export const AnonymousAllowed: Story = {
  args: {
    ...Default.args,
    allowAnonymous: true,
    children: <AnonymousChildren />,
  },
};

// export const WithMultipleMethods: Story = {
//   args: {
//     ...Default.args,
//   },
// };

// export const AsPopup: Story = {
//   args: {
//     ...Default.args,
//     popup: true,
//   },
// };
