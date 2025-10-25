import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Simple health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Fallback for SPA or root
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
