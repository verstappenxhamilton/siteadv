const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const defaultContent = require('../../shared/defaultContent.json');
const rootDir = path.join(__dirname, '..', '..');
const contentPath = path.join(rootDir, 'public', 'content.json');
const videosDir = path.join(rootDir, 'public', 'videos');

// Endpoints for content management
router.get('/content', async (req, res) => {
  try {
    const data = await fs.promises.readFile(contentPath, 'utf8');
    return res.json(JSON.parse(data));
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn('content.json not found, returning default content.');
      return res.json(defaultContent);
    }
    console.error('Error reading content.json:', err);
    return res.status(500).json({ error: 'failed_to_read_content' });
  }
});

router.post('/content', async (req, res) => {
  const newContent = req.body;

  if (!newContent || typeof newContent !== 'object') {
    return res.status(400).json({ error: 'invalid_content' });
  }

  try {
    await fs.promises.mkdir(path.dirname(contentPath), { recursive: true });
    await fs.promises.writeFile(contentPath, JSON.stringify(newContent, null, 2), 'utf8');
    return res.json({ ok: true });
  } catch (err) {
    console.error('Error writing to content.json:', err);
    return res.status(500).json({ error: 'failed_to_write_content' });
  }
});

// New endpoint to list video files
router.get('/videos', async (req, res) => {
  try {
    const files = await fs.promises.readdir(videosDir);
    const videoFiles = files.filter((file) => file.endsWith('.mp4')).sort();
    return res.json(videoFiles.map((file) => `videos/${file}`));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error reading videos directory:', err);
    }
    return res.json([]);
  }
});

module.exports = router;
