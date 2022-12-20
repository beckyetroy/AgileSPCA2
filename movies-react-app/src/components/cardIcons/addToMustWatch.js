import React, { useContext } from "react";
import { AuthContext } from "../../contexts/authContext";
import IconButton from "@mui/material/IconButton";
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';

const AddToMustWatch = ({ movie }) => {
  const context = useContext(AuthContext);
  const username = context.userName;

  const handleAddToMustWatch = (e) => {
    e.preventDefault();
    context.addToMustWatch(movie, username);
  };

  return (
    <>
    {context.isAuthenticated ?
      <IconButton aria-label="add to must watch" onClick={handleAddToMustWatch}>
        <PlaylistAddIcon color="primary" fontSize="large" />
      </IconButton>
    : null }
    </>
  );
};

export default AddToMustWatch;