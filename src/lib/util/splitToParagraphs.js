export function splitToParagraphs (lyrics) {
    return lyrics.trim().split(/\n\s*\n/);
}