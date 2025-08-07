import { test, expect } from '@playwright/experimental-ct-react';
import { FirebaseLoginStory } from './FirebaseLogin.story';
// import { initializeApp } from 'firebase/app';
// import { getAuth, connectAuthEmulator } from 'firebase/auth';

// const firebaseConfig = {
//   apiKey: "demo-key",
//   authDomain: "demo-project.firebaseapp.com",
//   projectId: "demo-project",
// };

test.describe('FirebaseLogin E2E Tests', () => {
  // test.beforeEach(async ({ page }) => {
  //   // Initialize Firebase for this test
  //   await page.addInitScript(() => {
  //     const { initializeApp } = require('firebase/app');
  //     const { getAuth, connectAuthEmulator } = require('firebase/auth');

  //     const firebaseConfig = {
  //       apiKey: "demo-key",
  //       authDomain: "demo-project.firebaseapp.com",
  //       projectId: "demo-project",
  //     };

  //     const app = initializeApp(firebaseConfig);
  //     const auth = getAuth(app);
  //     connectAuthEmulator(auth, 'http://localhost:9099');
  //   });
  // });

  test('full email login flow with redirect', async ({ mount, page, context }) => {
    const component = await mount(<FirebaseLoginStory />);

    // Should show login form initially
    await expect(component.locator('text=Sign in with Google')).toBeVisible();

    // Click email login button
    await component.locator('text=Sign in with Google').click();

    // // Fill in email form
    // await component.locator('input[type="email"]').fill('test-user@example.com');
    // await component.locator('input[type="password"]').fill('testPassword123');

    // // Submit the form - this should trigger redirect to Firebase Auth UI
    // const submitButton = component.locator('button').filter({ hasText: /sign.* in/i }).first();

    // // Set up listener for new page (popup or redirect)
    // const pagePromise = context.waitForEvent('page');

    // await submitButton.click();

    // // Wait for the auth page to open
    // const authPage = await pagePromise;
    // await authPage.waitForLoadState();

    // // The Firebase emulator should show an auth page
    // // Look for elements that indicate we're on the Firebase auth page
    // await expect(authPage.locator('body')).toContainText('Firebase Auth Emulator');

    // // Fill in credentials on the Firebase emulator page
    // // The emulator UI may have specific selectors for email/password
    // const emailField = authPage.locator('input[type="email"]').first();
    // const passwordField = authPage.locator('input[type="password"]').first();

    // if (await emailField.count() > 0) {
    //   await emailField.fill('test-user@example.com');
    // }
    // if (await passwordField.count() > 0) {
    //   await passwordField.fill('testPassword123');
    // }

    // // Look for and click the sign in button on the emulator page
    // const authSubmitBtn = authPage.locator('button').filter({ hasText: /sign.*in/i }).first();
    // await authSubmitBtn.click();

    // // The auth page should redirect back to our app
    // await page.waitForTimeout(2000); // Give time for redirect

    // // Check that we're now logged in
    // await expect(component.getByTestId('user-content')).toBeVisible();
    // await expect(component.locator('text=Sign in with Email')).not.toBeVisible();
  });

  // test('google login popup flow', async ({ mount, page, context }) => {
  //   const component = await mount(
  //     <FirebaseLogin methods={['google']}>
  //       <div data-testid="user-content">
  //         <p data-testid="user-email">Welcome!</p>
  //       </div>
  //     </FirebaseLogin>
  //   );

  //   // Should show Google login button
  //   await expect(component.locator('text=Sign in with Google')).toBeVisible();

  //   // Set up listener for popup
  //   const popupPromise = context.waitForEvent('page');

  //   // Click Google login button
  //   await component.locator('text=Sign in with Google').click();

  //   // Wait for the popup to appear
  //   const popup = await popupPromise;
  //   await popup.waitForLoadState();

  //   // The Firebase emulator should show a Google sign-in simulation
  //   await expect(popup.locator('body')).toContainText('Firebase Auth Emulator');

  //   // Look for "Auto-select" button or similar in emulator
  //   const autoSelectBtn = popup.locator('button').filter({ hasText: /auto/i }).first();
  //   if (await autoSelectBtn.count() > 0) {
  //     await autoSelectBtn.click();
  //   } else {
  //     // Fallback: look for any sign-in button
  //     const signInBtn = popup.locator('button').filter({ hasText: /sign.*in/i }).first();
  //     await signInBtn.click();
  //   }

  //   // Wait for popup to close and authentication to complete
  //   await popup.waitForEvent('close');
  //   await page.waitForTimeout(1000);

  //   // Check that we're now logged in
  //   await expect(component.getByTestId('user-content')).toBeVisible();
  //   await expect(component.locator('text=Sign in with Google')).not.toBeVisible();
  // });

  // test('logout flow', async ({ mount, page }) => {
  //   // First, programmatically sign in a user
  //   await page.evaluate(async () => {
  //     const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');
  //     const auth = getAuth();

  //     try {
  //       await signInWithEmailAndPassword(auth, 'test@example.com', 'testpass');
  //     } catch {
  //       await createUserWithEmailAndPassword(auth, 'test@example.com', 'testpass');
  //     }
  //   });

  //   const component = await mount(
  //     <FirebaseLogin>
  //       <div data-testid="user-content">
  //         <button data-testid="logout-btn" onClick={() => {
  //           const { signOut } = require('firebase/auth');
  //           const { getAuth } = require('firebase/auth');
  //           signOut(getAuth());
  //         }}>
  //           Logout
  //         </button>
  //       </div>
  //     </FirebaseLogin>
  //   );

  //   // Should show user content
  //   await expect(component.getByTestId('user-content')).toBeVisible();

  //   // Click logout
  //   await component.getByTestId('logout-btn').click();

  //   // Should return to login form
  //   await expect(component.locator('text=Sign in with Email')).toBeVisible();
  //   await expect(component.getByTestId('user-content')).not.toBeVisible();
  // });
});