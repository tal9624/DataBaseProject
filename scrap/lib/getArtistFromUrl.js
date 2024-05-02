export function getArtistFromUrl(url) {
  const parts = url.split("/");

  for (let part of parts) {
    if (part.includes("-")) {
      return capitalizeWords(part.split("-album")[0]);
    }
  }

  return null;
}

function capitalizeWords(str) {
  let words = str.split("-");

  for (let i = 0; i < words.length; i++) {
    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
  }

  return words.join("-");
}
