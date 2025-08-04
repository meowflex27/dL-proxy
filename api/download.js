// api/download.js
import https from 'https';
import http from 'http';

export default function downloadHandler(req, res) {
  const { video, filename = 'download.mp4' } = req.query;

  if (!video) {
    return res.status(400).json({ error: 'Missing video parameter.' });
  }

  const targetUrl = decodeURIComponent(video);
  const isHttps = targetUrl.startsWith('https');
  const client = isHttps ? https : http;

  const headers = {
    'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
    'Referer': 'https://valiw.hakunaymatata.com/',
    'Origin': 'https://valiw.hakunaymatata.com',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
  };

  if (req.headers.range) {
    headers['Range'] = req.headers.range;
  }

  const options = { headers };

  client.get(targetUrl, options, (proxyRes) => {
    if (proxyRes.statusCode >= 400) {
      return res.status(proxyRes.statusCode).json({ error: 'Failed to fetch video.' });
    }

    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      'Access-Control-Allow-Origin': '*',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': 'application/octet-stream',
    });

    proxyRes.pipe(res);
  }).on('error', (err) => {
    console.error('Proxy download error:', err);
    res.status(500).json({ error: 'Proxy failed.' });
  });
}
