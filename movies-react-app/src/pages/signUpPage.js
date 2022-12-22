import React, { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from '../contexts/authContext';
import { CardActions, Typography } from "@mui/material";
import SignUpHeader from "../components/headerSignUp";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from '@mui/material/Button';
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const styles = {
  root: {
    marginTop: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
  },
  form: {
    width: "100%",
    "& > * ": {
      marginTop: 2,
    },
  },
  textField: {
    width: "40ch",
  },
  submit: {
    marginRight: 2,
  },
  snack: {
    width: "50%",
    "& > * ": {
      width: "100%",
    },
  },
};

const formControl = 
  {
    margin: 1,
    maxWidth: '90%',
    minWidth: '50%'
  };

const SignUpPage = props => {
  const context = useContext(AuthContext)
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [registered, setRegistered] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pwInstructions, setPwInstructions] = useState("");
  const [openSnack, setOpen] = useState(false);

  const register = async () => {
    let passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const validPassword = passwordRegEx.test(password);

    if (!userName || !password || !passwordAgain ) {
      setPwInstructions("");
      setErrorMessage("Please enter all details.");
    }

    else if (!validPassword) {
      setErrorMessage("Password Invalid. Please try again.");
      setPwInstructions("*Password must contain a minimum of eight characters " +
        "with at least one uppercase letter, one lowercase letter, one number " +
        "and one special character.*")
    }

    else if (validPassword && password !== passwordAgain) {
      setPwInstructions("");
      setErrorMessage("Passwords don't match. Please try again.")
    }

    else if (validPassword && password === passwordAgain) {
      setPwInstructions("");
      const result = await context.register(userName, password);
      if (!result) {
        setErrorMessage("Username already taken. Please try again.")
      }
      else {
        setErrorMessage("");
        setOpen(true);
      }
    }
  }

  const handleSnackClose = (event) => {
    setOpen(false);
    setRegistered(true);
  };

  if (registered === true) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <SignUpHeader />
      <Snackbar
        sx={styles.snack}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={openSnack}
        onClose={handleSnackClose}
      >
        <MuiAlert
          severity="success"
          variant="filled"
          onClose={handleSnackClose}
        >
          <Typography variant="h4">
            Successfully Registered
          </Typography>
        </MuiAlert>
      </Snackbar>
      <Grid container spacing={5} alignItems="center"
            justifyContent="center" sx={{ padding: '1%'}}>
        <Grid item={8}>
        <Card 
          sx={{
            maxWidth: '100%',
            textAlign: "center",
          }} 
          variant="outlined">
          <CardContent>
            <TextField
              sx={{...formControl}}
              id="username"
              label="Username"
              variant="outlined"
              onChange={e => {
                setUserName(e.target.value);
              }}
            />
            <TextField
              sx={{...formControl}}
              id="password"
              label="Password"
              type="password"
              variant="outlined"
              onChange={e => {
                setPassword(e.target.value);
              }}
            />
            <TextField
              sx={{...formControl}}
              id="passwordAgain"
              label="Confirm Password"
              type="password"
              variant="outlined"
              onChange={e => {
                setPasswordAgain(e.target.value);
              }}
            />
            <Typography variant="h9" component="p" sx={{fontStyle: "italic"}}>
              { errorMessage ? 
                  errorMessage
              : null }
            </Typography>
            <Typography variant="h9" component="p" sx={{fontSize: "0.8em"}}>
              { pwInstructions ? 
                  pwInstructions
              : null }
            </Typography>
          </CardContent>
          <CardActions style={{justifyContent: 'center', paddingBottom: '5%'}}>
            <Button variant="contained" size="large" onClick={register} sx={{maxWidth: '90%',
              minWidth: '50%', backgroundColor: '#9a23ae', '&:hover': {
                backgroundColor: '#ebbff2',
                color: '#9a23ae',}
              }}>
            Sign Up
            </Button>
          </CardActions>
        </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default SignUpPage;