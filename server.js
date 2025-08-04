// server.js
import express from 'express';
import downloadHandler from './api/download.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/download', downloadHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
