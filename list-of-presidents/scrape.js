const cheerio = require("cheerio");
const request = require("request");
const fs = require("fs");
const writeStream = fs.createWriteStream("presidents.csv");
const writeStreamJson = fs.createWriteStream("presidents.json");

const URL =
  "https://en.wikipedia.org/wiki/List_of_Presidents_of_the_United_States";

// convert link to image size
const objectToJsonFile = (obj) => {
  // Convert array to JSON string
  const jsonData = JSON.stringify(obj);

  // Write JSON string to file
  writeStreamJson.write(jsonData);

  // End the stream
  writeStreamJson.end();

  // Log success message when file is finished writing
  writeStreamJson.on("finish", () => {
    console.log("JSON file written successfully!");
  });
};

// Write headers
writeStream.write(`Name, DOB, Term, Party, Election, Vice-President, Img \n`);

const presidentsList = async (URL) => {
  try {
    const html = await new Promise((resolve, reject) => {
      request(URL, (error, response, html) => {
        if (error) reject(error);
        else resolve(html);
      });
    });

    const $ = cheerio.load(html);
    const tableRows = $("table.wikitable > tbody > tr");

    let presidentsItems = [];

    tableRows.each((index, row) => {
      if (!index == 0) {
        const imgSrc = `https:${$(row)
          .find("td:nth-child(2) > a > img")
          .attr("src")}`;
        const name = $(row).find("td:nth-child(3) > b > a").text();
        const dob = $(row).find("td:nth-child(3)").children("span").text();
        let term = $(row)
          .find("td:nth-child(4)")
          .text()
          .split("\n")
          .filter(Boolean);
        const party = $(row)
          .find("td:nth-child(6)")
          .text()
          .split("\n")
          .filter(Boolean);
        const election = $(row)
          .find("td:nth-child(7)")
          .text()
          .split("\n")
          .filter(Boolean);
        const vpList = $(row)
          .find("td:nth-child(8)")
          .text()
          .split("\n")
          .filter(Boolean);

        // Write Row to csv
        writeStream.write(
          `${name},${dob},"${term[0]}","${party.join(" - ")}", "${election.join(
            ","
          )}", "${vpList.join(",")}",  ${imgSrc} \n`
        );

        // create obj
        presidentsItems.push({
          name,
          imgSrc,
          dob,
          term,
          party,
          election,
          vpList,
        });
      }
    });

    return presidentsItems;
  } catch (error) {
    console.log("Request err");
    console.log(error);
  }
};

(async () => {
  try {
    const presidents = await presidentsList(URL);
    objectToJsonFile(presidents);
    console.log("postsContent", presidents);
  } catch (error) {
    console.error(error);
  }
})();
