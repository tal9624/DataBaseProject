import openDb from './dbConnection.js';

export async function processSongs(songs, db) {
    try {
        const insert = await db.prepare(`INSERT INTO songs (song_serial, song_name, file_path, date_of_writing, writer_name, source, album_name, artist_name, release_date, youtube_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        for (const song of songs) {
            const SongSerial = song.SongSerial[0];
            const SongName = song.SongName[0];
            const FilePath = song.FilePath[0];
            const DateOfWriting = song.DateOfWriting[0];
            const WriterName = song.WriterName[0];
            const Source = song.Source[0];
            const AlbumName = song.AlbumName[0];
            const ArtistName = song.ArtistName[0];
            const ReleaseDate = song.ReleaseDate[0];
            const YoutubePath = song.YoutubePath[0];

            await insert.run(
                SongSerial,
                SongName,
                FilePath,
                DateOfWriting,
                WriterName,
                Source,
                AlbumName,
                ArtistName,
                ReleaseDate,
                YoutubePath
            );
        }
        
        await insert.finalize();
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to insert songs into the database.');
    }
}


export async function processWordsInSongs(wordsInSongs, db) {
    try {
        const insert = await db.prepare(`INSERT INTO words_in_songs (word_serial_id, song_name, word, row, column) VALUES (?, ?, ?, ?, ?)`);

        for (const wordInSong of wordsInSongs) {
            const WordSerialId = wordInSong.WordSerialId[0];
            const SongName = wordInSong.SongName[0];
            const Word = wordInSong.Word[0];
            const Row = wordInSong.Row[0];
            const Column = wordInSong.Column[0];

            await insert.run(
                WordSerialId,
                SongName,
                Word,
                Row,
                Column,
            );
        }
        
        await insert.finalize();
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to insert words in songs into the database.');
    }
}


// export async function processWordCount(wordCounts, db) {
//     try {
//         const insert = await db.prepare(`INSERT INTO word_count (word_serial_id, word, counter, word_length) VALUES (?, ?, ?, ?)`);

//         for (const wordCount of wordCounts) {
//             const WordSerialId = wordCount.WordSerialId[0];
//             const Word = wordCount.Word[0];
//             const Counter = wordCount.Counter[0];
//             const WordLength = wordCount.WordLength[0];

//             await insert.run(
//                 WordSerialId,
//                 Word,
//                 Counter,
//                 WordLength
//             );
//         }

//         await insert.finalize();
//     } catch (error) {
//         console.error('Error:', error);
//         throw new Error('Failed to insert word counts into the database.');
//     }
// }


export async function processGroups(groups, db) {
    try {
        const insert = await db.prepare(`INSERT INTO groups (group_name) VALUES (?)`);

        for (const group of groups) {
            const GroupName = group.GroupName[0]; // Access the GroupName property as an array and get its first element

            await insert.run(
                GroupName
            );
        }

        await insert.finalize();
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to insert groups into the database.');
    }
}


export async function processWordGroups(wordGroups, db) {
    try {
        const insert = await db.prepare(`INSERT INTO word_groups (group_name, word) VALUES (?, ?)`);

        for (const wordGroup of wordGroups) {
            const GroupName = wordGroup.GroupName[0]; // Access the GroupName property as an array and get its first element
            const Word = wordGroup.Word[0]; // Access the Word property as an array and get its first element

            await insert.run(
                GroupName,
                Word
            );
        }

        await insert.finalize();
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to insert word groups into the database.');
    }
}


export async function processPhrases(phrases, db) {
    try {
        const insert = await db.prepare(`INSERT INTO phrases (phrase_ID, phrase_txt) VALUES (?, ?)`);

        for (const phrase of phrases) {
            const PhraseID = phrase.PhraseID[0]; // Access the PhraseID property as an array and get its first element
            const PhraseText = phrase.PhraseText[0]; // Access the PhraseText property as an array and get its first element

            await insert.run(
                PhraseID,
                PhraseText
            );
        }

        await insert.finalize();
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to insert phrases into the database.');
    }
}

export async function processPhrasesAtSongs(phrasesAtSongs, db) {
    try {
        const insert = await db.prepare(`INSERT INTO phrases_at_songs (phrase_ID, song_serial) VALUES (?, ?)`);

        for (const phraseAtSong of phrasesAtSongs) {
            const PhraseID = phraseAtSong.PhraseID[0]; // Access the PhraseID property as an array and get its first element
            const SongSerial = phraseAtSong.SongSerial[0]; // Access the SongSerial property as an array and get its first element

            await insert.run(
                PhraseID,
                SongSerial
            );
        }

        await insert.finalize();
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to insert phrases at songs into the database.');
    }
}
