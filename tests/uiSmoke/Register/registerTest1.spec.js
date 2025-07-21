import { test, expect } from '@playwright/test';
import RegisterPage from '../../../pages/registerPage.js';
const rawData = require('../../../test-data/userData.json');
const testData = JSON.parse(JSON.stringify(rawData));

test.describe('Register Page Tests', () => {
    let registerPage;
    
    test.beforeEach(async ({ page }) => {
        registerPage = new RegisterPage(page);
        await page.goto('https://buggy.justtestit.org/register', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector(registerPage.title);
        await expect(page.locator(registerPage.title)).toHaveText('Register with Buggy Cars Rating');
    });

    test(`Successful Registration with User : ${testData[2].id}`, async () => {
        const details = testData[2];
        await registerPage.registerUser(details);
        await expect(registerPage.page.locator(registerPage.successMessage)).toContainText('Registration is successful');

    })

})
