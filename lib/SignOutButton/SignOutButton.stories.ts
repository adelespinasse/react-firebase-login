import type { Meta, StoryObj } from '@storybook/react';

import { SignOutButton } from './SignOutButton';

const meta = {
  title: 'SignOutButton',
  component: SignOutButton,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SignOutButton>;

export default meta;

type Story = StoryObj<typeof SignOutButton>;

export const DefaultSignInUI: Story = {
  args: {
    style: {
      backgroundColor: '#4275a4',
      color: '#fff',
      borderRadius: '0.2em',
      padding: '0.2em 1em',
      border: 'none',
      cursor: 'pointer',
    },
    onSignOut: () => {
      alert('Signed out');
    },
  },
};
