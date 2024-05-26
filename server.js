const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const leaderboardFile = path.join(__dirname, 'leaderboard.json');

app.get('/leaderboard', (req, res) => {
  fs.readFile(leaderboardFile, (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read leaderboard file' });
    }
    res.json(JSON.parse(data));
  });
});

app.post('/leaderboard', (req, res) => {
  const newEntry = req.body;
  fs.readFile(leaderboardFile, (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read leaderboard file' });
    }
    let leaderboard = JSON.parse(data);
    const existingEntry = leaderboard.find(entry => entry.address === newEntry.address);

    if (existingEntry) {
      existingEntry.score = Math.max(existingEntry.score, newEntry.score);
    } else {
      leaderboard.push(newEntry);
    }

    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);

    fs.writeFile(leaderboardFile, JSON.stringify(leaderboard, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to write leaderboard file' });
      }
      res.json(leaderboard);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
