import HomePage from "./homePage.js";
import { expect } from "@playwright/test";

class OverallRatingPage extends HomePage {

    constructor(page) {
        super(page);
        this.page = page;
        this.title = "h1";
        this.url = "https://buggy.justtestit.org/overall";
        this.ratingGrid = "div[role='main']";
        this.goToPageTextField = "div[role='main'] input[type='text']";
        this.totalPagesTextLocator = "main.row div.pull-xs-right";
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
        if (isNaN(pageNumber)) {
            console.error("Page number must be a numeric value");
            throw new Error("Page number must be a numeric value");
        }
        await expect(this.page.locator(this.goToPageTextField)).toBeVisible();
        await this.page.fill(this.goToPageTextField, pageNumber.toString());
        await this.page.keyboard.press('Enter');
        await expect(this.page.locator(this.ratingGrid)).toBeVisible();
    }

    async verifyURL() {
        await expect(this.page).toHaveURL(this.url);
    }

    async getTotalPages() {
        const paginationLocator = this.page.locator(this.totalPagesTextLocator);

        // Wait for it to be visible
        await paginationLocator.waitFor({ state: 'visible' });

        // Get full innerText
        const textContent = await paginationLocator.innerText();
        // console.log("👉 Pagination Text Content:", textContent);

        // Use regex to extract total pages
        const match = textContent.match(/page\s*\d+\s*of\s*(\d+)/i);
        const totalPages = match ? parseInt(match[1]) : 0;

        // console.log("✅ Total Pages Extracted:", totalPages);

        // Assertion
        expect(totalPages).toBeGreaterThan(0);

        return totalPages;
    }
}

module.exports = OverallRatingPage;