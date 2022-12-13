import React, { lazy, Suspense } from "react";
import { fetchMovieCredits } from "../api/movie-api";
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import Spinner from '../components/spinner';
const PageTemplate = lazy(() => import('../components/templateCrewListPage'));

const CrewListPage = (props) => {
  const { id } = useParams();
  const {  data, error, isLoading, isError }  = useQuery(
    "credits", () => fetchMovieCredits(id)
  );

  if (isLoading) {
    return (
      <Spinner />
    );
  }

  if (isError) {
    return <h1>{error.message}</h1>
  }  

  var seen = {};
  const crews = data.crew.filter(function(entry) {
    var previous;

    if (seen.hasOwnProperty(entry.id)) {
        previous = seen[entry.id];
        previous.job = previous.job + ', ' + entry.job;
        return false;
    }

    seen[entry.id] = entry;
    return true;
});;

  return (
    <Suspense fallback={<h1>Building Page</h1>}>
      <PageTemplate
        title='Crew'
        crews={crews}
      />
    </Suspense>
  );
};
export default CrewListPage;