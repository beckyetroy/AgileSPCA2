import React, { useContext, lazy, Suspense} from "react";
import { AuthContext } from "../contexts/authContext";
import RemoveFromMustWatch from '../components/cardIcons/removeFromMustWatch'
const PageTemplate = lazy(() => import("../components/templateMovieListPage"));

const MustWatchMoviesPage = () => {
  const { mustwatch } = useContext(AuthContext);

  let movies = mustwatch;

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