import { test, expect } from '@playwright/test';
import HomePage from '../../../pages/homePage.js';

test('Test Buggy Cars Rating Card', async ({ page }) => {
    const homePage = new HomePage(page);
    await page.goto('https://buggy.justtestit.org' , { waitUntil: 'domcontentloaded'});

    // Verify the title
    await expect(page).toHaveTitle('Buggy Cars Rating');

    // Verify total number of car cards displayed
    await homePage.verifyTotalCardsCount();

    // Verify Buggy Cars Rating Card
    await homePage.verifyBuggyCarsRatingCard();


})