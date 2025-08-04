import type { Preview } from '@storybook/react';
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import './global.css';

initializeApp({
  apiKey: 'AIzaSyCnT91mQqEiQW6yS2lAbbezpnUX8pzk_no',
  authDomain: 'react-firebase-login-273c0.firebaseapp.com',
  projectId: 'react-firebase-login-273c0',
  storageBucket: 'react-firebase-login-273c0.firebasestorage.app',
  messagingSenderId: '716701310686',
  appId: '1:716701310686:web:dddc862d5ebabbd7af6c4f',
});

connectAuthEmulator(getAuth(), 'http://localhost:9099');


const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
