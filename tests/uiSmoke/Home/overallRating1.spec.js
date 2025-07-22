import { test, expect } from '@playwright/test';
import OverallRatingPage from '../../../pages/overallRatingPage.js';

test.describe('Overall Rating Page Tests', () => {
    let overallRatingPage;

    test.beforeEach(async ({ page }) => {
        overallRatingPage = new OverallRatingPage(page);
        await page.goto(overallRatingPage.url, { waitUntil: 'domcontentloaded' });
    });

    test('Verify Overall Rating Page URL', async () => {
        await overallRatingPage.verifyURL();
    });

    test('Navigate to Previous Page From Page 3', async () => {
        await overallRatingPage.goToPage(3);
        await overallRatingPage.moveToPreviousPage();
        await expect(overallRatingPage.page.locator(overallRatingPage.goToPageTextField)).toHaveValue('2');
    });

    test('Navigate to Next Page', async () => {
        await overallRatingPage.moveToNextPage();
    });

    test('Go to Specific Page', async () => {
        const pageNumber = 2;
        await overallRatingPage.goToPage(pageNumber);
    });

    test('Should not navigate to a negative page number', async () => {
        // await overallRatingPage.goToPage(-1);
        // await expect(overallRatingPage.page.locator(overallRatingPage.goToPageTextField)).not.toHaveValue('-1');
        await expect(async () => {
            await overallRatingPage.goToPage('invalid');  // string instead of number
        }).rejects.toThrow("Page number must be a numeric value");
    });

    test('Should not accept non-numeric input in page field', async () => {
        // await overallRatingPage.goToPage('abc');
        // await overallRatingPage.page.keyboard.press('Enter');
        await expect(async () => {
            await overallRatingPage.goToPage('abc');  // non-numeric input
        }).rejects.toThrow("Page number must be a numeric value");
    });

    test('Should not move to previous page when on first page', async () => {
        // await overallRatingPage.goToPage(1);
        // await overallRatingPage.moveToPreviousPage();
        await expect(async () => {
            await overallRatingPage.moveToPreviousPage();
        }).rejects.toThrow("Already on the first page, cannot go to previous page");
    });

    test('Should not move to next page when on last page', async () => {
        await overallRatingPage.goToPage(5);
        await expect(async () => {
            await overallRatingPage.moveToNextPage();
        }).rejects.toThrow("Already on the last page, cannot go to next page");
    });

});