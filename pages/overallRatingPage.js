import HomePage from "./homePage.js";
import { expect } from "@playwright/test";

class OverallRatingPage extends HomePage {

    constructor(page) {
        super(page);
        this.page = page;
        this.title = "h1";
        this.url = "https://buggy.justtestit.org/overall";
        this.ratingGrid = "table";
        this.goToPageTextField = "div[role='main'] input[type='text']";
        this.totalPagesTextLocator = "main.row div.pull-xs-right";
        this.commentBox = "textarea";
        this.votesCountLocator = "div[class='card-block'] h4 strong";
    }

    async moveToPreviousPage() {
        if (await this.page.locator(this.goToPageTextField).inputValue() === '1') {
            console.error("Already on the first page, cannot go to previous page");
            throw new Error("Already on the first page, cannot go to previous page");
        }
        await this.page.getByText('«').click();
        await expect(this.page.locator(this.ratingGrid)).toBeVisible();
    }

    async moveToNextPage() {
        const currentPageValue = await this.page.locator(this.goToPageTextField).inputValue();
        const totalPages = await this.getTotalPages();
        if (parseInt(currentPageValue) >= totalPages) {
            console.error("Already on the last page, cannot go to next page");
            throw new Error("Already on the last page, cannot go to next page");
        }
        await this.page.getByText('»').click();
        await expect(this.page.locator(this.ratingGrid)).toBeVisible();
    }

    async goToPage(pageNumber) {
        if (pageNumber < 1) {
            console.error("Page number must be greater than 0");
            throw new Error("Page number must be greater than 0");
        }
        // Ensure page number is within valid range to avoid errors when inputting
        const totalPages = await this.getTotalPages(); // Get total pages before navigating
        if (pageNumber > totalPages) {
            console.warn(`Attempting to go to page ${pageNumber}, but total pages are ${totalPages}. Navigating to last page.`);
            pageNumber = totalPages; // Cap at max pages
        }
        if (isNaN(pageNumber)) {
            console.error("Page number must be a numeric value");
            throw new Error("Page number must be a numeric value");
        }

        // const currentInputValue = await this.page.locator(this.goToPageTextField).inputValue();
        // if (parseInt(currentInputValue) === pageNumber) {
        //     console.log(`Already on page ${pageNumber}. No navigation needed.`);
        //     await expect(this.page.locator(this.ratingGrid)).toBeVisible(); // Just ensure table is visible
        //     return;
        // }

        // console.log(`Navigating to page ${pageNumber}...`);
        await expect(this.page.locator(this.goToPageTextField)).toBeVisible();
        await this.page.fill(this.goToPageTextField, pageNumber.toString());
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(2000); // Wait for the page to load
        await this.page.waitForSelector(this.ratingGrid, { state: 'attached' });
        await expect(this.page.locator(this.ratingGrid)).toBeVisible(); // Wait for the grid to reload
        // console.log(`Successfully navigated to page ${pageNumber}.`);
    }

    async verifyURL() {
        await expect(this.page).toHaveURL(this.url);
    }

    async getTotalPages() {
        const paginationLocator = this.page.locator(this.totalPagesTextLocator);

        // console.log("Attempting to get total pages...");
        // Now wait for pagination element to be visible
        await expect(paginationLocator).toBeVisible({ timeout: 15000 }); // Increased timeout

        // Wait for the text to contain the pattern, ensuring it's fully loaded
        await expect(paginationLocator).toContainText(/page\s*\d+\s*of\s*\d+/i, { timeout: 15000 }); // Increased timeout

        const textContent = await paginationLocator.innerText();
        // console.log("👉 Raw Pagination Text Content:", textContent); // Log the raw text

        // Use regex to extract total pages
        const match = textContent.match(/page\s*\d+\s*of\s*(\d+)/i);
        const totalPages = match ? parseInt(match[1]) : 0;

        // console.log("✅ Extracted Total Pages:", totalPages); // Log the extracted number
        expect(totalPages).toBeGreaterThan(0); // Assertion moved to be very specific
        return totalPages;
    }

    async getAllCarForMake(make) {
        let carDetails = [];
        const totalPages = await this.getTotalPages();
        console.log(`getAllCarForMake will check across ${totalPages} pages for make: ${make}`);

        for (let j = 1; j <= totalPages; j++) {
            console.log(`Checking page ${j} for make: ${make}`);
            await this.goToPage(j);
            await this.page.waitForSelector(this.ratingGrid, { state: 'attached' }) // Wait for the page to load completely
            // Ensure the grid is visible after page navigation
            await expect(this.page.locator(this.ratingGrid)).toBeVisible();

            const carTable = this.page.locator(this.ratingGrid);
            const rows = await carTable.locator('tbody tr').all(); // Get all table rows

            if (rows.length === 0) {
                console.warn(`No rows found on page ${j}.`);
                continue; // Skip to next page if no rows
            }

            for (const row of rows) {
                // Wait for the Make cell to have some text before getting its innerText
                const makeCell = row.locator('td:nth-child(2)'); // Assuming Make is the 2nd td
                // Added a soft assertion to ensure the makeCell has text, but doesn't fail the test
                // if a row somehow has an empty make field (though this shouldn't happen for valid cars)
                try {
                    await expect(makeCell).not.toBeEmpty({ timeout: 2000 });
                } catch (e) {
                    console.warn(`Warning: Make cell on current row is empty or not found within timeout. Skipping this row.`);
                    continue; // Skip this row if make cell is problematic
                }


                const carMake = await makeCell.innerText();
                const cleanedCarMake = carMake.trim(); // Trim whitespace

                const carModel = await row.locator('td:nth-child(3)').innerText().then(text => text.trim());
                const carRank = await row.locator('td:nth-child(4)').innerText().then(text => text.trim());
                const carVotes = await row.locator('td:nth-child(5)').innerText().then(text => text.trim());
                const carEngine = await row.locator('td:nth-child(6)').innerText().then(text => text.trim());

                // console.log(`  Processing Row: Raw Make='${carMake}', Cleaned Make='${cleanedCarMake}', Model='${carModel}'`);

                // Check if the car is already present in carDetails array
                const isCarAlreadyPresent = carDetails.some(car =>
                    car.make.toLowerCase() === cleanedCarMake.toLowerCase() &&
                    car.model.toLowerCase() === carModel.toLowerCase()
                );

                if (cleanedCarMake.toLowerCase() === make.toLowerCase() && !isCarAlreadyPresent) {
                    // console.log(`  MATCH FOUND and NEW CAR: Make='${cleanedCarMake}', Model='${carModel}'`);
                    carDetails.push({
                        make: cleanedCarMake,
                        model: carModel,
                        rank: carRank,
                        rating: carVotes,
                        engineDetails: carEngine
                    });
                } else if (isCarAlreadyPresent) {
                    console.log(`  Skipping duplicate car: Make='${cleanedCarMake}', Model='${carModel}'`);
                }
            }
        }
        // console.log('Final Car Details:', carDetails);
        return carDetails;
    }

    async commentOnCar(make, model, comment) {

        if (await this.verifyLoggedIn() === false) {
            console.error("User is not logged in, cannot comment on car");
            throw new Error("User is not logged in, cannot comment on car");
        }

        const totalPages = await this.getTotalPages();
        let carFound = false;

        for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
            await this.goToPage(currentPage);
            await expect(this.page.locator(this.ratingGrid)).toBeVisible();

            const carTable = await this.page.locator(this.ratingGrid);
            const rows = await carTable.locator('tbody tr').all();

            for (const row of rows) {
                const carMake = await row.locator('td:nth-child(2)').innerText().then(text => text.trim());
                const carModel = await row.locator('td:nth-child(3)').innerText().then(text => text.trim());

                if (carMake.toLowerCase() === make.toLowerCase() && carModel.toLowerCase() === model.toLowerCase()) {
                    carFound = true;
                    await row.locator('td:nth-child(3) a').click();
                    console.log("Checking for vote message...");
                    await expect(this.page.locator(this.votesCountLocator)).toBeVisible({ timeout: 10000 });

                    // Consider if reload is truly necessary here. It can be slow.
                    // If the vote message or count doesn't update dynamically, it might be.
                    // If it does, remove this.
                    // await this.page.reload();
                    // await expect(this.page.locator(this.votesCountLocator)).toBeVisible({ timeout: 10000 });

                    const voteExistsLocator = this.page.locator('p', { hasText: 'Thank you for your vote!' });
                    const voteExists = await voteExistsLocator.isVisible({ timeout: 5000 });

                    if (voteExists) {
                        console.warn("Vote already exists for this car");
                        throw new Error("Vote already exists for this car");
                    }
                    console.log("Vote message not present, proceeding to comment");
                    await expect(this.page.locator(this.commentBox)).toBeVisible({ state: 'attached' });
                    const votestBeforeComment = await this.getVotesCount();
                    console.log(`Votes before comment: ${votestBeforeComment}`);
                    await this.page.fill(this.commentBox, comment);
                    await this.page.getByRole('button', { name: 'Vote!' }).click();
                    await expect(this.page.locator('p', { hasText: 'Thank you for your vote!' })).toBeVisible({ timeout: 5000 });
                    console.log("Vote submitted successfully");
                    const votesAfterComment = await this.getVotesCount();
                    console.log(`Votes after comment: ${votesAfterComment}`);
                    expect(votesAfterComment).toBe(votestBeforeComment + 1);
                    return;
                }
            }
        }

        if (!carFound) {
            console.error(`Car with Make: "${make}" and Model: "${model}" not found on any page.`);
            throw new Error(`Car with Make: "${make}" and Model: "${model}" not found.`);
        }
    }

    async getVotesCount() {
        await this.page.waitForSelector(this.votesCountLocator, { state: 'attached' });
        const totalVotes = await this.page.locator(this.votesCountLocator).textContent();
        return parseInt(totalVotes) || 0;
    }

    async getAllCommentsForCar(model) {
        const totalPages = await this.getTotalPages();
        let carComments = [];
        let carFound = false;

        for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
            await this.goToPage(currentPage);
            await expect(this.page.locator(this.ratingGrid)).toBeVisible();

            const carTable = await this.page.locator(this.ratingGrid);
            const rows = await carTable.locator('tbody tr').all();

            for (const row of rows) {
                const carModel = await row.locator('td:nth-child(3)').innerText().then(text => text.trim());

                if (carModel.toLowerCase() === model.toLowerCase()) {
                    carFound = true;
                    await row.locator('td:nth-child(7) a').click();
                    console.log(`Fetching comments for car model: ${model}`);
                    await this.page.waitForSelector('table', { state: 'attached' });
                    
                    carComments = await this.getColumnData('table', 3);
                    
                    return carComments;
                }
            }

        }

        if (!carFound) {
            console.error(`Car "${model}" not found on any page.`);
            throw new Error(`Car "${model}" not found.`);
        }

    }

    async getColumnData(selector,columnIndex) {
        let columnData = [];
        await expect(this.page.locator(selector)).toBeVisible();

        const table = this.page.locator(selector);
        const rows = await table.locator('tbody tr').all();

        if (rows.length === 0) {
            console.warn(`No rows found for column data extraction.`);
            return;
        }

        for (const row of rows) {
            const cellLocator = row.locator(`td:nth-child(${columnIndex})`);

            // Add a check to ensure the cell exists and has text
            try {
                await expect(cellLocator).not.toBeEmpty({ timeout: 2000 });
            } catch (e) {
                console.warn(`Warning: Cell at column ${columnIndex} on current row is empty or not found within timeout. Skipping this cell.`);
                continue; // Skip this cell/row if problematic
            }

            const cellText = await cellLocator.innerText();
            columnData.push(cellText.trim()); // Trim whitespace and add to array
        }
    
        // console.log(`Collected data for column ${columnIndex}:`, columnData);
        return columnData;
    }

}
module.exports = OverallRatingPage;