export function isLyricsContainAllWords(lyrics, words) {
    // Convert lyrics to lowercase and split by non-word characters or underscores, ignoring punctuation
    const lyricsWords = lyrics.toLowerCase().split(/\W+/);

    // Normalize the words to check by converting to lowercase
    const normalizedWords = words.map(word => word.toLowerCase());

    // Check if every word in the list is included in the lyrics words
    return normalizedWords.every(word => lyricsWords.includes(word));
}
