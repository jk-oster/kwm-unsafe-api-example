const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database('insecure.db');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());


app.get('/', (req, res) => {
  res.send(`<html><body>
    Welcome to the insecure API! Use <a href="/user?id=1">/user</a> or <a href="/comments">/comments</a>.
    </body></html>`);
});

// ⚠️ SQL Injection
app.get('/user', (req, res) => {
  const id = req.query.id; // keine Validierung!
  const sql = `SELECT * FROM users WHERE id = ${id}`; // direkt eingebaut
  db.get(sql, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || {});
  });
});

// ⚠️ Stored XSS
app.post('/comment', (req, res) => {
  console.log(req.body);
  const body = req.body?.comment || '';
  const sql = `INSERT INTO comments (body) VALUES ('${body}')`;
  db.run(sql, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    // res.json({ status: 'saved', id: this.lastID, comment: body });
    res.redirect('/comments'); // redirect to comments page
  });
});

// (z.B. Ausgabe – kein Escaping)
app.get('/comments', (req, res) => {
  db.all(`SELECT * FROM comments`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // wird direkt als HTML eingebettet – XSS olé
    const html = rows.map(c => `<p>${c.body}</p>`).join('');
    res.send(`<html><body>
      <a href="/">Home</a>
      <a href="/user?id=1">/user</a>

      <h1>Comments</h1>
      ${html}

      <form method="POST" action="/comment">
        <textarea name="comment"></textarea>
        <button type="submit">Add Comment</button>
      </form>

      <h2>Settings</h2>
      <form method="POST" action="/settings">
        <input type="text" name="email" placeholder="Email" />
        <button type="submit">Update Settings</button>
      </form>
    </body></html>`);
  });
});

// ⚠️ CSRF (keine Prüfung, keine Authentifizierung)
app.post('/settings', (req, res) => {
  const email = req.body.email || '';
  const sql = `UPDATE users SET email = '${email}' WHERE id = 1`;
  db.run(sql, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ status: 'settings updated' });
  });
});

// Port starten
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚨 Insecure API listening on http://localhost:${PORT}`);
});
