import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import { useForm, Controller } from "react-hook-form";
import React, { useState, useContext } from "react";
import { AuthContext } from "../../contexts/authContext";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";

const styles = {
  root: {
    marginTop: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
  },
  form: {
    width: "100%",
    "& > * ": {
      marginTop: 2,
    },
  },
  textField: {
    width: "40ch",
  },
  submit: {
    marginRight: 2,
  },
  snack: {
    width: "50%",
    "& > * ": {
      width: "100%",
    },
  },
};

const ReviewForm = ({ movie }) => {
  const context = useContext(AuthContext);
  const [rating, setRating] = useState(3);
  const [author, setAuthor] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [open, setOpen] = useState(false); 
  const [authorError, setAuthorError] = useState('');
  const [contentError, setContentError] = useState('');
  const navigate = useNavigate();
  const username = context.userName;

  const defaultValues = {
    author: "",
    reviewContent: "",
    agree: false,
    rating: 3,
  };

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm(defaultValues);

  const handleRatingChange = (event) => {
    event.preventDefault();
    setRating(Number(event.target.value));
  };

  const handleAuthorChange = (event) => {
    event.preventDefault();
    setAuthor(event.target.value);
  };

  const handleContentChange = (event) => {
    event.preventDefault();
    setReviewContent(event.target.value);
  };

  const onSubmit = (review) => {
    //Perform form validation
    if (author === '') {
      setAuthorError('Name is Required');
    } else if (reviewContent === ''){
      setContentError('Review cannot be empty');
    } else if (reviewContent.length < 10) {
      setContentError('Review is too short');
    }
    else {
      let newReview = {
        rating: rating,
        author: author,
        author_details: {
          name: author,
          username: username,
          rating: rating,
        },
        content: reviewContent,
        created_at: new Date(),
        id: Math.random().toString(36).slice(2, 7),
        updated_at: new Date()
      }
      context.addMovieReview(movie, newReview);
      setOpen(true); // NEW
    }
  };

  const handleSnackClose = (event) => {
    setOpen(false);
    navigate("/movies/favorites");
  };

  return (
    <Box component="div" sx={styles.root}>
      <Typography component="h2" variant="h3">
        Submit Your Review
      </Typography>

      <Snackbar
        sx={styles.snack}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={open}
        onClose={handleSnackClose}
      >
        <MuiAlert
          severity="success"
          variant="filled"
          onClose={handleSnackClose}
        >
          <Typography variant="h4">
            Thank you for submitting a review
          </Typography>
        </MuiAlert>
      </Snackbar>

      <form sx={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          sx={{ width: "40ch" }}
          defaultValue=""
          variant="outlined"
          margin="normal"
          onChange={handleAuthorChange}
          value={author}
          id="author"
          label="Author's name"
          name="author"
          autoFocus
        />
        <Typography variant="h6" component="p">
          { authorError ? 
              authorError
          : null }
        </Typography>
  
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          defaultValue=""
          name="reviewContent"
          value={reviewContent}
          onChange={handleContentChange}
          label="Review text"
          id="reviewContent"
          multiline
          minRows={10}
        />
        <Typography variant="h6" component="p">
          { contentError ? 
              contentError
          : null }
        </Typography>

        <Controller
          control={control}
          name="rating"
          render={({ field: { onChange, value } }) => (
            <Rating
              name="rating"
              value={rating}
              size="large"
              sx={{
                fontSize: "4rem"
              }}
              onChange={handleRatingChange}
            />
          )}
        />

        <Box sx={styles.buttons}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={styles.submit}
          >
            Submit
          </Button>
          <Button
            type="reset"
            variant="contained"
            color="secondary"
            sx={styles.submit}
            onClick={() => {
              setAuthor('');
              setReviewContent('');
              setRating(3);
            }}
          >
            Reset
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ReviewForm;