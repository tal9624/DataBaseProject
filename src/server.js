import express from "express";
import SqlUtil from "./lib/SqlUtil.js";

const DB_PATH = "./src/db/songs_database.db";
const PORT = 3000;

const app = express();
const sqlUtil = new SqlUtil(DB_PATH);

app.use(express.static("public"));
app.use(express.json());

app.get("/getAllSongNames", sqlUtil.getAllSongNames);
app.get("/getWordCountStats", sqlUtil.getWordCountStats);
app.get("/getAllSongAndLyrics", sqlUtil.getAllSongAndLyrics);
app.get("/getAllGroups", sqlUtil.getAllGroups);
app.get("/getAllPhrases", sqlUtil.getAllPhrases);
app.get("/getAllWordsAndGroups", sqlUtil.getAllWordsAndGroups);
app.get("/getLinesInParagraphStats", sqlUtil.getLinesInParagraphStats);
app.get("/getCountOfWordLengths", sqlUtil.getCountOfWordLengths);
app.get("/getCountOfAllWords", sqlUtil.getCountOfAllWords);
app.get("/exportXML", sqlUtil.exportXML);

app.post("/getSongByStructData", sqlUtil.getSongByStructData);
app.post("/postSong", sqlUtil.postSong);
app.post("/addGroup", sqlUtil.addGroup);
app.post("/addWordToGroup", sqlUtil.addWordToGroup);
app.post("/removeGroup", sqlUtil.removeGroup);
app.post("/bulk", sqlUtil.bulkPost);
app.post("/getWordByIndex", sqlUtil.getWordByIndex);
app.post("/ShowAllWordsInSongs",sqlUtil.ShowAllWordsInSongs);
app.post("/ShowReference",sqlUtil.ShowReference);
app.post("/showIndexOfAWord",sqlUtil.showIndexOfAWord);
app.post("/showRowInParagraph",sqlUtil.showRowInParagraph);
app.post("/IndexesForGroupWords",sqlUtil.IndexesForGroupWords);
app.post("/addPhrase",sqlUtil.addPhrase);
app.post("/showPhrase",sqlUtil.showPhrase);


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
