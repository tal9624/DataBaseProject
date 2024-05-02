export async function getLyrics(page) {
  const lyrics = await page.evaluate(() => {
    const lyricsContainer = document.querySelector("div#lyrics");
    let text = "";

    // Iterate over child nodes of the lyrics container
    // @ts-ignore
    for (const node of lyricsContainer.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        // Direct text nodes
        // @ts-ignore
        text += node.textContent.trim();
        // @ts-ignore
      } else if (node.tagName === "BR") {
        // Line breaks
        text += "\n";
        // @ts-ignore
      } else if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.tagName !== "DIV"
      ) {
        // Filter out unwanted tags (like ads inside 'div' elements)
        // @ts-ignore
        if (
          !node.classList.contains("lai_desktop_inline") &&
          !node.classList.contains("pubguru")
        ) {
          // @ts-ignore
          text += node.textContent.trim();
        }
      }
    }

    return text;
  });

  return lyrics;
}
