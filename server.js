const express = require('express');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const greetingsData = [
    ['Morning', 'English', 'Good morning!', 'Formal'],
    ['Afternoon', 'English', 'Good afternoon!', 'Formal'],
    ['Evening', 'English', 'Good evening!', 'Formal'],
    ['Morning', 'English', 'Mornin\'!', 'Casual'],
    ['Afternoon', 'English', 'Afternoon!', 'Casual'],
    ['Evening', 'English', 'Evenin\'!', 'Casual'],
    ['Morning', 'French', 'Bonjour!', 'Formal'],
    ['Afternoon', 'French', 'Bon après-midi!', 'Formal'],
    ['Evening', 'French', 'Bon soiree!', 'Formal'],
    ['Morning', 'French', 'Salut!', 'Casual'],
    ['Afternoon', 'French', 'Bon après.', 'Casual'],
    ['Evening', 'French', 'Ouais Demain', 'Casual'],
    ['Morning', 'Spanish', 'Buen dia!', 'Formal'],
    ['Afternoon', 'Spanish', 'Buenas tardes!', 'Formal'],
    ['Evening', 'Spanish', 'Buenas noches!', 'Formal'],
    ['Morning', 'Spanish', 'Manana!', 'Casual'],
    ['Afternoon', 'Spanish', 'La tarde.', 'Casual'],
    ['Evening', 'Spanish', 'Cya manana!', 'Casual']
];

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/home.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
});

// Open the SQLite database
let db;
(async () => {
    db = await sqlite.open({
        filename: './data/database.db',
        driver: sqlite3.Database
    });

    //here in case of fire, push the red button and reset table
    //await db.exec('DROP TABLE IF EXISTS greetings');

    // Create a 'greetings' table if it doesn't exist
    await db.exec(`
    CREATE TABLE IF NOT EXISTS greetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timeOfDay TEXT NOT NULL,
      language TEXT NOT NULL,
      greetingMessage TEXT,
      tone TEXT NOT NULL
    )
  `);

    // Seed the 'greetings' table
    const insertQuery = `
        INSERT INTO greetings (timeOfDay, language, greetingMessage, tone)
        VALUES (?, ?, ?, ?)`;

    for (const greeting of greetingsData) {
        await db.run(insertQuery, greeting);
    }
})();

// GET all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await db.all('SELECT * FROM users');
        res.json({ message: 'success', data: users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST a new user
app.post('/api/users', async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    try {
        const result = await db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
        res.json({ message: 'success', data: { id: result.lastID, name, email } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
