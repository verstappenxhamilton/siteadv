const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const contentPath = path.join(__dirname, '..', '..', 'public', 'content.json');

// Endpoints for content management
router.get('/content', (req, res) => {
  fs.readFile(contentPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading content.json:', err);
      return res.status(500).json({ error: 'failed_to_read_content' });
    }
    try {
      const parsed = data ? JSON.parse(data) : {};
      res.json(parsed);
    } catch (parseError) {
      console.error('Invalid JSON inside content.json:', parseError);
      res.status(500).json({ error: 'invalid_content_json' });
    }
  });
});

router.post('/content', (req, res) => {
  const newContent = req.body;

  // Basic validation
  if (!newContent || typeof newContent !== 'object') {
    return res.status(400).json({ error: 'invalid_content' });
  }

  fs.writeFile(contentPath, JSON.stringify(newContent, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing to content.json:', err);
      return res.status(500).json({ error: 'failed_to_write_content' });
    }
    res.json({ ok: true });
  });
});

// New endpoint to list video files
router.get('/videos', (req, res) => {
  const videosDir = path.join(__dirname, '..', '..', 'public', 'videos');
  fs.readdir(videosDir, (err, files) => {
    if (err) {
      console.error('Error reading videos directory:', err);
      // If directory doesn't exist or is empty, return empty array
      return res.json([]);
    }
    const videoFiles = files.filter(file => file.endsWith('.mp4')).sort(); // Added .sort()
    res.json(videoFiles.map(file => `videos/${file}`)); // Return relative paths
  });
});

module.exports = router;
