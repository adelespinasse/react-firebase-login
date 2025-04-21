import type { Meta, StoryObj } from '@storybook/react';

import { LogInUI } from './LogInUI';

const meta = {
  title: 'LogInUI',
  component: LogInUI,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof LogInUI>;

export default meta;

type Story = StoryObj<typeof LogInUI>;

export const DefaultLogInUI: Story = {
  args: {
    methods: ['google', 'email'],
    popup: false,
  },
};
