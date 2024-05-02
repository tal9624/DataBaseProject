export async function getWriter(page) {
    const divsWithReleased = page.locator('div[data-hide="1"]:has(span:text("Writer"))');

    let writer = 'N/A';
    if(await divsWithReleased.locator('span').nth(1).count()>0) {
      writer = await divsWithReleased.locator('span').nth(1).textContent();
    }

    return writer;
}