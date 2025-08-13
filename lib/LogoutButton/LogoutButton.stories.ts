import type { Meta, StoryObj } from '@storybook/react';

import { LogoutButton } from './LogoutButton';

const meta = {
  title: 'LogoutButton',
  component: LogoutButton,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof LogoutButton>;

export default meta;

type Story = StoryObj<typeof LogoutButton>;

export const Default: Story = {
  args: {
    onLogOut: () => {
      alert('Signed out');
    },
  },
};
