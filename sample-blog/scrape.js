const cheerio = require("cheerio");
const request = require("request");
const fs = require("fs");
const writeStream = fs.createWriteStream("post.csv");

const URL = "https://www.freecodecamp.org/news/tag/blog/";

// Write headers
writeStream.write(`Author, Title, Link, Time \n`);

const posts = async (URL) => {
  try {
    const html = await new Promise((resolve, reject) => {
      request(URL, (error, response, html) => {
        if (error) reject(error);
        else resolve(html);
      });
    });

    const $ = cheerio.load(html);

    let posts = [];

    $(".post-card-content").each((i, el) => {
      let title = $(el).find(".post-card-title");
      const link = title.children("a").attr("href");
      title = title.text().replace(/\s\s+/g, "");

      const postCardMeta = $(el).find(".meta-content");
      let author = postCardMeta.children("a").text().replace(/\s\s+/g, "");
      let time = postCardMeta.children("time").text().replace(/\s\s+/g, "");

      // Write Row to csv
      writeStream.write(`${author}, ${title}, ${link}, ${time} \n`);

      //  Create Obj
      posts.push({ author, title, link, time });
    });

    return posts;
  } catch (error) {
    console.log("Request err");
    console.log(error);
  }
};

(async () => {
  try {
    const postsContent = await posts(URL);
    console.log("postsContent", postsContent);
  } catch (error) {
    console.error(error);
  }
})();
