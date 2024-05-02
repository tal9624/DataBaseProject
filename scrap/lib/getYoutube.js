export async function getYoutube(page) {
  const pageSource = await page.content();
  const videoIdPattern = /videoFiller\('([^']+)'\);/;
  const match = pageSource.match(videoIdPattern);

  // Check if the video ID was found
  let youtube = "";
  if (match && match[1]) {
    youtube = `https://www.youtube.com/watch?v=${match[1]}`;
  } else {
    youtube = "N/A";
  }

  return youtube;
}
