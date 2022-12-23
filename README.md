# Assignment 2 - Web API.

Name: Rebecca Troy

## Features.

This section details the features that have been added to the application as part of CA2, as well as the pre-existing features that have been modified.

 + React Web App fully integrated with the Node API. All Calls to the TMDB API are done through the Node API.
 + Fully integrated with MongoDB
 + Log In functionality
      + New view
      + With advanced error checking and detailed error messages on failure
      + Custom site header to include username on log in
      + Access to favourites, must watch, manage account, and reviews feature on successful log in
 + Registration functionality
      + New view
      + With advanced error checking and  detailed error messages on failure
 + MongoDB schemas and documents for all movies, movie details, people, movie credits, and users handled.
     + Movie details schema is a nested document with movie reviews and images.
     + Users schema is also a nested document with lists of the users' favourite and must watch movies (as movie objects)
 + Reviews posted by the user are added to the DB and can be seen immediately in the web app (reviews list and reviews details page)
 + Favourites / must watch persistence after sign out (due to MongoDB integration)
 + Manage Account page with the following functionality:
     + User sign out
     + User change password
 + Improved UX (confirmation on removal of favourite or must watch, on successful registration and on successful log out)
 + Sign in with Google API partially implemented

## Setup requirements.

No additional steps are required to run this app locally.
First, run the below commands from within the **movies-api** directory to start the Node API:
```
npm install
npm run dev
```

Then follow the below commands from within the **movies-react-app** repo directory to start the app:

```
npm install
npm start
```

## API Configuration

This section describes the configuration that needs to take place before running the API.

### Prerequisites

Before configuring the API, it is required to create a MongoDB account and cluster, which will be used for storing and retrieving data for the app.

It is also recommended to create a Google Cloud Platform project and generate a Client ID and redirect URIs in order to use the Google Sign-In API code. However, as this code is not functional, this step is optional.

### Configuration

To run the API, an `.env` file must be created within the **movies-api** folder. The folder should contain the following variables:

______________________
NODEENV=develop
PORT=8080
HOST=localhost
MONGO_DB=YourMongoURL
SEED_DB=False 
SECRET=YourJTWSectret
REACT_APP_TMDB_KEY=YourTMDBKey
GOOGLE_CLIENT_ID=YourClientID
GOOGLE_CLIENT_SECRET=YourClientSecret
GOOGLE_REDIRECT_URIS=YourRedirectURIS
______________________

## API Design
This section gives an overview of the web API design. The design is as follows:

### Movies:
- /api/movies/discover | GET | Gets the most up to date list of 21 discover movies from the TMDB API and updates the values in the MongoDB
- /api/movies/upcoming | GET | Gets the most up to date list of 21 upcoming movies from the TMDB API and updates the values in the MongoDB
- /api/movies/trending/week | GET | Gets the most up to date list of 21 trending movies this week from the TMDB API and updates the values in the MongoDB
- /api/movies/trending/today | GET | Gets the most up to date list of 21 trending movies today from the TMDB API and updates the values in the MongoDB
- /api/movies/{movieid} | GET | Get a more detailed view of a particular movie and, if not already done so, stores it in the MongoDB
- /api/movies/{movieid}/images | GET | Get the poster images for a particular movie and update the values in the MongoDB

### Genres:
- /api/genres | GET | Get all genres from the TMDB API

### People:
- /api/people/movie/{movieid}/credits | GET | Get all cast and crew members of a particular movie from the TMDB API and, if not already done so, stores it in the MongoDB
- /api/people/{personid} | GET | Get a more detailed view of a particular person and, if not already done so, stores it in the MongoDB

### Reviews:
- /api/reviews/{movieid} | GET | Get all reviews for a particular movie and update the values in the MongoDB
- /api/reviews/{movieid} | POST | Create a new review for a particular movie and add it to the MongoDB

### Users:
- /api/users | GET | Get all users registered with the MongoDB
- /api/users | POST | Authenticate / validate username and password passed through and, if successful, log the user in and generate JWT token
- /api/users?action=register | POST | Authenticate / validate username and password passed through and, if successful, register the user with the MongoDB
- /api/users/{username} | PUT | Update the user's password if valid and update the MongoDB accordingly
- /api/users/{username}/favourites | GET | Get all movies in user's favourites list
- /api/users/{username}/favourites | POST | Add a movie to the user's favourites list on the MongoDB
- /api/users/{username}/favourites?action=remove | POST | Remove a movie from the user's favourites list on the MongoDB
- /api/users/{username}/mustwatch | GET | Get all movies in user's must watch list
- /api/users/{username}/mustwatch | POST | Add a movie to the user's must watch list on the MongoDB
- /api/users/{username}/mustwatch?action=remove | POST | Remove a movie from the user's must watch list on the MongoDB

### Google:
- /api/google/ | GET | Loads the necessary modules and Client ID for Google API
- /api/google/authenticate | POST | Pass a generated authentication code through the API in exchange for access tokens
- api/google/signin | GET | Grants offline access to the modules to sign in can occur

## Security and Authentication

This section details the authentication and security implemented on the API.

### Authentication

Authentication is carried out at the front-end (based on user input) and back-end (based on DB-compatibility) when a user registers and / or logs in.

Requirements for users when creating or editing their account are:
 + Usernames must be unique
 + Passwords must be a minimum of 8 characters long with at least one uppercase letter, one lowercase letter, one number, and one special character.

The API uses JSON web tokens upon successful user log in. A token is generated and verified by the application.

### Hash and Salt

All passwords are encrypted before being stored in the DB. This includes when a user first creates their password and if the user updates then goes onto update their password. Plaintext passwords are never handled by the DB.

### Protected routes

The following routes are only accessible by verified, logged in users:
 + /account: The 'manage account' page
 + /movies/favourites: The page containing the user's favourite movies
 + /movies/mustwatch: The page containing the user's must watch movies
 + /reviews/form: The page where a user can write a review of a particular movie (accessible from the favourite's page)

## Integrating with React App

As mentioned above, the React app has been entirely integrated with the API. All views use the Web API rather than the TMDB API.

This has been done by removing the /src/api/tmdb-api.js from the React App, and replacing it with /src/api/movie-api.js. This file contains all of the functions used by the React app to fetch routes from the Node API. Below is an example function:

```
export const fetchMovies = async () => {
    return fetch("/api/movies/discover", {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'get'}).then(res => res.json())
  };
```

All data displayed on the React App is called from the Web API, saved to MongoDB, and then the React App calls the data from the MongoDB. See an example function (/api/movies/{movieid}) below:

```
router.get('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const movie = await getMovie(id);
    if (movie) {
        try {
            let movieStored = await movieDetailsModel.findByMovieDBId(id);
            if (movieStored) {
                console.info(`movie details already stored.`);
            }
            else {
                movieStored = await movieDetailsModel.create(movie);
                console.info(`movie details successfully stored.`);
            }
            res.status(200).json(movieStored);
          } catch (err) {
            console.error(`failed to handle movie details data: ${err}`);
          }
    } else {
        res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
    }
}));
```

## Independent learning (if relevant)

Sign in via Google account through a 3rd party API has been partially implemented but is not functional.

The following steps were carried out:
 + A Google Cloud Platform project was made with Google Sign-In API enabled
 + A client ID and consent screen was created from the Google API Console
 + A Google Sign-In button was added to the app's log in page
 + Authentication was implemented in the Node API to exchange an authorisation code for an access token
 + The access token should then authorise the user

This code runs with no errors or problems, but nothing happens when the Google sign in button is pressed.

This was achieved by following [this tutorial](https://developers.google.com/identity/sign-in/web/server-side-flow).

See most recent commit (d0bbe2e9242a9d01471c21ba3a4f594c04dcf4a0) for full code.