import dotenv from 'dotenv';
import loglevel from 'loglevel';

dotenv.config();

export const exchangeAuthCodeForTokens = async (authCode) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URIS;
  const grantType = 'authorization_code';

  const tokenRequestBody = new URLSearchParams({
    code: authCode,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: grantType
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenRequestBody,
  });

  const tokens = await response.json();
  const accessToken = tokens.access_token;
  const refreshToken = tokens.refresh_token;
};

export const start = () => {
  gapi.load('auth2', function() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId) {
      auth2 = gapi.auth2.init({
        client_id: clientId,
      });
    } else {
      loglevel.info(clientId);
    }
  });
}

export const grantOfflineAccess = () => {
  auth2.grantOfflineAccess();
}