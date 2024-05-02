export async function getReleaseDate(page) {
  const divsWithReleased = page.locator(
    'div[data-hide="1"]:has(span:text("Released"))'
  );

  let releaseDate = "N/A";
  if ((await divsWithReleased.locator("span").nth(1).count()) > 0) {
    releaseDate = await divsWithReleased.locator("span").nth(1).textContent();
  }

  return releaseDate;
}
