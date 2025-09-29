require('dotenv').config();
const fs = require('fs');
const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');

app.use(
  cors({
    origin: '*', // Allow both origins
    credentials: true, // Allow cookies and credentials if needed
  })
);

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Log environment variables
console.log('OIDC_AUTHORITY:', process.env.OIDC_AUTHORITY);
console.log('OIDC_CLIENTID:', process.env.OIDC_CLIENTID);
console.log('OIDC_REVOKE_URI:', process.env.OIDC_REVOKE_URI);

// Update app-config.js with environment variables
const appConfigPath = path.resolve('./public/ohif/app-config.js');
if (fs.existsSync(appConfigPath)) {
  const appConfig = fs
    .readFileSync(appConfigPath, 'utf-8')
    .replaceAll('<OIDC_AUTHORITY>', process.env.OIDC_AUTHORITY)
    .replaceAll('<OIDC_CLIENTID>', process.env.OIDC_CLIENTID)
    .replaceAll('<OIDC_REVOKE_URI>', process.env.OIDC_REVOKE_URI);
  fs.writeFileSync(appConfigPath, appConfig);
}

// Middleware to rewrite paths
app.use((req, res, next) => {
  console.log('Request for:', req.url);

  // Rewrite paths for files to point to /ohif/ subdirectory
  const ohifPath = path.join(__dirname, 'public/ohif', req.path);
  if (fs.existsSync(ohifPath) && fs.lstatSync(ohifPath).isFile()) {
    console.log(`Serving ${req.path} from /ohif/`);
    return res.sendFile(ohifPath);
  }

  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the OHIF viewer's index.html for client-side routing
app.get('/ohif/*', (req, res) => {
  console.log('Serving OHIF index.html for:', req.url);
  res.sendFile(path.join(__dirname, 'public/ohif/index.html'));
});

// Fallback for unmatched routes
app.use((req, res) => {
  console.log(`404 Not Found: ${req.url}`);
  res.status(404).send('Not Found');
});

// Start the server
app.listen(3020, '0.0.0.0', () => console.log('Listening on port 3020!'));
