import { Page, test, expect } from 'playwright/test';
import { LogInMethod, LogInMethodList } from '../lib';

async function gotoTestApp({
  page,
  methods,
  requireVerification,
  allowAnonymous,
  popup,
  link,
}: {
  page: Page,
  methods?: LogInMethodList;
  requireVerification?: boolean;
  allowAnonymous?: boolean;
  popup?: boolean;
  link?: boolean;
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
  if (link !== undefined) {
    params.set('linkAccount', JSON.stringify(link));
  }
  await page.goto(`http://localhost:5173/?${params.toString()}`);
}

function uniqueEmail() {
  return `${crypto.randomUUID()}@domain.tld`;
}

// Sometimes nothing happens when the test clicks on the "Add new account"
// button in the Firebase Auth emulator's simulated SSO provider page. No idea
// why. This retries it several times until the email input appears.
async function clickAddNewAccount(page: Page) {
  for (const timeout of [500, 200, 300, 400, 500, 1000]) {
    try {
      await page.getByRole('button', { name: 'Add new account' }).click();
    } catch {
      // ignore error - in case the form just happened to load after the
      // previous check for the Email input but before the next click attempt
    }
    if (await page.getByLabel('Email').isVisible({ timeout })) {
      return;
    }
  }
}

type ProviderLabels = {
  method: Exclude<LogInMethod, 'email' | 'email_link'>;
  providerName: string;
  buttonName: string;
};

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
      await clickAddNewAccount(page);
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Display name').fill('User Name');
      await page.getByRole('button', { name: `Sign in with ${method}.com` }).click();
      await expect(page.locator('body')).toContainText(`Logged in as ${email}`);
      await expect(page.locator('body')).toContainText('"displayName": "User Name"');
      await expect(page.locator('body')).toContainText('"emailVerified": true');
      await expect(page.locator('body')).toContainText(`"providerId": "${method}.com"`);
      // Standard claim to make sure claims are available
      await expect(page.locator('body')).toContainText('"aud": "react-firebase-login-273c0"');
      await page.getByRole('button', { name: 'Sign Out' }).click();
      await expect(page.locator('body')).toContainText('Firebase Login Test');
      await expect(page.locator('#root')).not.toContainText('error', { ignoreCase: true });
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
      await clickAddNewAccount(page1);
      await page1.getByLabel('Email').fill(email);
      await page1.getByLabel('Display name').fill('User Name');
      await page1.getByRole('button', { name: `Sign in with ${method}.com` }).click();
      await expect(page.locator('body')).toContainText(`Logged in as ${email}`);
      await expect(page.locator('body')).toContainText('"displayName": "User Name"');
      await expect(page.locator('body')).toContainText('"emailVerified": true');
      await expect(page.locator('body')).toContainText(`"providerId": "${method}.com"`);
      // Standard claim to make sure claims are available
      await expect(page.locator('body')).toContainText('"aud": "react-firebase-login-273c0"');
      await page.getByRole('button', { name: 'Sign Out' }).click();
      await expect(page.locator('body')).toContainText('Firebase Login Test');
      await expect(page.locator('#root')).not.toContainText('error', { ignoreCase: true });
    });
  };

  for (const provider of providerLabels) {
    testProvider(provider);
  }
});

test.describe('Login-logout with email_link', () => {
  test('email_link login and logout', async ({ page }) => {
    const email = uniqueEmail();
    await gotoTestApp({ page, methods: ['email_link', 'google'] });
    await expect(page.getByRole('heading')).toContainText('Firebase Login Test');
    await expect(page.locator('#root')).toContainText('Sign in with Google');
    await page.getByRole('button', { name: '📧 Sign in with Email' }).click();

    // Should see the email link form
    await expect(page.locator('#root')).toContainText('Enter your email address to receive a sign-in link');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.locator('#root')).toContainText('Sign in with Google');

    // Now actually send the email link
    await page.getByRole('button', { name: '📧 Sign in with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('button', { name: 'Send Sign-In Link' }).click();
    await expect(page.locator('#root')).toContainText(`A link has been sent to ${email}`);
    await expect(page.locator('#root')).toContainText('Open the link on this device and browser to sign in');

    // Get the email link from the Firebase emulator
    const response = await fetch('http://localhost:9099/emulator/v1/projects/react-firebase-login-273c0/oobCodes');
    expect(response.ok).toBeTruthy();
    const data = await response.json();
    const code = data.oobCodes.find((code) => code.email === email);
    expect(code).toBeDefined();

    // Navigate to the sign-in link
    await page.goto(code.oobLink);

    // Should be logged in now
    await expect(page.locator('#root')).toContainText(`Logged in as ${email}`);
    await expect(page.locator('#root')).toContainText('"emailVerified": true');
    await expect(page.locator('#root')).toContainText('"displayName": null');
    await expect(page.locator('#root')).toContainText('"providerId": "password"');

    // Test logout
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.getByRole('heading')).toContainText('Firebase Login Test');
    await expect(page.locator('#root')).not.toContainText('error', { ignoreCase: true });
  });

  test('email_link show only email_link if only email_link method', async ({ page }) => {
    const email = uniqueEmail();
    await gotoTestApp({ page, methods: ['email_link'] });
    await expect(page.getByRole('heading')).toContainText('Firebase Login Test');

    // Should go straight to email link form since it's the only method
    await expect(page.locator('#root')).toContainText('Enter your email address to receive a sign-in link');
    await expect(page.getByRole('button', { name: 'Cancel' })).not.toBeVisible();

    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('button', { name: 'Send Sign-In Link' }).click();
    await expect(page.locator('#root')).toContainText(`A link has been sent to ${email}`);

    // Get the email link from the Firebase emulator
    const response = await fetch('http://localhost:9099/emulator/v1/projects/react-firebase-login-273c0/oobCodes');
    expect(response.ok).toBeTruthy();
    const data = await response.json();
    const code = data.oobCodes.find((code) => code.email === email);
    expect(code).toBeDefined();

    // Navigate to the sign-in link
    await page.goto(code.oobLink);

    // Should be logged in now
    await expect(page.locator('#root')).toContainText(`Logged in as ${email}`);
  });

  test('email_link resend link', async ({ page }) => {
    const email = uniqueEmail();
    await gotoTestApp({ page, methods: ['email_link', 'google'] });
    await expect(page.getByRole('heading')).toContainText('Firebase Login Test');
    await page.getByRole('button', { name: '📧 Sign in with Email' }).click();

    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('button', { name: 'Send Sign-In Link' }).click();
    await expect(page.locator('#root')).toContainText(`A link has been sent to ${email}`);

    // Test resend functionality
    await page.getByRole('button', { name: 'Resend Link' }).click();

    // Make sure the link was "sent" twice
    const response = await fetch('http://localhost:9099/emulator/v1/projects/react-firebase-login-273c0/oobCodes');
    expect(response.ok).toBeTruthy();
    const data = await response.json();
    const codes = data.oobCodes.filter((code) => code.email === email);
    expect(codes.length).toBe(2);
  });
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

  test('show only email if only email method', async ({ page }) => {
    const email = uniqueEmail();
    await gotoTestApp({ page, methods: ['email'] });
    await expect(page.getByRole('heading')).toContainText('Firebase Login Test');
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await page.getByText('Create one').click();
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('q1w2e3r4t5');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('q1w2e3r4t5');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.locator('#root')).toContainText(`Logged in as ${email}`);
  });
});

test.describe('Anonymous auth', () => {
  test('Anonymous then google, no linking', async ({ page }) => {
    const email = uniqueEmail();
    await gotoTestApp({ page, allowAnonymous: true });
    await expect(page.locator('#root')).toContainText('Logged in as Anonymous User');
    const anonUid = await page.locator('#uid').innerText();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('button', { name: 'Sign in with Google' }).click();
    await clickAddNewAccount(page);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Display name').fill('User Name');
    await page.getByRole('button', { name: 'Sign in with Google.com' }).click();
    await expect(page.locator('#root')).toContainText(`Logged in as ${email}`);
    await expect(page.locator('#uid')).not.toContainText(anonUid);
  });

  test('Anonymous then google, with linking', async ({ page }) => {
    const email = uniqueEmail();
    await gotoTestApp({ page, allowAnonymous: true, link: true });
    await expect(page.locator('#root')).toContainText('Logged in as Anonymous User');
    const anonUid = await page.locator('#uid').innerText();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('button', { name: 'Sign in with Google' }).click();
    await clickAddNewAccount(page);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Display name').fill('User Name');
    await page.getByRole('button', { name: 'Sign in with Google.com' }).click();
    await expect(page.locator('#root')).toContainText(`Logged in as ${email}`);
    await expect(page.locator('#uid')).toContainText(anonUid);
    await page.getByRole('button', { name: 'Sign Out' }).click();
    // After signing out, a new anonymous user is created
    await expect(page.locator('#uid')).not.toContainText(anonUid);
  });

  test('Anonymous then google popup, no linking', async ({ page }) => {
    const email = uniqueEmail();
    await gotoTestApp({ page, allowAnonymous: true, popup: true });
    await expect(page.locator('#root')).toContainText('Logged in as Anonymous User');
    const anonUid = await page.locator('#uid').innerText();
    await page.getByRole('button', { name: 'Sign in' }).click();
    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Sign in with Google' }).click();
    const page1 = await page1Promise;
    await expect(page1.locator('body')).toContainText('Sign-in with google.com', { ignoreCase: true });
    await clickAddNewAccount(page1);
    await page1.getByLabel('Email').fill(email);
    await page1.getByLabel('Display name').fill('User Name');
    await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();
    await expect(page.locator('#root')).toContainText(`Logged in as ${email}`);
    await expect(page.locator('#uid')).not.toContainText(anonUid);
  });

  test('Anonymous then google popup, with linking', async ({ page }) => {
    const email = uniqueEmail();
    await gotoTestApp({ page, allowAnonymous: true, popup: true, link: true });
    await expect(page.locator('#root')).toContainText('Logged in as Anonymous User');
    const anonUid = await page.locator('#uid').innerText();
    await page.getByRole('button', { name: 'Sign in' }).click();
    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Sign in with Google' }).click();
    const page1 = await page1Promise;
    await expect(page1.locator('body')).toContainText('Sign-in with google.com', { ignoreCase: true });
    await clickAddNewAccount(page1);
    await page1.getByLabel('Email').fill(email);
    await page1.getByLabel('Display name').fill('User Name');
    await page1.getByRole('button', { name: 'Sign in with Google.com' }).click();
    await expect(page.locator('#root')).toContainText(`Logged in as ${email}`);
    await expect(page.locator('#uid')).toContainText(anonUid);
    await page.getByRole('button', { name: 'Sign Out' }).click();
    // After signing out, a new anonymous user is created
    await expect(page.locator('#uid')).not.toContainText(anonUid);
  });

  test('Anonymous then email, no linking', async ({ page }) => {
    const email = uniqueEmail();
    await gotoTestApp({ page, methods: ['google', 'email'], allowAnonymous: true });
    await expect(page.locator('#root')).toContainText('Logged in as Anonymous User');
    const anonUid = await page.locator('#uid').innerText();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('button', { name: '📧 Sign in with Email' }).click();
    // From anonymous, email sign-in goes directly to account creation
    // await page.getByText('Create one').click();
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('q1w2e3r4t5');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('q1w2e3r4t5');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.locator('#root')).toContainText(`Logged in as ${email}`);
    await expect(page.locator('#uid')).not.toContainText(anonUid);
  });

  test('Anonymous then email, with linking', async ({ page }) => {
    const email = uniqueEmail();
    await gotoTestApp({ page, methods: ['google', 'email'], allowAnonymous: true, link: true });
    await expect(page.locator('#root')).toContainText('Logged in as Anonymous User');
    const anonUid = await page.locator('#uid').innerText();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('button', { name: '📧 Sign in with Email' }).click();
    // From anonymous, email sign-in goes directly to account creation
    // await page.getByText('Create one').click();
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('q1w2e3r4t5');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('q1w2e3r4t5');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.locator('#root')).toContainText(`Logged in as ${email}`);
    await expect(page.locator('#uid')).toContainText(anonUid);
  });

  test('Anonymous, start sign in, then cancel', async ({ page }) => {
    await gotoTestApp({ page, allowAnonymous: true });
    await expect(page.locator('#root')).toContainText('Logged in as Anonymous User');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.locator('#root')).toContainText('Sign in with Google');
    await page.getByRole('button', { name: '🗙' }).click();
    await expect(page.locator('#root')).toContainText('Logged in as Anonymous User');
  });

  test('Anonymous then email, verification required', async ({ page }) => {
    const email = uniqueEmail();
    await gotoTestApp({ page, methods: ['email', 'google'], requireVerification: true, allowAnonymous: true });
    await expect(page.locator('#root')).toContainText('Logged in as Anonymous User');
    const anonUid = await page.locator('#uid').innerText();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('button', { name: '📧 Sign in with Email' }).click();
    // From anonymous, email sign-in goes directly to account creation
    // await page.getByText('Create one').click();
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
    await expect(page.locator('#uid')).not.toContainText(anonUid);
  });

  test('Anonymous then email_link, no linking', async ({ page }) => {
    const email = uniqueEmail();
    await gotoTestApp({ page, methods: ['google', 'email_link'], allowAnonymous: true });
    await expect(page.locator('#root')).toContainText('Logged in as Anonymous User');
    const anonUid = await page.locator('#uid').innerText();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('button', { name: '📧 Sign in with Email' }).click();

    // Should see the email link form
    await expect(page.locator('#root')).toContainText('Enter your email address to receive a sign-in link');
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('button', { name: 'Send Sign-In Link' }).click();
    await expect(page.locator('#root')).toContainText(`A link has been sent to ${email}`);

    // Get the email link from the Firebase emulator
    const response = await fetch('http://localhost:9099/emulator/v1/projects/react-firebase-login-273c0/oobCodes');
    expect(response.ok).toBeTruthy();
    const data = await response.json();
    const code = data.oobCodes.find((code) => code.email === email);
    expect(code).toBeDefined();

    // Navigate to the sign-in link
    await page.goto(code.oobLink);

    // Should be logged in now with new user (no linking)
    await expect(page.locator('#root')).toContainText(`Logged in as ${email}`);
    await expect(page.locator('#uid')).not.toContainText(anonUid);
  });

  test('Anonymous then email_link, with linking', async ({ page }) => {
    const email = uniqueEmail();
    await gotoTestApp({ page, methods: ['google', 'email_link'], allowAnonymous: true, link: true });
    await expect(page.locator('#root')).toContainText('Logged in as Anonymous User');
    const anonUid = await page.locator('#uid').innerText();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('button', { name: '📧 Sign in with Email' }).click();

    // Should see the email link form
    await expect(page.locator('#root')).toContainText('Enter your email address to receive a sign-in link');
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('button', { name: 'Send Sign-In Link' }).click();
    await expect(page.locator('#root')).toContainText(`A link has been sent to ${email}`);

    // Get the email link from the Firebase emulator
    const response = await fetch('http://localhost:9099/emulator/v1/projects/react-firebase-login-273c0/oobCodes');
    expect(response.ok).toBeTruthy();
    const data = await response.json();
    const code = data.oobCodes.find((code) => code.email === email);
    expect(code).toBeDefined();

    // Navigate to the sign-in link
    await page.goto(code.oobLink);

    // Should be logged in now with same UID (linking worked)
    await expect(page.locator('#root')).toContainText(`Logged in as ${email}`);
    await expect(page.locator('#uid')).toContainText(anonUid);
  });
});
