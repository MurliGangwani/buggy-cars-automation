import { test, expect } from '@playwright/test';
import OverallRatingPage from '../../../pages/overallRatingPage.js';
const rawData = require('../../../test-data/userData.json');
const testData = JSON.parse(JSON.stringify(rawData));


test.describe('Overall Rating Page Tests', () => {
    let overallRatingPage;

    test.beforeEach(async ({ page }) => {
        overallRatingPage = new OverallRatingPage(page);
        await page.goto(overallRatingPage.url, { waitUntil: 'load' });
        await page.waitForSelector(overallRatingPage.ratingGrid, { state: 'attached' });
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

    test('Comment on car with user logged in', async () => {
        if(await overallRatingPage.verifyLoggedIn() === false) {
            await overallRatingPage.login(testData[0].username, testData[0].password);
        }
    
        const carMake = 'Alfa Romeo';
        const carModel = '4c Spider';
        const comment = 'Great Car from Playwright';
        
        await overallRatingPage.commentOnCar(carMake, carModel, comment);
    });

    test('Comment on car with user not logged in', async () => {
        const carMake = 'Lancia';
        const carModel = 'Rally 037';
        const comment = 'Great Car from Playwright';
        
        await expect( async () => { 
            await overallRatingPage.commentOnCar(carMake, carModel, comment);
        }).rejects.toThrow("User is not logged in, cannot comment on car");
    });

    test('Get all car for make', async () => {
        const make = 'Alfa Romeo';
        const cars = await overallRatingPage.getAllCarForMake(make);
        console.log(`Cars for make ${make}:`, cars);
        expect(cars.length).toBeGreaterThan(0);
    });

    test('Get all comments for car', async () => {
        const carModel = 'Veyron';
        const comments = await overallRatingPage.getAllCommentsForCar(carModel);
        console.log(`Comments for ${carModel}:`, comments);
        expect(comments.length).toBeGreaterThan(0);
    });

});