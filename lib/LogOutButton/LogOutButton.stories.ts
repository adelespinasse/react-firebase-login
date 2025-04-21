import type { Meta, StoryObj } from '@storybook/react';

import { LogOutButton } from './LogOutButton';

const meta = {
  title: 'LogOutButton',
  component: LogOutButton,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof LogOutButton>;

export default meta;

type Story = StoryObj<typeof LogOutButton>;

export const DefaultLogInUI: Story = {
  args: {
    style: {
      backgroundColor: '#4275a4',
      color: '#fff',
      borderRadius: '0.2em',
      padding: '0.2em 1em',
      border: 'none',
      cursor: 'pointer',
    },
    onLogOut: () => {
      alert('Signed out');
    },
  },
};
