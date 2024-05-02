export async function getAlbumNameFromHeader(page) {
  const header_title_main = await page
    .locator(".header_title_main")
    .innerText();
  const album = extractStringInQuotes(header_title_main);
  return album;
}

function extractStringInQuotes(input) {
  const firstQuoteIndex = input.indexOf('"');
  const secondQuoteIndex = input.indexOf('"', firstQuoteIndex + 1);
  return input.slice(firstQuoteIndex + 1, secondQuoteIndex);
}
