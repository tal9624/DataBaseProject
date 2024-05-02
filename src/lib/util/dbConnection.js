import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

// Open a database connection
async function openDb() {
    return open({
        filename: './db/songs_database.db',
        driver: sqlite3.Database
    });
}

export default openDb;
