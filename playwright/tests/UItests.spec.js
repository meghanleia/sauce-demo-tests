const {test, expect} = require('@playwright/test');

let webContext;

test('Login page: Successful login after failed attempt', async ({page})=> 
{

const passwordLogin = page.locator('[type="password"]');
const loginButton = page.locator('#login-button');
await page.goto('https://www.saucedemo.com');
await expect(page).toHaveTitle("Swag Labs");
await page.locator('input#user-name').type("standard_user");
await passwordLogin.type("secret_sauc");
await loginButton.click();
await expect(page.locator('[data-test="error"]')).toContainText('sadface:');
await passwordLogin.fill("");
await passwordLogin.type("secret_sauce");
await loginButton.click();
await expect(page).toHaveURL("https://www.saucedemo.com/inventory.html");
console.log(await page.getByText('Products').textContent());

});

test.describe('Products page functional and end-to-end tests', () => {

    test.beforeAll(async ({browser}) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('https://www.saucedemo.com');
    await expect(page).toHaveTitle("Swag Labs");
    await page.locator('input#user-name').type("standard_user");
    await page.locator('[type="password"]').type("secret_sauce");
    await page.locator('#login-button').click();
    await context.storageState({path: 'state.json'});
    webContext=  await browser.newContext({storageState:'state.json'});
});

    test('Return item label for all inventory items', async () => {
        const page =  await webContext.newPage();
        await page.goto('https://www.saucedemo.com/inventory.html');
        console.log(await page.locator('div.inventory_item_name').allTextContents());
    });

    test('Item added to cart, confirm one item added', async () => {
        const page =  await webContext.newPage();
        await page.goto('https://www.saucedemo.com/inventory.html');
        await expect(page.locator('#header_container > div.header_secondary_container > span')).toContainText('Products');
        await page.locator('#add-to-cart-sauce-labs-backpack').click();
        await expect(page.locator('#shopping_cart_container > a > span')).toContainText('1');
    });

    test('Item removed from cart, confirm no items in cart', async () => {
        const page =  await webContext.newPage();
        await page.goto('https://www.saucedemo.com/inventory.html');
        //await page.locator('#add-to-cart-sauce-labs-backpack').click();
        await page.locator('#remove-sauce-labs-backpack').click();
        await expect(page.locator('#shopping_cart_container > a > span')).toBeHidden();
    });
    
    test('Item added to cart, user checks out with item', async () => {
        const page =  await webContext.newPage();
        await page.goto('https://www.saucedemo.com/inventory.html');
        await page.locator('button.btn_inventory').nth(1).click();
        await page.locator('a.shopping_cart_link').click();
        await expect(page.locator('span.title')).toContainText('Your Cart');
        await expect(page.locator("#cart_contents_container > div > div.cart_list > div.cart_item")).toHaveCount(1);
        await page.locator("#checkout").click();
        await expect(page.locator('#header_container > div.header_secondary_container > span')).toContainText('Checkout: Your Information');
        await page.locator('#first-name').type('Meghan');
        await page.locator('#last-name').type('Bissonnette');
        await page.locator('#postal-code').type('81501');
        await page.locator('#continue').click();
        await expect(page.locator('span.title')).toContainText('Checkout: Overview');
        await expect(page.locator("#checkout_summary_container > div > div.cart_list > div.cart_item")).toHaveCount(1);
        await expect(page.locator('#checkout_summary_container > div > div.summary_info > div:nth-child(2)')).toContainText(/SauceCard/);
        await expect(page.locator('#checkout_summary_container > div > div.summary_info > div:nth-child(4)')).toContainText(/FREE/);
        await page.locator('#finish').click();
        await expect(page.locator('#checkout_complete_container > h2')).toContainText('THANK YOU FOR YOUR ORDER');
    });

    test('User goes to About page via the hamburger menu', async () => {
        const page =  await webContext.newPage();
        await page.goto('https://www.saucedemo.com/inventory.html');
        await page.locator('#react-burger-menu-btn').click();
        await page.locator('#about_sidebar_link').click();
        await expect(page).toHaveURL('https://saucelabs.com/');
        await page.goBack();
        await expect(page).toHaveTitle("Swag Labs");
    });

    test('User logs out from Products page', async () => {
        const page =  await webContext.newPage();
        await page.goto('https://www.saucedemo.com/inventory.html');
        await page.locator('#react-burger-menu-btn').click();
        await page.locator('#logout_sidebar_link').click();
        await expect(page).toHaveURL('https://www.saucedemo.com/');
    });
    
    test('User sorts items from low to high', async () => {
        const page =  await webContext.newPage();
        await page.goto('https://www.saucedemo.com/inventory.html');
        await page.getByText('Name (A to Z)Name (A to Z)Name (Z to A)Price (low to high)Price (high to low)').click();
        await page.locator('[data-test="product_sort_container"]').selectOption('lohi');
        const beforeFilterPrice = await page.$$('div.inventory_item_price');
        let priceArr = [];
        for (let i = 0; i < beforeFilterPrice.length; i++) {
            const textPrice = await beforeFilterPrice[i].textContent();
            const priceElement = parseFloat(textPrice.substring(1));
            priceArr.push(priceElement);
        };
        console.log('Prices after sorted on Products page:', priceArr);
    });
    
    test('User clicks on Twitter link and opens new browser window', async () => {
        const page =  await webContext.newPage();
        await page.goto('https://www.saucedemo.com/inventory.html');
        const page1Promise = page.waitForEvent('popup');
        await page.getByRole('link', { name: 'Twitter' }).click();
        const page1 = await page1Promise;
        await expect(page1).toHaveURL('https://twitter.com/saucelabs');
    });

    test('User clicks on Facebook link and opens new browser window', async () => {
        const page =  await webContext.newPage();
        await page.goto('https://www.saucedemo.com/inventory.html');
        const page1Promise = page.waitForEvent('popup');
        await page.getByRole('link', { name: 'Facebook' }).click();
        const page1 = await page1Promise;
        await expect(page1).toHaveTitle(/.*Sauce Labs/);
    });
    
});