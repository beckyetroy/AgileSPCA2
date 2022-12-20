import React, { useState, createContext } from "react";
import { login, signup } from "../api/movie-api";
import { addFavourite } from "../api/movie-api";
import { getFavourites } from "../api/movie-api";
import { removeFavourite } from "../api/movie-api";

export const AuthContext = createContext(null);

const AuthContextProvider = (props) => {
  const existingToken = localStorage.getItem("token");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(existingToken);
  const [userName, setUserName] = useState("");
  const [favorites, setFavorites] = useState( [] );

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
    }
  };

  const register = async (username, password) => {
    const result = await signup(username, password);
    return (result.code === 201) ? true : false;
  };

  const signout = () => {
    setTimeout(() => setIsAuthenticated(false), 100);
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
        favorites
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;