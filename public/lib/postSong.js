import { readFileAsText, getDate } from "./util/index.js";

export async function postSong() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        showModal("No file selected!");
        return;
    }
    const lyrics = await readFileAsText(file);
    const songName = document.getElementById('songNameInput').value.trim(); // Trim to remove any leading/trailing whitespace

    // Check if songName is empty
    if (!songName) {
        showModal("Song must have a name!");
        return;
    }

    const body = JSON.stringify({
        lyrics,
        filePath: file.name,
        songName: document.getElementById('songNameInput').value,
        dateOfWriting: getDate(),
        writerName: document.getElementById('writerNameInput').value,
        source: document.getElementById('source').value,
        albumName: document.getElementById('albumNameInput').value,
        artistName: document.getElementById('artistNameInput').value,
        youtubePath: document.getElementById('youtubeLink').value,
        releaseDate: document.getElementById('releaseDateInput').value
    });
    
  
    document.getElementById('songNameInput').value = '';
    document.getElementById('writerNameInput').value = '';
    document.getElementById('source').value = '';
    document.getElementById('albumNameInput').value = '';
    document.getElementById('artistNameInput').value = '';
    document.getElementById('releaseDateInput').value = '';
    document.getElementById('songText').value = '';
    document.getElementById('fileName').value = '';
    document.getElementById('youtubeLink').value = '';
    document.getElementById('fileNameDisplay').textContent = '';

    await fetch('/postSong', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body,
    });
}