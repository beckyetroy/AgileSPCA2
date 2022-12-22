import React, { useEffect } from 'react';
import GoogleIcon from '@mui/icons-material/Google';
import { googleSignIn } from '../../api/movie-api';
import { Button } from '@mui/material';
import { googleLoad } from '../../api/movie-api';
import { googleAuthenticate } from '../../api/movie-api';

function signInCallback(authResult) {
    if (authResult['code']) {
      googleAuthenticate(authResult['code']);
    } else {
    }
}

function handleSignInClick() {
    googleSignIn().then(signInCallback);
}

const GoogleAuthButton = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/client:platform.js?onload=start';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    googleLoad();
  }, []);

  return (
    <div>
      <Button variant="contained" size="large" onClick={handleSignInClick} sx={{maxWidth: '90%',
              minWidth: '50%', backgroundColor: '#4285F4', '&:hover': {
                backgroundColor: '#6ea3f7'}
              }}>
            <GoogleIcon color="white"/> Continue With Google
        </Button>
    </div>
  );
};

export default GoogleAuthButton;