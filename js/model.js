import { all } from 'core-js/./es/promise';
import {
  CreateUser,
  shuffleArray,
  autoResolvePromise,
  AJAX,
} from './helper.js';
import { showsDatabase, billboardShows } from './placeholderDatabase.js';

// State object holds all data relevant to the current state of the application
let results_per_page = 6;

export const state = {
  users: {
    currUser: {},
    allUsers: [],
  },
  billboard:
    billboardShows[Math.floor(Math.random() * (billboardShows.length - 1))],
  genres: [],
  media: {
    // An array of objects where each object is a category.
    categories: [
      {
        name: 'Continue Watching',
        shows: showsDatabase.slice(0, 8),
      },
      {
        name: 'Drama',
        shows: shuffleArray(
          showsDatabase.filter((show) => show.genres.includes('Drama'))
        ),
      },
      {
        name: 'My List',
        shows: [
          showsDatabase[Math.floor(Math.random() * showsDatabase.length)],
          showsDatabase[Math.floor(Math.random() * showsDatabase.length)],
          showsDatabase[Math.floor(Math.random() * showsDatabase.length)],
          showsDatabase[Math.floor(Math.random() * showsDatabase.length)],
        ],
      },
      {
        name: 'Comedy',
        shows: shuffleArray(
          showsDatabase.filter((show) => show.genres.includes('Comedy'))
        ),
      },
      {
        name: 'Critically Acclaimed Movies',
        shows: shuffleArray(
          showsDatabase.filter((show) => show.genres.includes('Movies'))
        ),
      },
      {
        name: 'To Keep You On Your Toes',
        shows: shuffleArray(
          showsDatabase.filter(
            (show) =>
              show.genres.includes('Mystery') ||
              show.genres.includes('Thriller')
          )
        ),
      },
      {
        name: 'Suspense',
        shows: shuffleArray(
          showsDatabase.filter((show) => show.genres.includes('Suspenseful'))
        ),
      },
    ],
  },
  search: {
    query: '',
    result: '',
  },
};

export const getCurrUserData = function (userID) {
  state.users.currUser = state.users.allUsers.find(
    (user) => user.username === userID
  );

  state.billboard =
    billboardShows[Math.floor(Math.random() * (billboardShows.length - 1))];
};

export const getCategories = async function (genre = null) {
  const data = genre
    ? await AJAX(
        `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=${mapGenre(
          genre
        )}`
      )
    : await AJAX(
        'https://api.themoviedb.org/3/tv/popular?language=en-US&page=1'
      );

  // Get logos to display
  for (let i = 0; i < data.results.length; i++) {
    const show = data.results[i];
    const logo = await AJAX(
      `https://api.themoviedb.org/3/tv/${show.id}/images?language=en`
    );
    show.logo = logo['logos'][0]?.['file_path'];
  }

  const shows = data.results.map((show) => {
    return {
      name: show['original_name'],
      thumbnail: `https://image.tmdb.org/t/p/original${show['backdrop_path']}`,
      logo: show.logo
        ? `https://image.tmdb.org/t/p/original${show.logo}`
        : null,
    };
  });

  console.log(shows);

  state.media.categories.push({
    name: genre ? genre : 'Popular',
    shows,
  });

  const test = {
    adult: false,
    backdrop_path: '/tncbMvfV0V07UZozXdBEq4Wu9HH.jpg',
    genre_ids: [28, 80, 53, 35],
    id: 573435,
    original_language: 'en',
    original_title: 'Bad Boys: Ride or Die',
    overview:
      'After their late former Captain is framed, Lowrey and Burnett try to clear his name, only to end up on the run themselves.',
    popularity: 9457.863,
    poster_path: '/nP6RliHjxsz4irTKsxe8FRhKZYl.jpg',
    release_date: '2024-06-05',
    title: 'Bad Boys: Ride or Die',
    video: false,
    vote_average: 7.647,
    vote_count: 1079,
  };
};

const getGenres = async function () {
  const movies = await AJAX(
    `https://api.themoviedb.org/3/genre/movie/list?language=en`
  );
  state.genres.movieGenres = movies.genres;

  const tvShows = await AJAX(
    `https://api.themoviedb.org/3/genre/tv/list?language=en`
  );
  state.genres.showGenres = movies.genres;
  console.log(state);
};

const mapGenre = function (category) {
  return state.genres.showGenres.find((genre) => genre.name === category).id;
};

// Initalize all users, later should recreate from actual data
const init = async function initalizeModel() {
  const rosa = new CreateUser(
    'Rosa Umineko',
    'https://gcdnb.pbrd.co/images/Cyeeqtk7SoDO.png?o=1',
    '',
    ''
  );

  const bojack = new CreateUser(
    'نوم العوافي',
    'https://i.imgur.com/u1DJo5h.png',
    '',
    ''
  );

  const louis = new CreateUser(
    'Louis Cypher',
    'https://i.imgur.com/JpGzLyC.png',
    '',
    ''
  );

  const tara = new CreateUser(
    'Tara 🤍',
    'https://i.imgur.com/Igqdb4Q.png',
    '',
    ''
  );

  const cheap = new CreateUser(
    'باراسايت',
    'https://i.imgur.com/DTQqnbN.png',
    '',
    ''
  );

  state.users.allUsers = [tara, louis, bojack, rosa, cheap];
  state.users.currUser = bojack;

  getGenres();
};

init();
