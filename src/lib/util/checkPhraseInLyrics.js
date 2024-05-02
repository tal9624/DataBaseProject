export function checkPhraseInLyrics(phrase, lyrics) {
  // Prepare the regular expression to search for the phrase with boundaries (\b) or spaces
  // Escape special characters in the phrase for the regex
  let escapedPhrase = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  let regex = new RegExp(`(^|\\s)${escapedPhrase}(\\s|$)`, 'i'); // The 'i' flag makes the search case-insensitive

  // Test if the phrase is found in the lyrics according to the specified conditions
  if (regex.test(lyrics)) {
    console.log(`The phrase "${phrase}" appears in the lyrics with correct boundaries.`);
    return true;
  } else {
    console.log(`The phrase "${phrase}" does not appear in the lyrics with the correct boundaries.`);
    return false;
  }
}