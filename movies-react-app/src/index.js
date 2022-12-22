import React, { lazy, Suspense } from "react";
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Navigate, Routes } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "react-query";
import { ReactQueryDevtools } from 'react-query/devtools';
import { TrendingMoviesPageWeek, TrendingMoviesPageDay} from "./pages/trendingMoviesPage";
import SiteHeader from './components/siteHeader';
import LoginPage from "./pages/logInPage";
import SignUpPage from "./pages/signUpPage";
import ChangeProfilePage from "./pages/changeProfilePage";
import AuthProvider from "./contexts/authContext";
import ProtectedRoutes from "./contexts/protectedRoutes";
const HomePage = lazy(() => import("./pages/homePage"));
const MoviePage = lazy(() => import( "./pages/movieDetailsPage"));
const PersonPage = lazy(() => import("./pages/personDetailsPage"));
const FavoriteMoviesPage = lazy(() => import("./pages/favoriteMoviesPage"));
const MustWatchMoviesPage = lazy(() => import("./pages/mustWatchMoviesPage"));
const MovieReviewPage = lazy(() => import("./pages/movieReviewPage"));
const UpcomingMoviesPage = lazy(() => import("./pages/upcomingMoviesPage"));
const CastListPage = lazy(() => import("./pages/castListPage"));
const CrewListPage = lazy(() => import("./pages/crewListPage"));
const AddMovieReviewPage = lazy(() => import('./pages/addMovieReviewPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 360000,
      refetchInterval: 360000, 
      refetchOnWindowFocus: false
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<h1>Loading header</h1>}>
            <SiteHeader />
          </Suspense>
          <Suspense fallback={<h1>Loading page</h1>}>
            <Routes>
              <Route path="/login" element={ <LoginPage /> } />
              <Route path="/signup" element={ <SignUpPage /> } />
              <Route path="/reviews/:id" element={ <MovieReviewPage /> } />

              <Route element={<ProtectedRoutes />}>
                <Route path="/account" element={<ChangeProfilePage />} />
                <Route path="/movies/favorites" element={<FavoriteMoviesPage />} />
                <Route path="/movies/mustwatch" element={<MustWatchMoviesPage />} />
                <Route path="/reviews/form" element={ <AddMovieReviewPage /> } />
              </Route>

              <Route path="/movies/:id" element={<MoviePage />} />
              <Route path="/person/:id" element={<PersonPage />} />
              <Route path="/movies/:id/cast" element={<CastListPage />} />
              <Route path="/movies/:id/crew" element={<CrewListPage />} />
              <Route path="/movies/upcoming" element={<UpcomingMoviesPage />} />
              <Route path="/movies/trending/week" element={<TrendingMoviesPageWeek />} />
              <Route path="/movies/trending/today" element={<TrendingMoviesPageDay />} />
              <Route path="/" element={<HomePage/>} />
              <Route path="*" element={ <Navigate to="/" /> } />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));