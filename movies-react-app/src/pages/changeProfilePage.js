import React, { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from '../contexts/authContext';
import { CardActions, Typography } from "@mui/material";
import ManageProfileHeader from "../components/headerManageProfile";
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

const ChangeProfilePage = props => {
  const context = useContext(AuthContext)
  const username = context.userName;
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [changed, setChanged] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pwInstructions, setPwInstructions] = useState("");
  const [openSnack, setOpen] = useState(false);
  const [openSnackLogOut, setOpenLogOut] = useState(false);

  const updateProfile = async () => {
    let passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const validPassword = passwordRegEx.test(password);

    if (!password || !passwordAgain ) {
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
      const result = await context.updateUser(username, password);
      if (!result) {
        setErrorMessage("Sorry, there was a problem. Please try again later.")
      }
      else {
        setErrorMessage("");
        setOpen(true);
      }
    }
  }

  const logOut = async () => {
    setOpenLogOut(true);
  }

  const handleSnackClose = (event) => {
    setOpen(false);
    setChanged(true);
  };

  const handleSnackLogOutClose = (event) => {
    setOpenLogOut(false);
    context.signout();
  };

  if (changed === true) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <ManageProfileHeader />
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
            Password Updated
          </Typography>
        </MuiAlert>
      </Snackbar>
      <Snackbar
        sx={styles.snack}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={openSnackLogOut}
        onClose={handleSnackLogOutClose}
      >
        <MuiAlert
          severity="success"
          variant="filled"
          onClose={handleSnackLogOutClose}
        >
          <Typography variant="h4">
            Successfully Logged Out
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
          <Typography variant="h6">
            Update Password
          </Typography>
          <Typography variant="h8" sx={{fontStyle: "italic"}}>
            Enter and Confirm New Password for {username}'s account:
          </Typography>
            <TextField
              sx={{...formControl}}
              id="password"
              label="New Password"
              type="password"
              variant="outlined"
              onChange={e => {
                setPassword(e.target.value);
              }}
            />
            <TextField
              sx={{...formControl}}
              id="passwordAgain"
              label="Confirm New Password"
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
            <Button variant="contained" size="large" onClick={updateProfile} sx={{maxWidth: '90%',
              minWidth: '50%', backgroundColor: '#9a23ae', '&:hover': {
                backgroundColor: '#ebbff2',
                color: '#9a23ae',}
              }}>
            Confirm Changes
            </Button>
          </CardActions>
        </Card>
        <Card 
          sx={{
            maxWidth: '100%',
            textAlign: "center",
          }} 
          variant="outlined">
            <CardContent>
              <Typography variant="h6">
                Other Actions
              </Typography>
            </CardContent>
            <CardActions style={{justifyContent: 'center', paddingBottom: '5%'}}>
            <Button variant="contained" size="large" onClick={logOut} sx={{maxWidth: '90%',
              minWidth: '50%', backgroundColor: '#9a23ae', '&:hover': {
                backgroundColor: '#ebbff2',
                color: '#9a23ae',}
              }}>
            Log Out
            </Button>
          </CardActions>
        </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default ChangeProfilePage;