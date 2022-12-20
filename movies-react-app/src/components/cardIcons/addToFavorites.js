import React, { useContext } from "react";
import { AuthContext } from "../../contexts/authContext";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";

const AddToFavoritesIcon = ({ movie }) => {
  const context = useContext(AuthContext);
  const username = context.userName;

  const handleAddToFavorites = (e) => {
    e.preventDefault();
    context.addToFavorites(movie, username);
  };

  return (
    <>
    {context.isAuthenticated ?
      <IconButton aria-label="add to favorites" onClick={handleAddToFavorites}>
        <FavoriteIcon color="primary" fontSize="large" />
      </IconButton>
    : null }
    </>
  );
};

export default AddToFavoritesIcon;