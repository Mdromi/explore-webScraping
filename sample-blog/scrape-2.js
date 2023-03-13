const cheerio = require("cheerio");
const request = require("request");

const URL = "https://www.freecodecamp.org/news/tag/blog/";

// convert link to image size
const imageSizes = (imageSizeLink) => {
  return imageSizeLink.split(",").reduce((obj, link) => {
    let sizeKey = "";
    const [url, width] = link.trim().split(" ");
    width ? (sizeKey = width.substring(0, width.length - 1)) : (sizeKey = 300);
    console.log(sizeKey);
    obj[sizeKey] = url;
    return obj;
  }, {});
};

const getThumbnailUrls = async (URL) => {
  try {
    const html = await new Promise((resolve, reject) => {
      request(URL, (error, response, html) => {
        if (error) reject(error);
        else resolve(html);
      });
    });

    // console.log(html);
    const $ = cheerio.load(html);

    const siteHeadings = $(".post-card-title");
    const postCard = $(".post-card");

    // console.log(siteHeadings.html());
    // console.log(siteHeadings.text());
    // const output = postCard.find('h2').text();
    // const output = postCard.children('a').text();
    // const output = siteHeadings.children('a').next().text();
    // const output = siteHeadings.children('a').parent().text();
    // console.log('output', output);

    // get nav link
    // $('.tag').each((i, el) => {
    //     const item = $(el).text();
    //     const link = $(el).attr('href');
    //     console.log(item, link);
    // });

    // get blog post thumbnail
    const thumbnailUrls = [];
    $(".post-card-image").each((i, el) => {
      thumbnailUrls.push(imageSizes($(el).attr("srcset")));
    });

    return thumbnailUrls;
  } catch (error) {
    console.log("Request err");
    console.log(error);
  }
};

(async () => {
  try {
    const thumbnailUrls = await getThumbnailUrls(URL);
    console.log("thumbnailUrls", thumbnailUrls);
  } catch (error) {
    console.error(error);
  }
})();
