import express from 'express';
import fetch from 'node-fetch';
import { URL } from 'url';
import { pipeline } from 'stream';
import { promisify } from 'util';

const app = express();
const PORT = process.env.PORT || 3000;

const ALLOWED_HOSTNAME = 'valiw.hakunaymatata.com';
const pipe = promisify(pipeline);

app.get('/proxy', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing video url' });
  }

  try {
    const parsedUrl = new URL(videoUrl);

    if (
      parsedUrl.hostname !== ALLOWED_HOSTNAME ||
      !parsedUrl.pathname.endsWith('.mp4')
    ) {
      return res.status(403).json({ error: 'URL not allowed' });
    }

    const response = await fetch(videoUrl);

    if (!response.ok) {
      return res.status(502).json({ error: 'Failed to fetch video' });
    }

    const contentLength = response.headers.get('content-length') || '0';

    // Set download headers
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="movie.mp4"');
    res.setHeader('Content-Length', contentLength);

    // Pipe entire response (no range)
    await pipe(response.body, res);

  } catch (err) {
    console.error('Download proxy error:', err.message);
    res.status(500).json({ error: 'Proxy failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Download-only proxy server running on port ${PORT}`);
});
