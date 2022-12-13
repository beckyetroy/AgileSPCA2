import React, { useContext, lazy, Suspense} from "react";
import { MoviesContext } from "../contexts/moviesContext";
import { useQueries } from "react-query";
import { fetchMovie } from "../api/movie-api";
import Spinner from '../components/spinner';
import RemoveFromFavorites from "../components/cardIcons/removeFromFavorites";
import WriteReview from "../components/cardIcons/writeReview";
const PageTemplate = lazy(() => import("../components/templateMovieListPage"));

const FavoriteMoviesPage = () => {
  const {favorites: movieIds } = useContext(MoviesContext);

  // Create an array of queries and run in parallel.
  const favoriteMovieQueries = useQueries(
    movieIds.map((movieId) => {
      return {
        queryKey: ["movie", movieId],
        queryFn: () => fetchMovie(movieId),
      };
    })
  );
  // Check if any of the parallel queries is still loading.
  const isLoading = favoriteMovieQueries.find((m) => m.isLoading === true);

  if (isLoading) {
    return (
      <Spinner />
    );
  }

  const movies = favoriteMovieQueries.map((q) => {
    q.data.genre_ids = q.data.genres.map(g => g.id)
    return q.data
  });

  //const toDo = () => true;

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