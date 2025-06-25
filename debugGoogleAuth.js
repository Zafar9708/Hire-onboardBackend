require('dotenv').config();
const { google } = require('googleapis');
const { OAuth2 } = google.auth;

async function debug() {
  console.log('Starting debug...');

  const oAuth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });

  console.log(' Credentials before getAccessToken():', oAuth2Client.credentials);

  const access = await oAuth2Client.getAccessToken();
  console.log(' Access Token Result:', access);
  console.log(' Credentials after getAccessToken():', oAuth2Client.credentials);
}

debug().catch(err => console.error('❌ Debug failed:', err));
