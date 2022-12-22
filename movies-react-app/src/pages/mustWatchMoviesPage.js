import React, { useContext, useState, lazy, Suspense} from "react";
import { AuthContext } from "../contexts/authContext";
import RemoveFromMustWatch from '../components/cardIcons/removeFromMustWatch'
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
const PageTemplate = lazy(() => import("../components/templateMovieListPage"));

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

const MustWatchMoviesPage = () => {
  const { mustwatch } = useContext(AuthContext);
  const context = useContext(AuthContext);

  const handleSnackClose = (event) => {
    context.setMustWatchRemoved(false);
  };

  let movies = mustwatch;

  return (
    <Suspense fallback={<h1>Building Must Watch Movies Page</h1>}>
      <Snackbar
        sx={styles.snack}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={context.mustwatchRemoved}
        onClose={handleSnackClose}
      >
        <MuiAlert
          severity="success"
          variant="filled"
          onClose={handleSnackClose}
        >
          <Typography variant="h4">
            Movie Removed From Must Watch
          </Typography>
        </MuiAlert>
      </Snackbar>      
      <PageTemplate
        title="Your Must-Watch Movies"
        movies={movies}
        action={(movie) => {
          return (
            <>
              <RemoveFromMustWatch movie={movie} />
            </>
          );
        }}
      />
    </Suspense>
  );
};

export default MustWatchMoviesPage;