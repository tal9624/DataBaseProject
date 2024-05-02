-- Drop existing tables if they exist
DROP TABLE paragraph;
DROP TABLE  words_in_songs;
DROP TABLE  word_count;
DROP TABLE songs;
DROP TABLE  word_groups;
DROP TABLE  groups;
DROP TABLE phrases;
DROP TABLE  phrases_at_songs;


CREATE TABLE songs (
    song_serial INTEGER PRIMARY KEY,
    song_name VARCHAR(255) NOT NULL UNIQUE,
    file_path TEXT,
    date_of_writing DATE,
    writer_name VARCHAR(255),
    source VARCHAR(255),
    album_name VARCHAR(255),
    artist_name VARCHAR(255),
    release_date VARCHAR(255),
    youtube_path VARCHAR(255)
);


CREATE TABLE paragraph (
    song_name VARCHAR(255),
    paragraph_number INTEGER,
    paragraph_text TEXT,
    num_of_rows integer,
    PRIMARY KEY (song_name, paragraph_number),
    FOREIGN KEY (song_name) REFERENCES songs (song_name)
);


CREATE TABLE words_in_songs (
    word_serial_id INTEGER PRIMARY KEY,
    song_name VARCHAR(255),
    word VARCHAR(255),
    word_count INTEGER,
    row INTEGER,
    column INTEGER,
    column_end INTEGER,
    FOREIGN KEY (song_name) REFERENCES songs (song_name)
    
);


CREATE TABLE word_count (
    word_serial_id INTEGER PRIMARY KEY,
    word VARCHAR(255) UNIQUE,
    counter INTEGER,
    word_length INTEGER,  
    FOREIGN KEY (word_serial_id) REFERENCES words_in_songs (word_serial_id)
);




CREATE TABLE word_groups (
    group_name VARCHAR(255),
    word INTEGER,
    PRIMARY KEY (group_name, word),
    FOREIGN KEY (group_name) REFERENCES groups (group_name),
    FOREIGN KEY (word) REFERENCES words_in_songs (word)
);



CREATE TABLE groups (
    group_name VARCHAR(255) PRIMARY KEY
);



CREATE TABLE phrases (
    phrase_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    phrase_txt TEXT UNIQUE
);

CREATE TABLE phrases_at_songs (
    phrase_ID INTEGER,
    song_serial INTEGER,
    PRIMARY KEY (phrase_ID, song_serial),
    FOREIGN KEY (phrase_ID) REFERENCES phrases (phrase_ID),
    FOREIGN KEY (song_serial) REFERENCES songs (song_serial)
);

