require("dotenv").config();
const puppeteer = require("puppeteer-core");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

async function run(URL) {
  let browser;
  const auth = `${process.env.AUTH_NAME}:${process.env.AUTH_PAS}`;
  try {
    browser = await puppeteer.connect({
      browserWSEndpoint: `wss://${auth}@zproxy.lum-superproxy.io:9222`,
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(2 * 60 * 1000);

    await page.goto(URL);

    // const body = await page.$('body');
    // const html = await page.evaluate(() => {
    //     document.documentElement.outerHTML
    // })
    // console.log(html);

    // const selector = '.a-carousel';
    // await page.waitForSelector(selector);
    // const el = await page.$(selector);

    // const text = await el.evaluate(e => e.innerHTML)
    // console.log(text);

    const productsList = [];

    // Extract the product details
    const productDetails = await page.evaluate(() => {
      const products = Array.from(
        document.querySelectorAll("li.a-carousel-card")
      );

      return products.map((product) => {
        const nameElement = product.querySelector(
          "div.p13n-sc-truncate-desktop-type2"
        );
        const priceElement = product.querySelector(
          "span._cDEzb_p13n-sc-price_3mJ9Z"
        );
        const url = product.querySelector(
          'a.a-link-normal[href*="/dp/"]'
        ).href;

        const name = nameElement ? nameElement.textContent : "";
        const price = priceElement ? priceElement.textContent : "";
        // const url = productURL ? productURL.textContent : "";

        console.log({ name, price, url });
        console.log('Pussing');

        // productsList.push({ name, price, url });

        return { name, price, url };
      });
    });

    console.log("DATA MINING COMPLETED");

    console.log('productDetails', productDetails);

    await csvWriter.writeRecords(productDetails);
    console.log('CSV file saved successfully!');
    return productsList;
  } catch (error) {
    console.error("scrape failed", error);
  } finally {
    await browser?.close();
  }
}

const csvWriter = createCsvWriter({
  path: "products.csv",
  header: [
    { id: "name", title: "Product Name" },
    { id: "price", title: "Price" },
    { id: "url", title: "URL" },
  ],
});

const main = async () => {
  const URL = "https://www.amazon.com/Best-Sellers/zgbs";
  //   const data = await run(URL);
  //   console.log(data);
  await run(URL);
  return 0;
};

main();

// const delay = ms => new Promise(res => setTimeout(res, ms));
// for(const product of productDetails) {
//     console.log(`Navigating to: ${product.url}`);
//     await page.goto(product.url);
//     await delay(2000); // add 2-second delay

//     // data extraction logic here
// }
