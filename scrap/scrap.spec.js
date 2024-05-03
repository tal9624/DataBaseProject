import { test, expect } from "@playwright/test";
import js2xmlparser from "js2xmlparser";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

import {
  getAlbumFromUrl,
  getAlbumNameFromHeader,
  getArtistFromUrl,
  getLyrics,
  getReleaseDate,
  getSongName,
  getSongsUrls,
  getWriter,
  getYoutube,
} from "./lib/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// const url = "https://www.letssingit.com/pink-floyd-album-lyrics-the-dark-side-of-the-moon-sz2m2w";
//  const url = "https://www.letssingit.com/three-days-grace-album-lyrics-human-6m56p7";
 // const url = "https://www.letssingit.com/metallica-album-lyrics-reload-wb4wlb";
//  const url = "https://www.letssingit.com/pink-floyd-album-lyrics-echoes-the-best-of-pink-floyd-8q9fk1";
// const url = "https://www.letssingit.com/green-day-album-lyrics-nimrod-6g6pkh";
// const url = "https://www.letssingit.com/camel-album-lyrics-rajaz-fvgzgp";
// const url = "https://www.letssingit.com/shakira-album-lyrics-laundry-service-ns43np";
const url = "https://www.letssingit.com/europe-album-lyrics-the-final-countdown-x1n1kr";

const albumName = getAlbumFromUrl(url);
const artistName = getArtistFromUrl(url);
const outPath = join(__dirname, "..", `data/${artistName}-${albumName}.xml`);
const scrapedData = [];

test(`Scrap all songs from ${artistName}'s album: ${albumName} into XML file`, async ({
  page,
}) => {
  await page.goto(url);

  const releaseDate = await getReleaseDate(page);
  const links = await getSongsUrls(page);
  const albumName = await getAlbumNameFromHeader(page)

  for (const link of links) {
    await page.goto(link);
    const songName = await getSongName(page);
    const lyrics = await getLyrics(page);
    const writerName = await getWriter(page);
    const youtubePath = await getYoutube(page);
    const filePath = `${songName}.txt`.replace(/ /g, "-");
    const source = "Website: letssingit.com";
    console.log("Extract data from song:", songName);
    scrapedData.push({
      lyrics,
      filePath,
      songName,
      writerName,
      source,
      albumName,
      artistName,
      youtubePath,
      releaseDate,
    });
  }

  console.log(`\n\nScraping album: ${albumName} data finished successfully:`);
  console.log(`Write file to ${outPath}\n`);

  const xml = js2xmlparser.parse("song", JSON.stringify(scrapedData));
  fs.writeFileSync(`./data/${artistName}-${albumName}.xml`, xml);

  expect(1).toEqual(1);
});
