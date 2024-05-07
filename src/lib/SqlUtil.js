import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { parseString } from 'xml2js';
import { promises as fs } from 'fs';
import xml2js from 'xml2js';

import {
  getWordsMap,
  // splitToParagraphs,
  // isLyricsContainAllWords,
  convertDataToXML,
  processSongs, processWordsInSongs,
  processGroups,processWordGroups,
  processPhrases,processPhrasesAtSongs
} from "./util/index.js";
import convert from "xml-js";

export default class SqlUtil {
  db;
  constructor(filename) {
    this.init(filename);
  }

  async init(filename) {
    this.db = await open({
      filename,
      driver: sqlite3.Database,
    });
  }

  bulkPost = async (req, res) => {
    const xml = req.body.xml;

    parseString(xml, { explicitArray: false, trim: true }, async (err, result) => {
      if (err) {
        console.error('Error parsing XML:', err);
        return res.status(500).json({ error: 'Failed to parse XML' });
      }

      try {
        // Access the JSON string inside the <song> tag
        const jsonString = result.song;
        // Parse the JSON string into an array of songs
        const songs = JSON.parse(jsonString);

        for (const song of songs) {
          await this.postSong(
            { body: { ...song, dateOfWriting: new Date().toISOString() } },
            res
          );
        }
        console.log("Bulk upload finished");
        res.status(200).send('Songs uploaded successfully');
      } catch (error) {
        console.error('Error processing songs:', error);
        res.status(500).json({ error: 'Failed to process songs' });
      }
    });
  };


  postSong = async (req, res) => {
    try {
      const isExsit = await this.insertSong(req, res);
      if (!isExsit) {
        await this.insertWords(req, res);
        console.log(
          `insert ${req.body.artistName} - ${req.body.songName}, finished`
        );
        return res.status(200);
      }
    } catch (error) {
      console.log(error);
      return res.status(500);
    }
  };

  execute = async (params) => {
    const { req, res, query, queryParams } = params;
    try {
      const rows = await this.db.run(query, queryParams);
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
      return res.status(500);
    }
  };

  insertSong = async (req, res) => {
    let {
      songName,
      dateOfWriting,
      writerName,
      source,
      albumName,
      artistName,
      releaseDate,
      youtubePath,
    } = req.body;

    const query = `
            INSERT INTO songs 
            (song_name, date_of_writing, writer_name, source, album_name, artist_name, release_date, youtube_path) 
            VALUES (?,  ?, ?, ?, ?, ?, ?, ?);
        `;

    try {
      await this.db.run(query, [
        songName,
        dateOfWriting,
        writerName,
        source,
        albumName,
        artistName,
        releaseDate,
        youtubePath,
      ]);
      res.status(200);
    } catch (err) {
      if (err.code.includes("SQLITE_CONSTRAINT")) {
        console.log(`Cannot insert duplicate song: ${songName}`);
        return true;
      } else {
        console.error(err.message);
      }
    }
  };

  clearDatabase = async () => {
    try {
      // Delete all rows from the tables
      await this.db.run("DELETE FROM songs");
      await this.db.run("DELETE FROM words_in_songs");
      await this.db.run("DELETE FROM word_groups");
      await this.db.run("DELETE FROM groups");
      await this.db.run("DELETE FROM phrases");
      await this.db.run("DELETE FROM phrases_at_songs");

      // Reset auto-increment counters if necessary
      await this.db.run("DELETE FROM sqlite_sequence WHERE name='songs'");
      await this.db.run("DELETE FROM sqlite_sequence WHERE name='words_in_songs'");
      await this.db.run("DELETE FROM sqlite_sequence WHERE name='word_groups'");
      await this.db.run("DELETE FROM sqlite_sequence WHERE name='groups'");
      await this.db.run("DELETE FROM sqlite_sequence WHERE name='phrases'");
      await this.db.run("DELETE FROM sqlite_sequence WHERE name='phrases_at_songs'");

      return { message: "Database emptied successfully" };
    } catch (error) {
      console.error("Error emptying database:", error);
      throw new Error("Failed to empty database");
    }
  };

  insertWords = async (req, res) => {
    const wordsMap = getWordsMap(req.body.lyrics);
    let songId = await this.db.get(
      `SELECT MAX(song_serial) as max_id FROM songs`
    );

    try {
      await this.db.run("BEGIN"); // Start a transaction

      for (const [word, details] of Object.entries(wordsMap)) {
        // const wordCount = details.count;
        const occurrences = details.indexes;
        const wordLength = word.length;

        // Fetch the current maximum word_serial_id within the transaction
        const maxIdResult = await this.db.get(
          `SELECT MAX(word_serial_id) as max_id FROM words_in_songs`
        );
        let currentMaxId = maxIdResult.max_id || 0; // Default to 0 if table is empty

        let lastWordSerialId;

        for (const index of occurrences.entries()) {
          currentMaxId += 1; // Increment ID for each new row
          const result = await this.db.run(
            `INSERT INTO words_in_songs (word_serial_id, song_serial, word, row, column, column_end)
                     VALUES (?, ?, ?, ?, ?, ?)`,
            [
              currentMaxId,
              songId.max_id,
              word,
              index[1][0],
              index[1][1],
              index[1][2],
            ]
          );
          lastWordSerialId = currentMaxId; // Keep track of the last used ID
        }

        // Insert into word_count with the last used ID
        // if (lastWordSerialId) {
        //   await this.db.run(
        //     `INSERT INTO word_count (word_serial_id, word, counter, word_length)
        //              VALUES (?, ?, ?, ?)
        //              ON CONFLICT(word) DO UPDATE SET counter = counter + ?`,
        //     [lastWordSerialId, word, wordCount, wordLength, wordCount]
        //   );
        // }
      }

      await this.db.run("COMMIT"); // Commit the transaction
    } catch (error) {
      await this.db.run("ROLLBACK"); // Roll back the transaction on error
      console.error("Transaction failed:", error);
    }
  };
  // getWordCountStats = async (req, res) => {
  //   const data = await this.db.all(`SELECT word, counter
  //           FROM word_count
  //           ORDER BY counter DESC
  //           LIMIT 50;`);
  //   res.json(data);
  // };

  getWordCountStats = async (req, res) => {
    try {
        const data = await this.db.all(`
            SELECT word, count(word) AS counter
            FROM words_in_songs
            GROUP BY word
            ORDER BY counter DESC
            LIMIT 40;
        `);
        res.json(data);
    } catch (err) {
        console.error("Error retrieving word count stats:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

  getAllSongNames = async (req, res) => {
    const r = await this.db.all(`SELECT song_name FROM songs`);
    const data = r.map((s) => s.song_name);
    res.json(data);
  };


  getAllSongAndLyrics = async (req, res) => {
    // Fetch all words, ordered by song, row, and column
    const words = await this.db.all(
      `SELECT song_name, word, row
       FROM words_in_songs NATURAL JOIN songs
       ORDER BY song_name, row, column`
    );

    const data = {};
    let currentSong = "";
    let currentRow = 0; // Initial row number to be compared
    let paragraphText = "";

    // Process each word into paragraphs and songs
    for (const word of words) {
      if (currentSong !== word.song_name) {
        // Handle new song
        if (currentSong && paragraphText) {
          // Save the last paragraph of the previous song
          if (data[currentSong]) {
            data[currentSong] += "\n\n" + paragraphText; // Double line break for the end of song
          } else {
            data[currentSong] = paragraphText;
          }
        }
        // Reset for new song
        currentSong = word.song_name;
        currentRow = word.row;
        paragraphText = word.word; // Start new paragraph text
      } else if (word.row !== currentRow) {
        // Check the gap between the current and previous row
        if (word.row - currentRow == 1) {
          paragraphText += "\n"; // Single line break for adjacent rows
        } else {
          paragraphText += "\n\n"; // Double line break for non-adjacent rows
        }
        currentRow = word.row; // Update to new row
        paragraphText += word.word; // Start new paragraph or line text
      } else {
        // Continue adding words to the current paragraph
        paragraphText += " " + word.word;
      }
    }

    // Ensure the last paragraph is added to the song's data
    if (paragraphText) {
      if (data[currentSong]) {
        data[currentSong] += "\n\n" + paragraphText; // Ensure final paragraph is separated
      } else {
        data[currentSong] = paragraphText;
      }
    }
    res.json(data);
  
  };

  addGroup = async (req, res) => {
    const groupName = req.body.groupName;

    await this.db.run(
      `INSERT INTO groups (group_name)
             SELECT ?
             WHERE NOT EXISTS (
                 SELECT 1 FROM groups WHERE group_name = ?
             );`,
      [groupName, groupName]
    );
  };

  addWordToGroup = async (req, res) => {
    const groupName = req.body.groupName;
    const word = req.body.word;
    await this.db.run(
      `INSERT INTO word_groups (group_name, word)
         SELECT ?, ?
         WHERE NOT EXISTS (
             SELECT 1 FROM word_groups WHERE group_name = ? AND word = ?
         );`,
      [groupName, word, groupName, word]
    );
  };

  getAllGroups = async (req, res) => {
    const data = await this.db.all("SELECT * FROM groups");

    res.json(data.map((g) => g.group_name));
  };

  getAllPhrases = async (req, res) => {
    const data = await this.db.all("SELECT * FROM phrases");

    res.json(data);
  };

  removeGroup = async (req, res) => {
    const groupName = req.body.groupName;
    await this.db.all("DELETE FROM groups WHERE group_name = ?", [groupName]);
    await this.db.all("DELETE FROM word_groups WHERE group_name = ?", [
      groupName,
    ]);
  };

  getAllWordsAndGroups = async (req, res) => {
    const data = await this.db.all("SELECT * FROM word_groups");

    res.json(data);
  };

  getSongByStructData = async (req, res) => {
    const {
      songName,
      writerName,
      source,
      albumName,
      artistName,
      releaseDate,
      wordsToInclude,
    } = req.body;

    const query = `
            SELECT song_name, artist_name, youtube_path FROM songs
            WHERE (song_name LIKE CONCAT('%', ?, '%') OR ? IS null)
            AND (artist_name LIKE CONCAT('%', ?, '%') OR ? IS null)
            AND (album_name LIKE CONCAT('%', ?, '%') OR ? IS null)
            AND (writer_name LIKE CONCAT('%', ?, '%') OR ? IS null)
            AND (release_date = ? OR ? IS null)
            AND (source = ? OR ? IS null);
        `;

    const params = [
      songName,
      songName,
      artistName,
      artistName,
      albumName,
      albumName,
      writerName,
      writerName,
      releaseDate,
      releaseDate,
      source,
      source,
    ];
    let wordsArray = wordsToInclude.split(",").map((word) => word.trim());

    const resultHashMap = {
      youtubeVideoId: {},
    };
    try {
      const matchSongs = await this.db.all(query, params);
     
      for (const song of matchSongs) {
        // Fetch all words for a song, ordered by their row and column positions
        const r = await this.db.all(
          `SELECT word, row
          FROM words_in_songs NATURAL JOIN songs
          WHERE song_name = ?
          ORDER BY row ASC, column ASC`,
          [song.song_name]
        );
        console.log(r);
        let lyrics = "";
        let previousRow = r[0] ? r[0].row : null;

        r.forEach((wordInfo, index) => {
          // Check for row continuity
          if (previousRow !== null) {
            if (wordInfo.row === previousRow + 1) {
              lyrics += "\n"; // Add a newline for a new row
            } else if (wordInfo.row > previousRow + 1) {
              lyrics += "\n\n"; // Add a double newline for a skipped row (paragraph break)
            }
          }

          // Append the current word plus a space if not the last word in a row
          if (index < r.length - 1 && r[index + 1].row === wordInfo.row) {
            lyrics += wordInfo.word + " ";
          } else {
            lyrics += wordInfo.word; // Do not add an extra space after the last word in a row
          }

          // Update the previous row tracker
          previousRow = wordInfo.row;
        });

        // Function to check if lyrics contain all specified words
        const isLyricsContainAllWords = (lyrics, wordsArray) => {
          return wordsArray.every((word) =>
            lyrics.toLowerCase().includes(word.toLowerCase())
          );
        };

        if (isLyricsContainAllWords(lyrics, wordsArray)) {
          resultHashMap[
            `${song.artist_name.replaceAll("-", " ")} - ${song.song_name}`
          ] = lyrics;

          if (song.youtube_path != "N/A") {
            resultHashMap.youtubeVideoId[
              `${song.artist_name.replaceAll("-", " ")} - ${song.song_name}`
            ] = song.youtube_path.split("?v=")[1];
          }
        }
      }

      res.json(resultHashMap);
    } catch (err) {
      console.error(err.message);
    }
  };
  getWordByIndex = async (req, res) => {
    const songName = req.body.songName;
    const row = req.body.row;
    const column = req.body.column;

    const r = await this.db.all(
      `SELECT word from words_in_songs NATURAL JOIN songs 
      where song_Name = ? and row = ? and column <= ?
      and column_end >= ? `,
      [songName, row, column, column]
    );
    res.json(r);
  };
  ShowAllWordsInSongs = async (req, res) => {
    const songName = req.body.songName;
    if (songName == null) {
      const r = await this.db.all(
        `SELECT DISTINCT song_name,word from words_in_songs 
        NATURAL JOIN songs`
      );
      res.json(r);
    }
    if (songName != null) {
      const r = await this.db.all(
        `SELECT DISTINCT song_name,word from words_in_songs
         NATURAL JOIN songs where song_Name = ? `,
        [songName]
      );
      res.json(r);
    }
  };

  ShowReference = async (req, res) => {
    const songName = req.body.songName;
    const word = req.body.word;

    // Retrieve all words from the specified song ordered by row and column for proper sequencing
    const words = await this.db.all(
        `
        SELECT word, row
        FROM words_in_songs NATURAL JOIN songs
        WHERE song_name = ?
        ORDER BY row, column
        `,
        [songName]
    );

    let paragraphs = [];
    let currentParagraph = "";
    let previousRow = 0;

    // Compile words into paragraphs
    words.forEach((w, index) => {
        if (index === 0) {
            currentParagraph = w.word + " "; // Start the first paragraph
            previousRow = w.row;
        } else {
            // Check if the current word is part of the current paragraph or starts a new one
            if (w.row - previousRow <= 1) {
                // Continuation of the current paragraph
                currentParagraph += w.word + " ";
            } else {
                // New paragraph due to significant row gap
                paragraphs.push(currentParagraph.trim());
                currentParagraph = w.word + " "; // Start a new paragraph
            }
            previousRow = w.row;
        }
    });

    // Add the last paragraph if it exists
    if (currentParagraph) {
        paragraphs.push(currentParagraph.trim());
    }

    // Filter paragraphs to find any that contain the specified word
    const regex = new RegExp(`\\b${word}\\b`, 'i'); // Matching the word as a whole word
    const matchedParagraphs = paragraphs.filter(paragraph => regex.test(paragraph));

    // Return matched paragraphs
    if (matchedParagraphs.length > 0) {
        res.json(matchedParagraphs.map(paragraph => ({ paragraph_text: paragraph })));
    } else {
        res.json({ message: "No references found for the word in the song." });
    }
};



  showIndexOfAWord = async (req, res) => {
    const word = req.body.word;

    const r = await this.db.all(
      `
      SELECT song_name,row,column
      FROM words_in_songs NATURAL JOIN songs
      WHERE (
      word = ?   
      )`,
      [word]
    );
    res.json(r);
  };
  showRowInParagraph = async (req, res) => {
    const word = req.body.word;

    const r = await this.db.all(
      `
      SELECT song_name,row
      FROM words_in_songs NATURAL JOIN songs
      WHERE 
      (
       word = ? 
        
      )`,
      [word]
    );
    res.json(r);
  };

  IndexesForGroupWords = async (req, res) => {
    const groupName = req.body.groupName;

    const r = await this.db.all(
      `
      SELECT 
      word_groups.group_name,
      songs.song_name,
      words_in_songs.word,
      words_in_songs.row,
      words_in_songs.column
  FROM 
      (words_in_songs, 
      word_groups) NATURAL JOIN songs
  WHERE 
      word_groups.group_name = ? AND LOWER(words_in_songs.word) = LOWER(word_groups.word)
  `,
      [groupName]
    );
    res.json(r);
  };

  addPhrase = async (req, res) => {
    const phrase = req.body.phrase;
    const songName = req.body.songName;
    // First, ensure the phrase contains at least one space (indicating at least two words)
    if (!phrase.includes(" ")) {
      res.json({ message: "Phrase must contain at least two words." });
      return;
    }
    const words = await this.db.all(
      `
        SELECT word, row
        FROM words_in_songs NATURAL JOIN songs
        WHERE song_name = ? 
        ORDER BY row, column
        `,
      [songName]
    );
    // Insert the phrase into the phrases table
    // Compile words into paragraphs using row changes as paragraph breaks
    let currentRow = 0;
    let lyricsText = "";
    let currentParagraph = "";
    words.forEach((word, index) => {
      if (word.row !== currentRow) {
        if (currentParagraph) {
          lyricsText += currentParagraph.trim() + "\n\n"; // Add two new lines for a new paragraph
          currentParagraph = ""; // Reset paragraph
        }
        currentRow = word.row;
      }
      currentParagraph += word.word + " "; // Continue adding words to the current paragraph
    });
    // Add the last paragraph if exists
    if (currentParagraph) {
      lyricsText += currentParagraph.trim();
    }
    // Create a regex to search for the phrase, allowing for any non-word characters between words
    const regex = new RegExp(phrase.split(/\s+/).join("\\W+"), "i");

    // Check if the phrase exists within the compiled lyrics
    if (!regex.test(lyricsText)) {
      res.json({ message: "Phrase not found in song lyrics." });
      return;
    }

    // Process of adding the phrase to the database if not found earlier
    // This block only executes if the phrase is indeed found in the song
    const existingPhrase = await this.db.get(
      `SELECT phrase_ID FROM phrases WHERE phrase_txt = ?`,
      [phrase]
    );

    if (existingPhrase) {
      res.json({ message: "Phrase already exists." });
      return;
    }

    const result = await this.db.run(
      `
        INSERT INTO phrases (phrase_txt)
         VALUES (?)
      `,
      [phrase]
    );

    const phraseId = result.lastID; // Get the auto-incremented ID of the newly inserted phrase
    // Now, find the song_serial by the song name
    const song = await this.db.get(
      `SELECT song_serial FROM songs WHERE song_name = ?`,
      [songName]
    );
    await this.db.run(
      `
      INSERT INTO phrases_at_songs (phrase_ID, song_serial) VALUES 
      (?,?);
`,
      [phraseId, song.song_serial]
    );

    // Respond with success message
    res.json({ message: "Phrase added successfully", phraseId, song });
  };

  showPhrase = async (req, res) => {
    const selectedPhraseId = req.body.selectedPhraseId;
    const selectedPhraseValue = req.body.selectedPhraseValue;

    const songSerials = await this.db.all(
        `SELECT song_serial FROM phrases_at_songs WHERE phrase_ID = ?`,
        [selectedPhraseId]
    );

    if (songSerials.length === 0) {
        res.json({ message: "No song found for this phrase." });
        return;
    }

    let occurrences = [];

    for (let songSerial of songSerials) {
        const song = await this.db.get(
            `SELECT song_name FROM songs WHERE song_serial = ?`,
            [songSerial.song_serial]
        );

        if (!song) {
            continue;
        }

        const words = await this.db.all(
            `SELECT word, row FROM words_in_songs NATURAL JOIN songs WHERE song_name = ? ORDER BY row, column`,
            [song.song_name]
        );

        let paragraphs = [];
        let currentParagraph = "";
        let previousRow = words[0]?.row || 0;  // Start with the first word's row if available

        words.forEach((word, index) => {
            if (word.row - previousRow > 1) {
                // If there's more than a one-row gap, start a new paragraph
                if (currentParagraph) {
                    paragraphs.push(currentParagraph.trim());  // Save the finished paragraph
                    currentParagraph = "";  // Reset the paragraph content
                }
            }
            currentParagraph += word.word + " ";  // Continue adding words to the current paragraph
            previousRow = word.row;  // Update previousRow to the current word's row
        });

        // Don't forget to add the last paragraph if it exists
        if (currentParagraph) {
            paragraphs.push(currentParagraph.trim());
        }

        // Now search each paragraph for the phrase
        const regex = new RegExp(`\\b${selectedPhraseValue.split(/\s+/).join("\\s+")}\\b`, "i");
        paragraphs.forEach(paragraph => {
            if (regex.test(paragraph)) {
                occurrences.push({
                    song_name: song.song_name,
                    text: paragraph  // Return the paragraph containing the phrase
                });
            }
        });
    }

    if (occurrences.length > 0) {
        res.json(occurrences);
    } else {
        res.json({ message: "Phrase not found in any song lyrics." });
    }
};


  getLinesInParagraphStats = async (req, res) => {
    const r = await this.db.all(
      `
      SELECT DISTINCT song_name, row
      FROM words_in_songs NATURAL JOIN songs
      ORDER BY song_name ,row;
`
    );
    res.json(r);
  };

  getCountOfWordLengths = async (req, res) => {
    try {
        const data = await this.db.all(`
            SELECT LENGTH(word) AS word_length, COUNT(word) AS total_count
            FROM words_in_songs
            GROUP BY LENGTH(word)
            ORDER BY LENGTH(word);
        `);
        res.json(data);
    } catch (err) {
        console.error("Error retrieving word length counts:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


  // getCountOfWordLengths = async (req, res) => {
  //   const r = await this.db.all(
  //     `SELECT sum(counter) AS total_count,word_length
  //      FROM word_count
  //      GROUP BY word_length
  //      ORDER BY word_length;`
  //   );
  //   res.json(r);
  // };

  
  // getCountOfAllWords = async (req, res) => {
  //   const r = await this.db.all(
  //     `SELECT sum(counter) AS words_sum from word_count;`
  //   );
  //   res.json(r);
  // };

  getCountOfAllWords = async (req, res) => {
    try {
        const data = await this.db.get(`
            SELECT COUNT(*) AS words_sum
            FROM words_in_songs;
        `);
        res.json(data);
    } catch (err) {
        console.error("Error retrieving total word count:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

  exportXML = async (req, res) => {
    try {
        // Query data from each table
        const songs = await this.db.all(`SELECT * FROM songs`);
        const wordsInSongs = await this.db.all(`SELECT * FROM words_in_songs`);
        // const wordCounts = await this.db.all(`SELECT * FROM word_count`);
        const wordGroups = await this.db.all(`SELECT * FROM word_groups`);
        const groups = await this.db.all(`SELECT * FROM groups`);
        const phrases = await this.db.all(`SELECT * FROM phrases`);
        const phrasesAtSongs = await this.db.all(`SELECT * FROM phrases_at_songs`);

        // Convert the data to XML
        const xmlData = convertDataToXML({ songs, wordsInSongs, wordGroups, groups, phrases, phrasesAtSongs });

        // Set headers to tell the browser to download the file
        res.header("Content-Type", "application/xml");
        res.header("Content-Disposition", "attachment; filename=data.xml");
        res.send(xmlData);
    } catch (error) {
        console.error('Failed to export XML:', error);
        res.status(500).send("Failed to export data.");
    }
};

// Asynchronously process and import XML data into the database
importXML = async (req, res) => {
  // Ensure there is a file part in the request
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  const filePath = req.file.path;
  
  try {
    const filePath = req.file.path;
    const data = await fs.readFile(filePath);
    let result = await xml2js.parseStringPromise(data);
    // Assuming your XML structure follows the output format of your export function
    if (typeof result.Database.Songs[0].Song !== 'undefined')
    await processSongs(result.Database.Songs[0].Song, this.db);
    if (typeof result.Database.WordsInSongs[0].WordInSong !== 'undefined')
    await processWordsInSongs(result.Database.WordsInSongs[0].WordInSong,this.db);
    // await processWordCount(result.Database.WordCounts[0].WordCount,this.db);
    if (typeof result.Database.Groups[0].Group !== 'undefined')
    await processGroups(result.Database.Groups[0].Group,this.db);

    if (typeof result.Database.WordGroups[0].WordGroup !== 'undefined')
    await processWordGroups(result.Database.WordGroups[0].WordGroup,this.db);

    if (typeof result.Database.Phrases[0].Phrase !== 'undefined')
    await processPhrases(result.Database.Phrases[0].Phrase,this.db);

    if (typeof result.Database.PhrasesAtSongs[0].PhraseAtSong !== 'undefined')
    await processPhrasesAtSongs(result.Database.PhrasesAtSongs[0].PhraseAtSong,this.db);

    // Clean up the uploaded file after processing
    await fs.unlink(filePath);

    res.json({ message: 'XML data imported successfully!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process XML file.', details: error.message });
  }
  console.log(`File uploaded at ${filePath}`);
};


}
