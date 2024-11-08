const express = require('express');
const path = require('path'); // To handle file paths
const app = express();

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

app.use(express.static('public')); // 'public' should be your folder with static files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'ohif/index.html'));
});
app.listen(3020, '0.0.0.0', () => console.log('Listening on port 3020!'));
