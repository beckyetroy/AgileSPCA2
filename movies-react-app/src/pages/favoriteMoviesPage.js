import React, { useContext, useState, lazy, Suspense} from "react";
import { AuthContext } from "../contexts/authContext";
import RemoveFromFavorites from "../components/cardIcons/removeFromFavorites";
import WriteReview from "../components/cardIcons/writeReview";
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


const FavoriteMoviesPage = () => {
  const { favorites } = useContext(AuthContext);
  const context = useContext(AuthContext);

  const handleSnackClose = (event) => {
    context.setFavoriteRemoved(false);
  };

  let movies = favorites;

  return (
    <Suspense fallback={<h1>Building Favourites Page</h1>}>
      <Snackbar
        sx={styles.snack}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={context.favoriteRemoved}
        onClose={handleSnackClose}
      >
        <MuiAlert
          severity="success"
          variant="filled"
          onClose={handleSnackClose}
        >
          <Typography variant="h4">
            Movie Removed From Favourites
          </Typography>
        </MuiAlert>
      </Snackbar>
      <PageTemplate
        title="Favorite Movies"
        movies={movies}
        action={(movie) => {
          return (
            <>
              <RemoveFromFavorites movie={movie} />
              <WriteReview movie={movie} />
            </>
          );
        }}
      />
    </Suspense>
  );
};

export default FavoriteMoviesPage;