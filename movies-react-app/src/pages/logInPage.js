import React, { useContext, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from '../contexts/authContext';
import { Link } from "react-router-dom";
import { CardActions, Typography } from "@mui/material";
import LogInHeader from "../components/headerLogIn";
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

const LoginPage = props => {
  const context = useContext(AuthContext);

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    context.authenticate(userName, password);
  };

  let location = useLocation();

  // Set 'from' to path where browser is redirected after a successful login - either / or the protected path user requested
  const { from } = location.state ? { from: location.state.from.pathname } : { from: "/" };

  if (context.isAuthenticated === true) {
    return <Navigate to={from} />;
  }

  return (
    <>
      <LogInHeader />
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
          </CardContent>
          <CardActions style={{justifyContent: 'center'}}>
            <Button variant="contained" size="large" onClick={login} sx={{maxWidth: '90%',
              minWidth: '50%', backgroundColor: '#9a23ae', '&:hover': {
                backgroundColor: '#ebbff2',
                color: '#9a23ae',}
              }}>
            Log In
            </Button>
          </CardActions>
          <Typography variant="p" component="p" sx={{textAlign: "center", padding: '1%'}}>
              Not Registered?
          </Typography>
          <Typography variant="p" component="p" sx={{textAlign: "center", padding: '1%'}}>
            <Link to="/signup" sx={{paddingBotton: '10%'}}>Sign Up!</Link>
          </Typography>
        </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default LoginPage;