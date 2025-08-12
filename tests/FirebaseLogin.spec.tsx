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

test.describe('FirebaseLogin E2E Tests', () => {
  test('Log in and out with Google', async ({ page }) => {
    await gotoTestApp({ page, methods: ['google', 'facebook'] });
    await expect(page.locator('body')).toContainText('Firebase Login Test');
    await expect(page.locator('body')).toContainText('login test footer');
    await page.getByRole('button', { name: 'Sign in with Google' }).click();
    await expect(page.locator('body')).toContainText('Sign-in with Google.com');
    await page.getByRole('button', { name: 'Add new account' }).click();
    await page.getByLabel('Email').fill('username1@domain.tld');
    await page.getByLabel('Display name').fill('User Name');
    await page.getByRole('button', { name: 'Sign in with Google.com' }).click();
    await expect(page.locator('body')).toContainText('Logged in as username1@domain.tld');
    await expect(page.locator('body')).toContainText('"displayName": "User Name"');
    await expect(page.locator('body')).toContainText('"emailVerified": true');
    await expect(page.locator('body')).toContainText('"providerId": "google.com"');
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.locator('body')).toContainText('Firebase Login Test');
  });

  test('Log in and out with Facebook', async ({ page }) => {
    await gotoTestApp({ page, methods: ['google', 'facebook', 'email'] });
    await expect(page.locator('body')).toContainText('Firebase Login Test');
    await expect(page.locator('body')).toContainText('login test footer');
    await page.getByRole('button', { name: 'Sign in with Facebook' }).click();
    await expect(page.locator('body')).toContainText('Sign-in with Facebook.com');
    await page.getByRole('button', { name: 'Add new account' }).click();
    await page.getByLabel('Email').fill('username2@domain.tld');
    await page.getByLabel('Display name').fill('User Name');
    await page.getByRole('button', { name: 'Sign in with Facebook.com' }).click();
    await expect(page.locator('body')).toContainText('Logged in as username2@domain.tld');
    await expect(page.locator('body')).toContainText('"displayName": "User Name"');
    await expect(page.locator('body')).toContainText('"emailVerified": true');
    await expect(page.locator('body')).toContainText('"providerId": "facebook.com"');
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.locator('body')).toContainText('Firebase Login Test');
  });

  test('Log in and out with GitHub', async ({ page }) => {
    await gotoTestApp({ page, methods: ['google', 'github', 'email'] });
    await expect(page.locator('body')).toContainText('Firebase Login Test');
    await expect(page.locator('body')).toContainText('login test footer');
    await page.getByRole('button', { name: 'Sign in with Github' }).click();
    await expect(page.locator('body')).toContainText('Sign-in with Github.com');
    await page.getByRole('button', { name: 'Add new account' }).click();
    await page.getByLabel('Email').fill('username3@domain.tld');
    await page.getByLabel('Display name').fill('User Name');
    await page.getByRole('button', { name: 'Sign in with Github.com' }).click();
    await expect(page.locator('body')).toContainText('Logged in as username3@domain.tld');
    await expect(page.locator('body')).toContainText('"displayName": "User Name"');
    await expect(page.locator('body')).toContainText('"emailVerified": true');
    await expect(page.locator('body')).toContainText('"providerId": "github.com"');
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.locator('body')).toContainText('Firebase Login Test');
  });

  test('Log in and out with Twitter', async ({ page }) => {
    await gotoTestApp({ page, methods: ['google', 'twitter', 'email'] });
    await expect(page.locator('body')).toContainText('Firebase Login Test');
    await expect(page.locator('body')).toContainText('login test footer');
    await page.getByRole('button', { name: 'Sign in with X' }).click();
    await expect(page.locator('body')).toContainText('Sign-in with Twitter.com');
    await page.getByRole('button', { name: 'Add new account' }).click();
    await page.getByLabel('Email').fill('username4@domain.tld');
    await page.getByLabel('Display name').fill('User Name');
    await page.getByRole('button', { name: 'Sign in with Twitter.com' }).click();
    await expect(page.locator('body')).toContainText('Logged in as username4@domain.tld');
    await expect(page.locator('body')).toContainText('"displayName": "User Name"');
    await expect(page.locator('body')).toContainText('"emailVerified": true');
    await expect(page.locator('body')).toContainText('"providerId": "twitter.com"');
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.locator('body')).toContainText('Firebase Login Test');
  });

  test('Log in and out with Apple', async ({ page }) => {
    await gotoTestApp({ page, methods: ['google', 'apple', 'email'] });
    await expect(page.locator('body')).toContainText('Firebase Login Test');
    await expect(page.locator('body')).toContainText('login test footer');
    await page.getByRole('button', { name: 'Sign in with Apple' }).click();
    await expect(page.locator('body')).toContainText('Sign-in with Apple.com');
    await page.getByRole('button', { name: 'Add new account' }).click();
    await page.getByLabel('Email').fill('username5@domain.tld');
    await page.getByLabel('Display name').fill('User Name');
    await page.getByRole('button', { name: 'Sign in with Apple.com' }).click();
    await expect(page.locator('body')).toContainText('Logged in as username5@domain.tld');
    await expect(page.locator('body')).toContainText('"displayName": "User Name"');
    await expect(page.locator('body')).toContainText('"emailVerified": true');
    await expect(page.locator('body')).toContainText('"providerId": "apple.com"');
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.locator('body')).toContainText('Firebase Login Test');
  });

  test('Log in and out with Microsoft', async ({ page }) => {
    await gotoTestApp({ page, methods: ['google', 'microsoft', 'email'] });
    await expect(page.locator('body')).toContainText('Firebase Login Test');
    await expect(page.locator('body')).toContainText('login test footer');
    await page.getByRole('button', { name: 'Sign in with Microsoft' }).click();
    await expect(page.locator('body')).toContainText('Sign-in with Microsoft.com');
    await page.getByRole('button', { name: 'Add new account' }).click();
    await page.getByLabel('Email').fill('username6@domain.tld');
    await page.getByLabel('Display name').fill('User Name');
    await page.getByRole('button', { name: 'Sign in with Microsoft.com' }).click();
    await expect(page.locator('body')).toContainText('Logged in as username6@domain.tld');
    await expect(page.locator('body')).toContainText('"displayName": "User Name"');
    await expect(page.locator('body')).toContainText('"emailVerified": true');
    await expect(page.locator('body')).toContainText('"providerId": "microsoft.com"');
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.locator('body')).toContainText('Firebase Login Test');
  });

  test('Log in and out with Yahoo', async ({ page }) => {
    await gotoTestApp({ page, methods: ['google', 'yahoo', 'email'] });
    await expect(page.locator('body')).toContainText('Firebase Login Test');
    await expect(page.locator('body')).toContainText('login test footer');
    await page.getByRole('button', { name: 'Sign in with Yahoo' }).click();
    await expect(page.locator('body')).toContainText('Sign-in with Yahoo.com');
    await page.getByRole('button', { name: 'Add new account' }).click();
    await page.getByLabel('Email').fill('username7@domain.tld');
    await page.getByLabel('Display name').fill('User Name');
    await page.getByRole('button', { name: 'Sign in with Yahoo.com' }).click();
    await expect(page.locator('body')).toContainText('Logged in as username7@domain.tld');
    await expect(page.locator('body')).toContainText('"displayName": "User Name"');
    await expect(page.locator('body')).toContainText('"emailVerified": true');
    await expect(page.locator('body')).toContainText('"providerId": "yahoo.com"');
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.locator('body')).toContainText('Firebase Login Test');
  });

});