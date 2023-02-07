const {test, expect} = require('@playwright/test');

let webContext;

test('Visual test Login page', async ({page})=> {
    await page.goto('https://www.saucedemo.com/');
    expect(await page.screenshot()).toMatchSnapshot('loginpage.png');
});

test('Visual test Products page', async ({browser}) => {
    webContext=  await browser.newContext({storageState:'state.json'});
    const page =  await webContext.newPage();
    await page.goto('https://www.saucedemo.com/inventory.html');
    expect(await page.screenshot()).toMatchSnapshot('productspage.png');
});
