import HomePage from "./homePage.js";
import { expect } from "@playwright/test";

class RegisterPage extends HomePage
{

    constructor(page)
    {
        super(page);
        this.page = page;
        this.title = "h2";
        this.usernameField = "input[name='username']";
        this.firstName = "input[name='firstName']";
        this.lastName = "input[name='lastName']";
        this.passwordField = "div[role='main'] input[name='password']";
        this.confirmPasswordField = "input[name='confirmPassword']";
        this.cancelButton = "div[role='main'] a[href='/']";
        this.successMessage = "div[class='result alert alert-success']";
        this.errorMessage = "div[class='result alert alert-danger']";
    } 

    async registerUser(details) {
        await this.page.fill(this.usernameField, details.username);
        await this.page.fill(this.firstName, details.firstName);
        await this.page.fill(this.lastName, details.lastName);
        await this.page.fill(this.passwordField, details.password);
        await this.page.fill(this.confirmPasswordField, details.confirmPassword);
        await this.page.getByRole('button', { name: 'Register' }).click();
    }

}

module.exports = RegisterPage;