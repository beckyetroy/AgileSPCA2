export const login = (username, password) => {
    return fetch('/api/users', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify({ username: username, password: password })
    }).then(res => res.json())
};

export const signup = (username, password) => {
    return fetch('/api/users?action=register', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify({ username: username, password: password })
    }).then(res => res.json())
};

export const fetchGenres = async () => {
    return fetch("/api/genres", {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'get'}).then(res => res.json())
  };

export const fetchMovies = async () => {
    return fetch("/api/movies/discover", {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'get'}).then(res => res.json())
  };

export const fetchUpcomingMovies = async () => {
    return fetch("/api/movies/upcoming", {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'get'}).then(res => res.json())
  };

export const fetchTrendingMoviesWeek = async () => {
    return fetch("/api/movies/trending/week", {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'get'}).then(res => res.json())
  };

export const fetchTrendingMoviesToday = async () => {
    return fetch("/api/movies/trending/today", {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'get'}).then(res => res.json())
  };

export const fetchMovie = async ({ queryKey }) => {
    const [, idPart] = queryKey;
    const { id } = idPart;
    return fetch(`/api/movies/${id}`, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'get'}).then(res => res.json())
  };

export const fetchMovieImages = async ({ queryKey }) => {
    const [, idPart] = queryKey;
    const { id } = idPart;
    return fetch(`/api/movies/${id}/images`, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'get'}).then(res => res.json())
  };

export const fetchMovieReviews = async (id) => {
    return fetch(`/api/reviews/${id}`, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'get'}).then(res => res.json())
  };

export const fetchMovieCredits = async (args) => {
    const [, idPart] = args.queryKey;
    const { id } = idPart;
    return fetch(`/api/people/movie/${id}/credits`, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'get'}).then(res => res.json())
  };

export const fetchPersonDetails = async (args) => {
    const [, idPart] = args.queryKey;
    const { id } = idPart;
    return fetch(`/api/people/${id}`, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'get'}).then(res => res.json())
  };

export const addFavourite = (movie, username) => {
    return fetch('/api/users/' + username + '/favourites', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify(movie)
    }).then(res => res.json())
  };

export const getFavourites = async (username) => {
    return fetch('/api/users/' + username + '/favourites', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'get'}).then(res => res.json())
  };

export const removeFavourite = (movie, username) => {
    return fetch('/api/users/' + username + '/favourites?action=remove' , {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify(movie)
    }).then(res => res.json())
  };

export const addMustWatch = (movie, username) => {
    return fetch('/api/users/' + username + '/mustwatch', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify(movie)
    }).then(res => res.json())
  };

export const getMustWatch = async (username) => {
    return fetch('/api/users/' + username + '/mustwatch', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'get'}).then(res => res.json())
  };

export const removeMustWatch = (movie, username) => {
    return fetch('/api/users/' + username + '/mustwatch?action=remove' , {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify(movie)
    }).then(res => res.json())
  };