const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Enable CORS for all origins
app.use(cors());

// API route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend connected successfully 🚀' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
