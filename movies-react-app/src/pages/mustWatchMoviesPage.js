import React, { useContext, lazy, Suspense} from "react";
import { MoviesContext } from "../contexts/moviesContext";
import { useQueries } from "react-query";
import { fetchMovie } from "../api/movie-api";
import Spinner from '../components/spinner';
import RemoveFromMustWatch from '../components/cardIcons/removeFromMustWatch'
const PageTemplate = lazy(() => import("../components/templateMovieListPage"));

const MustWatchMoviesPage = () => {
  const {mustWatch: movieIds } = useContext(MoviesContext);

  // Create an array of queries and run in parallel.
  const mustWatchMovieQueries = useQueries(
    movieIds.map((movieId) => {
      return {
        queryKey: ["movie", movieId],
        queryFn: () => fetchMovie(movieId),
      };
    })
  );
  // Check if any of the parallel queries is still loading.
  const isLoading = mustWatchMovieQueries.find((m) => m.isLoading === true);

  if (isLoading) {
    return (
      <Spinner />
    );
  }

  const movies = mustWatchMovieQueries.map((q) => {
    q.data.genre_ids = q.data.genres.map(g => g.id)
    return q.data
  });

  //const toDo = () => true;

  return (
    <Suspense fallback={<h1>Building Must Watch Movies Page</h1>}>
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