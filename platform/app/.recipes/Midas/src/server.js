
require('dotenv').config();
const fs = require('fs');
const express = require('express');
const path = require('path'); // To handle file paths
const app = express();

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Check if the environment variables are set
console.log('OIDC_AUTHORITY:', process.env.OIDC_AUTHORITY);
console.log('OIDC_CLIENTID:', process.env.OIDC_CLIENTID);
console.log('OIDC_REVOKE_URI:', process.env.OIDC_REVOKE_URI);

console.log(fs.readdirSync(path.resolve('./')));
const appConfigPath = path.resolve('./public/ohif/app-config.js');
const appConfig = fs.readFileSync(appConfigPath)
.toString('utf-8')
.replaceAll('<OIDC_AUTHORITY>', process.env.OIDC_AUTHORITY)
.replaceAll('<OIDC_CLIENTID>', process.env.OIDC_CLIENTID)
.replaceAll('<OIDC_REVOKE_URI>', process.env.OIDC_REVOKE_URI); // Add this line
fs.writeFileSync(appConfigPath, appConfig);


app.use(express.static('public')); // 'public' should be your folder with static files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'ohif/index.html'));
});
app.listen(3020, '0.0.0.0', () => console.log('Listening on port 3020!'));
