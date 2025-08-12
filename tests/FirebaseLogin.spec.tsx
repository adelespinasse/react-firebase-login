import { Page, test, expect } from 'playwright/test';
import { LogInMethod } from '../lib';

async function gotoTestApp({
  page,
  methods,
  requireVerification,
  allowAnonymous,
  popup,
}: {
  page: Page,
  methods?: LogInMethod[];
  requireVerification?: boolean;
  allowAnonymous?: boolean;
  popup?: boolean;
}) {
  const params = new URLSearchParams();
  if (methods !== undefined) {
    params.set('methods', JSON.stringify(methods));
  }
  if (requireVerification !== undefined) {
    params.set('requireVerification', JSON.stringify(requireVerification));
  }
  if (allowAnonymous !== undefined) {
    params.set('allowAnonymous', JSON.stringify(allowAnonymous));
  }
  if (popup !== undefined) {
    params.set('popup', JSON.stringify(popup));
  }
  await page.goto(`http://localhost:5173/?${params.toString()}`);
}

function uniqueEmail() {
  return `${crypto.randomUUID()}@domain.tld`;
}

type ProviderLabels = { method: LogInMethod; providerName: string; buttonName: string };

const providerLabels: ProviderLabels[] = [
  { method: 'google', providerName: 'Google', buttonName: 'Google' },
  { method: 'facebook', providerName: 'Facebook', buttonName: 'Facebook' },
  { method: 'github', providerName: 'Github', buttonName: 'GitHub' },
  { method: 'twitter', providerName: 'Twitter', buttonName: 'X' },
  { method: 'apple', providerName: 'Apple', buttonName: 'Apple' },
  { method: 'microsoft', providerName: 'Microsoft', buttonName: 'Microsoft' },
  { method: 'yahoo', providerName: 'Yahoo', buttonName: 'Yahoo' },
];

test.describe('SSO login-out w redirect', () => {
  const testProvider = ({ method, buttonName }: ProviderLabels) => {
    test(`using ${method}`, async ({ page }) => {
      const email = uniqueEmail();
      await gotoTestApp({ page, methods: [method, 'email'] });
      await expect(page.locator('body')).toContainText('Firebase Login Test');
      await expect(page.locator('body')).toContainText('login test footer');
      await page.getByRole('button', { name: `Sign in with ${buttonName}` }).click();
      await expect(page.locator('body')).toContainText(`Sign-in with ${method}.com`, { ignoreCase: true });
      await page.getByRole('button', { name: 'Add new account' }).click();
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Display name').fill('User Name');
      await page.getByRole('button', { name: `Sign in with ${method}.com` }).click();
      await expect(page.locator('body')).toContainText(`Logged in as ${email}`);
      await expect(page.locator('body')).toContainText('"displayName": "User Name"');
      await expect(page.locator('body')).toContainText('"emailVerified": true');
      await expect(page.locator('body')).toContainText(`"providerId": "${method}.com"`);
      await page.getByRole('button', { name: 'Sign Out' }).click();
      await expect(page.locator('body')).toContainText('Firebase Login Test');
    });
  };

  for (const provider of providerLabels) {
    testProvider(provider);
  }
});

test.describe('SSO login-out w popup', () => {
  const testProvider = ({ method, buttonName }: ProviderLabels) => {
    test(`using ${method}`, async ({ page }) => {
      const email = uniqueEmail();
      await gotoTestApp({ page, methods: [method, 'email'], popup: true });
      await expect(page.locator('body')).toContainText('Firebase Login Test');
      await expect(page.locator('body')).toContainText('login test footer');
      const page1Promise = page.waitForEvent('popup');
      await page.getByRole('button', { name: `Sign in with ${buttonName}` }).click();
      const page1 = await page1Promise;
      await expect(page1.locator('body')).toContainText(`Sign-in with ${method}.com`, { ignoreCase: true });
      await page1.getByRole('button', { name: 'Add new account' }).click();
      await page1.getByLabel('Email').fill(email);
      await page1.getByLabel('Display name').fill('User Name');
      await page1.getByRole('button', { name: `Sign in with ${method}.com` }).click();
      await expect(page.locator('body')).toContainText(`Logged in as ${email}`);
      await expect(page.locator('body')).toContainText('"displayName": "User Name"');
      await expect(page.locator('body')).toContainText('"emailVerified": true');
      await expect(page.locator('body')).toContainText(`"providerId": "${method}.com"`);
      await page.getByRole('button', { name: 'Sign Out' }).click();
      await expect(page.locator('body')).toContainText('Firebase Login Test');
    });
  };

  for (const provider of providerLabels) {
    testProvider(provider);
  }
});

test.describe('Login-logout with email', () => {
  test('verification not required', async ({ page }) => {
    const email = uniqueEmail();
    await gotoTestApp({ page, methods: ['email', 'google'], requireVerification: false });
    await expect(page.getByRole('heading')).toContainText('Firebase Login Test');
    await expect(page.locator('#root')).toContainText('Sign in with Google');
    await page.getByRole('button', { name: '📧 Sign in with Email' }).click();
    await expect(page.locator('form')).toContainText('Don\'t have an account? Create one');
    await expect(page.locator('form')).toContainText('Forgot password?');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.locator('#root')).toContainText('Sign in with Google');

    await page.getByRole('button', { name: '📧 Sign in with Email' }).click();
    await page.getByText('Create one').click();
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('q1w2e3r4t5');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('q1w2e3r4');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.locator('#root')).toContainText('Error: Passwords do not match');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('q1w2e3r4t5');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.locator('#root')).toContainText(`Logged in as ${email}`);
    await expect(page.locator('#root')).toContainText('"emailVerified": false');
    await expect(page.locator('#root')).toContainText('"displayName": null');
    await expect(page.locator('#root')).toContainText('"providerId": "password"');
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.getByRole('heading')).toContainText('Firebase Login Test');

    // await page.getByRole('button', { name: '📧 Sign in with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill('lskdjflkj122983@domain.tld');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('q1w2e3r4t56');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.locator('#root')).toContainText('user not found');

    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.locator('#root')).toContainText('wrong password');

    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('q1w2e3r4t5');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.locator('#root')).toContainText(`Logged in as ${email}`);
  });

  test('verification required', async ({ page }) => {
    const email = uniqueEmail();
    await gotoTestApp({ page, methods: ['email', 'google'], requireVerification: true });
    await expect(page.getByRole('heading')).toContainText('Firebase Login Test');
    await expect(page.locator('#root')).toContainText('Sign in with Google');
    await page.getByRole('button', { name: '📧 Sign in with Email' }).click();
    await page.getByText('Create one').click();
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('q1w2e3r4t5');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('q1w2e3r4t5');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.locator('#root')).toContainText(`A verification link has been sent to ${email}`);
    await expect(page.locator('#root')).not.toContainText('error', { ignoreCase: true });

    // Simulate user clicking the verification link in their email. The
    // Firebase Emulator provides an API for things like this.
    const response = await fetch('http://localhost:9099/emulator/v1/projects/react-firebase-login-273c0/oobCodes');
    expect(response.ok).toBeTruthy();
    const data = await response.json();
    const code = data.oobCodes.find((code) => code.email === email);
    expect(code).toBeDefined();
    const verifyResponse = await fetch(code.oobLink);
    expect(verifyResponse.ok).toBeTruthy();

    await page.getByText('click here').click();
    await expect(page.locator('#root')).toContainText(`Logged in as ${email}`);
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.getByRole('heading')).toContainText('Firebase Login Test');
  });

  test('resend verification email', async ({ page }) => {
    const email = uniqueEmail();
    await gotoTestApp({ page, methods: ['email', 'google'], requireVerification: true });
    await expect(page.getByRole('heading')).toContainText('Firebase Login Test');
    await expect(page.locator('#root')).toContainText('Sign in with Google');
    await page.getByRole('button', { name: '📧 Sign in with Email' }).click();
    await page.getByText('Create one').click();
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('q1w2e3r4t5');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('q1w2e3r4t5');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.locator('#root')).toContainText(`A verification link has been sent to ${email}`);
    await expect(page.locator('#root')).not.toContainText('error', { ignoreCase: true });
    await page.getByRole('button', { name: 'Resend email' }).click();

    // Make sure the "email" was "sent" twice.
    const response = await fetch('http://localhost:9099/emulator/v1/projects/react-firebase-login-273c0/oobCodes');
    expect(response.ok).toBeTruthy();
    const data = await response.json();
    const codes = data.oobCodes.filter((code) => code.email === email);
    expect(codes.length).toBe(2);
  });
});
