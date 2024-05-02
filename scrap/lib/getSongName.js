export async function getSongName(page) {
  const header_title_main = await page
    .locator(".header_title_main")
    .innerText();
  const song = extractStringInQuotes(header_title_main);
  return song;
}

function extractStringInQuotes(input) {
  const firstQuoteIndex = input.indexOf('"');
  const secondQuoteIndex = input.indexOf('"', firstQuoteIndex + 1);
  return input.slice(firstQuoteIndex + 1, secondQuoteIndex);
}
