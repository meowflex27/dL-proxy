import express from 'express';
import fetch from 'node-fetch';
import { URL } from 'url';
import { pipeline } from 'stream';
import { promisify } from 'util';

const app = express();
const PORT = process.env.PORT || 3000;

const pipe = promisify(pipeline);
const ALLOWED_HOSTNAME = 'valiw.hakunaymatata.com';

app.get('/proxy', async (req, res) => {
  const videoUrl = req.query.url;
  const filename = req.query.filename || 'movie.mp4';

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

    // Optional: add basic headers to mimic browser
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0 Safari/537.36',
        'Accept': '*/*',
        'Referer': `https://${ALLOWED_HOSTNAME}/`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Fetch failed:', response.status, text.slice(0, 300));
      return res.status(502).json({ error: 'Failed to fetch video', status: response.status });
    }

    const contentLength = response.headers.get('content-length') || '0';

    // Set download headers
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename.replace(/[^a-zA-Z0-9_\-.]/g, '_')}"`
    );
    res.setHeader('Content-Length', contentLength);

    await pipe(response.body, res);

  } catch (err) {
    console.error('Download proxy error:', err.message);
    res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Download-only proxy server running on port ${PORT}`);
});
