export function getAlbumFromUrl(url) {
    const match = url.match(/lyrics-(.+?)-[a-z0-9]+$/);
    if (match && match[1]) {
        return match[1];
    }
    return null;
}