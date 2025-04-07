const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('insecure.db');

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS users");
  db.run("DROP TABLE IF EXISTS comments");

  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    email TEXT
  )`);

  db.run(`CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    body TEXT
  )`);

  db.run(`INSERT INTO users (username, email) VALUES ('admin', 'admin@example.com')`);
});

db.close();
