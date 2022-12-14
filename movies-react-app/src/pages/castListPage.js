import React, { lazy, Suspense } from "react";
import { fetchMovieCredits } from "../api/movie-api";
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import Spinner from '../components/spinner';
const PageTemplate = lazy(() => import('../components/templateCastListPage'));

const CastListPage = (props) => {
  const { id } = useParams();
  const {  data, error, isLoading, isError }  = useQuery(
    ["credits", { id: id }], fetchMovieCredits
  );

  if (isLoading) {
    return (
      <Spinner />
    );
  }

  if (isError) {
    return <h1>{error.message}</h1>
  }

  const casts = data.cast;

  return (
    <Suspense fallback={<h1>Building Page</h1>}>
      <PageTemplate
        title='Cast'
        casts={casts}
      />
    </Suspense>
  );
};
export default CastListPage;