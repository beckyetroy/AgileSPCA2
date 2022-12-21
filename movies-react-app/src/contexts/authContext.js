import React, { useState, createContext } from "react";
import { login, signup } from "../api/movie-api";
import { addFavourite, getFavourites, removeFavourite } from "../api/movie-api";
import { addMustWatch, getMustWatch, removeMustWatch } from "../api/movie-api";
import { addReview } from "../api/movie-api";

export const AuthContext = createContext(null);

const AuthContextProvider = (props) => {
  const existingToken = localStorage.getItem("token");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(existingToken);
  const [userName, setUserName] = useState("");
  const [favorites, setFavorites] = useState( [] );
  const [mustwatch, setMustWatch] = useState( [] );

  //Function to put JWT token in local storage.
  const setToken = (data) => {
    localStorage.setItem("token", data);
    setAuthToken(data);
  }

  const authenticate = async (username, password) => {
    const result = await login(username, password);
    if (result.token) {
      setToken(result.token)
      setIsAuthenticated(true);
      setUserName(username);
      getFavoritesList(username);
      getMustWatchList(username);
    }
  };

  const register = async (username, password) => {
    const result = await signup(username, password);
    return (result.code === 201) ? true : false;
  };

  const signout = async () => {
    await setIsAuthenticated(false);
  }

  const addToFavorites = async (movie, username) => {
    const result = await addFavourite(movie, username);
    await getFavoritesList(username);
    return (result.code === 201) ? true : false;
  };

  const getFavoritesList = async (username) => {
    const result = await getFavourites(username);
    setFavorites(result);
    return (result.code === 201) ? true : false;
  };

  const removeFromFavorites = async (movie, username) => {
    const result = await removeFavourite(movie, username);
    setFavorites(result);
    return (result.code === 201) ? true : false;
  };

  const addToMustWatch = async (movie, username) => {
    const result = await addMustWatch(movie, username);
    await getMustWatchList(username);
    return (result.code === 201) ? true : false;
  };

  const getMustWatchList = async (username) => {
    const result = await getMustWatch(username);
    setMustWatch(result);
    return (result.code === 201) ? true : false;
  };

  const removeFromMustWatch = async (movie, username) => {
    const result = await removeMustWatch(movie, username);
    setMustWatch(result);
    return (result.code === 201) ? true : false;
  };

  const addMovieReview = async (movie, review) => {
    const result = await addReview(movie.id, review);
    return (result.code === 201) ? true : false;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authenticate,
        register,
        signout,
        userName,
        addToFavorites,
        getFavoritesList,
        removeFromFavorites,
        favorites,
        addToMustWatch,
        getMustWatchList,
        removeFromMustWatch,
        mustwatch,
        addMovieReview
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;