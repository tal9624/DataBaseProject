export async function getSongsUrls(page) {
  const links = await page
    .locator("a.high_profile")
    .evaluateAll((links) =>
      links.map((link) => (link instanceof HTMLAnchorElement ? link.href : ""))
    );

  return links;
}
