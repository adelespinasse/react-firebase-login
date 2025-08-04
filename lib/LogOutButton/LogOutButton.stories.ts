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

export const Default: Story = {
  args: {
    onLogOut: () => {
      alert('Signed out');
    },
  },
};
