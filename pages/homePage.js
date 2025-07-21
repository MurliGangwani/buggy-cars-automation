import { expect } from '@playwright/test';

class HomePage
{
    constructor(page) 
    {
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
        this.socialLinks = "footer[class='footer'] div[class='pull-xs-right'] a";
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
}

module.exports = HomePage;