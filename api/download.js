import request from 'request';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) return res.status(400).send('Missing url');

  const headers = {
    'Referer': 'https://moviebox.ng/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  };

  request
    .get({ url: decodeURIComponent(url), headers })
    .on('response', (response) => {
      res.setHeader('Content-Disposition', 'attachment; filename=movie.mp4');
      res.setHeader('Content-Type', 'video/mp4');
    })
    .on('error', () => {
      res.status(500).send('Error downloading file');
    })
    .pipe(res);
}
