import React, { useContext, lazy, Suspense} from "react";
import { AuthContext } from "../contexts/authContext";
import RemoveFromFavorites from "../components/cardIcons/removeFromFavorites";
import WriteReview from "../components/cardIcons/writeReview";
const PageTemplate = lazy(() => import("../components/templateMovieListPage"));

const FavoriteMoviesPage = () => {
  const { favorites } = useContext(AuthContext);
  let movies = favorites;

  return (
    <Suspense fallback={<h1>Building Favourites Page</h1>}>
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