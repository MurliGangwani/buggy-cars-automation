import { expect } from '@playwright/test';

class HomePage {
    constructor(page) {
        this.page = page;
        this.title = "a[class='navbar-brand']";
        this.loginField = "input[name='login']";
        this.passwordField = "input[name='password']";
        this.loginButton = "button[type='submit']";
        this.registerButton = "a[href='/register']";
        this.userNameDisplay = "span[class='nav-link disabled']";
        this.profileLink = "a[href='/profile']";
        this.allCards = "div[class='card']";
        this.cardTitle = "h2[class='card-header text-xs-center']";
        this.cardFooter = "div[class='card-block']";
        this.footer = "footer[class='footer']";
    }

    async login(username, password) {
        await this.page.fill(this.loginField, username);
        await this.page.fill(this.passwordField, password);
        await this.page.click(this.loginButton);
        await this.page.waitForSelector(this.userNameDisplay);
        await expect(this.page.locator(this.userNameDisplay)).toHaveText('Hi, ' + username);
        await expect(this.page.locator(this.loginButton)).not.toBeVisible();
    }
    async logout() {
        await this.page.getByRole('link', { name: 'Logout' }).click();
        await expect(this.page.locator(this.loginButton)).toBeEnabled();
    }

    async verifyFooterText() {
        await expect(this.page.locator(this.footer)).toHaveText('© 2016 Buggy Software, Inc.');
    }

    async verifyFooterSocials() {
        const expectedSocialLinks = {
            Twitter: 'https://www.twitter.com',
            Facebook: 'https://www.facebook.com'
        };

        const allowedDomains = ['x.com', 'facebook.com', 'twitter.com'];

        const domainMatches = (url, expectedDomains) => {
            return expectedDomains.some(domain => url.includes(domain));
        };

        for (const [name, expectedURL] of Object.entries(expectedSocialLinks)) {
            const link = await this.page.getByRole('link', { name });

            // Visibility
            await expect(link).toBeVisible();

            // href check
            const actualhref = await link.getAttribute('href');
            expect(actualhref).toBe(expectedURL);

            // target _blank check
            const targetAttr = await link.getAttribute('target');
            expect(targetAttr).toBe('_blank');

            // Open new tab and validate URL
            const [newPage] = await Promise.all([
                this.page.context().waitForEvent('page'),
                await link.click()
            ]);

            await newPage.waitForLoadState('load');
            const finalURL = newPage.url();

            console.log(`Navigated to: ${finalURL}`);
            expect(domainMatches(finalURL, allowedDomains)).toBe(true);

            await newPage.close();
        }
    }

    async verifyTotalCardsCount() {
        await expect((this.page).locator(this.allCards)).toHaveCount(3);
    }

    async verifyBuggyCarsRatingCard() {
        const firstCard = await this.page.locator('div.container').nth(1);
        await expect(firstCard).toContainText('BuggyCarsRating');
    }

    async verifyLoggedIn() {
        if (await this.page.locator(this.userNameDisplay).isVisible()) {
            const text = await this.page.locator(this.userNameDisplay).textContent();
            const name = text.split(", ")[1];
            console.log(`User ${name} is logged in`);
            return true;
        }
        console.error("User is not logged in");
        return false;
    }
}

module.exports = HomePage;