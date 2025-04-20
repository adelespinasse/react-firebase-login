import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Meta, StoryObj } from '@storybook/react';

import { SignInUI } from './SignInUI';

const app = initializeApp({
  apiKey: "AIzaSyAt8ymfLnd0CdKboP6qr5TkO0CPJ5cUlKE",
  authDomain: "chatnozzle.firebaseapp.com",
  projectId: "chatnozzle",
  storageBucket: "chatnozzle.firebasestorage.app",
  messagingSenderId: "230785758971",
  appId: "1:230785758971:web:0d4084bde042cc4597e25e"
});
const auth = getAuth(app);

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
    auth,
    methods: ['google', 'email'],
    popup: false,
  },
};
