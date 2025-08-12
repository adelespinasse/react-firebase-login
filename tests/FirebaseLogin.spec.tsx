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

test.describe('SSO login-logout w redirect', () => {
  const testProvider = ({ method, buttonName }: ProviderLabels) => {
    test(`using ${method}`, async ({ page }) => {
      const email = `${method}user1@domain.tld`;
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

test.describe('SSO login-logout w popup', () => {
  const testProvider = ({ method, buttonName }: ProviderLabels) => {
    test(`using ${method}`, async ({ page }) => {
      const email = `${method}user2@domain.tld`;
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
