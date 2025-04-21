import type { Meta, StoryObj } from '@storybook/react';

import { SignInUI } from './SignInUI';

const meta = {
  title: 'SignInUI',
  component: SignInUI,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SignInUI>;

export default meta;

type Story = StoryObj<typeof SignInUI>;

export const DefaultSignInUI: Story = {
  args: {
    methods: ['google', 'email'],
    popup: false,
  },
};
