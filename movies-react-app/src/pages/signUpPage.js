import React, { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from '../contexts/authContext';
import { CardActions } from "@mui/material";
import SignUpHeader from "../components/headerSignUp";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from '@mui/material/Button';

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

  const register = () => {
    let passwordRegEx = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/;
    const validPassword = passwordRegEx.test(password);

    if (validPassword && password === passwordAgain) {
      context.register(userName, password);
      setRegistered(true);
    }
  }

  if (registered === true) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <SignUpHeader />
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
      {/* <p>You must register a username and password to log in </p>
      <input value={userName} placeholder="user name" onChange={e => {
        setUserName(e.target.value);
      }}></input><br />
      <input value={password} type="password" placeholder="password" onChange={e => {
        setPassword(e.target.value);
      }}></input><br />
      <input value={passwordAgain} type="password" placeholder="password again" onChange={e => {
        setPasswordAgain(e.target.value);
      }}></input><br />
      {/* Login web form  */}
    </>
  );
};

export default SignUpPage;