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
    popup: false,
  },
};

export const Popup: Story = {
  args: {
    ...DefaultLogInUI.args,
    popup: true,
  },
};

export const MoreMethods: Story = {
  args: {
    ...DefaultLogInUI.args,
    methods: ['google', 'apple', 'github', 'twitter', 'email'],
  },
};