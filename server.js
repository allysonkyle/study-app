const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const db = new Database(path.join(__dirname, 'conversations.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// API: Save a conversation
app.post('/api/conversations', (req, res) => {
  try {
    const { topic, response } = req.body;
    if (!topic || response === undefined) {
      return res.status(400).json({ error: 'Topic and response are required' });
    }

    const stmt = db.prepare('INSERT INTO conversations (topic, response) VALUES (?, ?)');
    const result = stmt.run(topic, response);

    res.status(201).json({
      id: result.lastInsertRowid,
      topic,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error saving conversation:', err);
    res.status(500).json({ error: 'Failed to save conversation' });
  }
});

// API: Get all conversations (optional - for history view)
app.get('/api/conversations', (req, res) => {
  try {
    const stmt = db.prepare(
      'SELECT id, topic, response, created_at FROM conversations ORDER BY created_at DESC'
    );
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

app.listen(PORT, () => {
  console.log(`AI Study Helper running at http://localhost:${PORT}`);
});
