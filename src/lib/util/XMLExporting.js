export function convertDataToXML(data) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>';
  xml += '<Database>';

  // Songs
  xml += '<Songs>';
  data.songs.forEach(song => {
      xml += `<Song>
                  <SongSerial>${song.song_serial}</SongSerial>
                  <SongName>${song.song_name}</SongName>
                  <DateOfWriting>${song.date_of_writing}</DateOfWriting>
                  <WriterName>${song.writer_name}</WriterName>
                  <Source>${song.source}</Source>
                  <AlbumName>${song.album_name}</AlbumName>
                  <ArtistName>${song.artist_name}</ArtistName>
                  <ReleaseDate>${song.release_date}</ReleaseDate>
                  <YoutubePath>${song.youtube_path}</YoutubePath>
              </Song>`;
  });
  xml += '</Songs>';

  // Words in Songs
  xml += '<WordsInSongs>';
  data.wordsInSongs.forEach(word => {
      xml += `<WordInSong>
                  <WordSerialId>${word.word_serial_id}</WordSerialId>
                  <SongId>${word.song_serial}</SongId>
                  <Word>${word.word}</Word>
                  <Row>${word.row}</Row>
                  <Column>${word.column}</Column>
                  <ColumnEnd>${word.column_end}</ColumnEnd>
              </WordInSong>`;
  });
  xml += '</WordsInSongs>';

  // Word Count
//   xml += '<WordCounts>';
//   data.wordCounts.forEach(wordCount => {
//       xml += `<WordCount>
//                   <WordSerialId>${wordCount.word_serial_id}</WordSerialId>
//                   <Word>${wordCount.word}</Word>
//                   <Counter>${wordCount.counter}</Counter>
//                   <WordLength>${wordCount.word_length}</WordLength>
//               </WordCount>`;
//   });
//   xml += '</WordCounts>';

  // Groups
  xml += '<Groups>';
  data.groups.forEach(group => {
      xml += `<Group>
                  <GroupName>${group.group_name}</GroupName>
              </Group>`;
  });
  xml += '</Groups>';

  // Word Groups
  xml += '<WordGroups>';
  data.wordGroups.forEach(wordGroup => {
      xml += `<WordGroup>
                  <GroupName>${wordGroup.group_name}</GroupName>
                  <Word>${wordGroup.word}</Word>
              </WordGroup>`;
  });
  xml += '</WordGroups>';

  // Phrases
  xml += '<Phrases>';
  data.phrases.forEach(phrase => {
      xml += `<Phrase>
                  <PhraseID>${phrase.phrase_ID}</PhraseID>
                  <PhraseText>${phrase.phrase_txt}</PhraseText>
              </Phrase>`;
  });
  xml += '</Phrases>';

  // Phrases at Songs
  xml += '<PhrasesAtSongs>';
  data.phrasesAtSongs.forEach(phraseAtSong => {
      xml += `<PhraseAtSong>
                  <PhraseID>${phraseAtSong.phrase_ID}</PhraseID>
                  <SongSerial>${phraseAtSong.song_serial}</SongSerial>
              </PhraseAtSong>`;
  });
  xml += '</PhrasesAtSongs>';

  xml += '</Database>';
  return xml;
}