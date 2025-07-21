import { test, expect } from '@playwright/test';
import HomePage from '../../../pages/homePage.js';
const rawData = require('../../../test-data/userData.json');
const testData = JSON.parse(JSON.stringify(rawData));

test.describe('Home Page Tests', () => {
    let homePage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        await page.goto('https://buggy.justtestit.org', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector(homePage.title);
        await expect(page.locator(homePage.title)).toHaveText('Buggy Rating');
    });

    test('Login with valid credentials', async () => {
        await homePage.login(testData[0].username, testData[0].password);

        //Test LogOut
        await homePage.logout();
    })

    // test('Logout', async () => {
    //     await homePage.logout();
    // })

})