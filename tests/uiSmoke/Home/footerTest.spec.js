import { test } from '@playwright/test';
import HomePage from '../../../pages/homePage.js'; 

test.describe('Footer Tests', () => {
    let homePage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        await page.goto('https://buggy.justtestit.org', { waitUntil: 'domcontentloaded' });
    });

    test('Verify footer text', async () => {
        await homePage.verifyFooterText();
    });

    test('Verify social links in footer', async () => {
        await homePage.verifyFooterSocials();
    });

})