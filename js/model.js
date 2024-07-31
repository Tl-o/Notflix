import { all } from 'core-js/./es/promise';
import {
  CreateUser,
  shuffleArray,
  autoResolvePromise,
  AJAX,
} from './helper.js';
import * as config from './config.js';
import { showsDatabase, billboardShows } from './placeholderDatabase.js';

// State object holds all data relevant to the current state of the application
const builtInCategories = [
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
          show.genres.includes('Mystery') || show.genres.includes('Thriller')
      )
    ),
  },
  {
    name: 'Suspense',
    shows: shuffleArray(
      showsDatabase.filter((show) => show.genres.includes('Suspenseful'))
    ),
  },
  {
    name: `Top Ten`,
    shows: shuffleArray(
      showsDatabase.slice(config.TOP_TEN_INDEX, config.TOP_TEN_INDEX + 10)
    ),
  },
  {
    name: 'Arabic',
    shows: shuffleArray(
      showsDatabase.filter((show) => show.genres.includes('Arabic'))
    ),
  },
  {
    name: 'Based on Books',
    shows: shuffleArray(
      showsDatabase.filter((show) => show.genres.includes('Based On Books'))
    ),
  },
  {
    name: 'European Drama',
    shows: shuffleArray(
      showsDatabase.filter((show) => show.genres.includes('European Drama'))
    ),
  },
  {
    name: `We think you'll like those`,
    shows: shuffleArray([
      showsDatabase[Math.floor(Math.random() * showsDatabase.length)],
      showsDatabase[Math.floor(Math.random() * showsDatabase.length)],
      showsDatabase[Math.floor(Math.random() * showsDatabase.length)],
      showsDatabase[Math.floor(Math.random() * showsDatabase.length)],
      showsDatabase[Math.floor(Math.random() * showsDatabase.length)],
      showsDatabase[Math.floor(Math.random() * showsDatabase.length)],
      showsDatabase[Math.floor(Math.random() * showsDatabase.length)],
      showsDatabase[Math.floor(Math.random() * showsDatabase.length)],
      showsDatabase[Math.floor(Math.random() * showsDatabase.length)],
      showsDatabase[Math.floor(Math.random() * showsDatabase.length)],
      showsDatabase[Math.floor(Math.random() * showsDatabase.length)],
      showsDatabase[Math.floor(Math.random() * showsDatabase.length)],
    ]),
  },
  {
    name: 'Sports',
    shows: shuffleArray(
      showsDatabase.filter((show) => show.genres.includes('Sports'))
    ),
  },
];

const maturityRatingMapping = {
  'TV-Y': '+3',
  'TV-Y7': '+7',
  'TV-Y7 FV': '+7',
  'TV-G': '+10',
  'TV-PG': '+10',
  'TV-14': '+14',
  'TV-MA': '+18',
  G: 'G',
  PG: 'PG',
  'PG-13': '+13',
  R: 'R',
  'NC-17': '+18',
};

export const state = {
  users: {
    currUser: {},
    allUsers: [],
  },
  billboard:
    billboardShows[Math.floor(Math.random() * (billboardShows.length - 1))],
  genres: [],
  media: {
    index: 0,
    // An array of objects where each object is a category.
    categories: [
      {
        name: 'Continue Watching',
        shows: showsDatabase.slice(0, 8),
      },
      {
        name: 'Trending',
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
    ],
  },
  search: {
    query: '',
    result: '',
  },
};

export const clearData = function () {
  state.media.categories = state.media.categories.slice(0, 3);
  state.media.index = 0;
};

export const getCurrUserData = function (userID) {
  state.users.currUser = state.users.allUsers.find(
    (user) => user.username === userID
  );

  state.billboard =
    billboardShows[Math.floor(Math.random() * (billboardShows.length - 1))];
};

export const getShowDetails = async function (id) {
  const data = await AJAX(
    `https://api.themoviedb.org/3/tv/${id}?append_to_response=content_ratings&language=en-US`
  );

  const maturity = data['content_ratings']['results'].find(
    (result) => result['iso_3166_1'] === 'US'
  )?.['rating'];

  const showMetadata = {
    genres: data['genres'],
    episodes: data['number_of_episodes'],
    seasons: data['number_of_seasons'],
    maturity: maturityRatingMapping[maturity] || '+13',
    id: data['id'],
  };
  return showMetadata;
};

export const getMovieDetails = async function (id) {
  const data = await AJAX(
    `https://api.themoviedb.org/3/movie/${id}?append_to_response=release_dates&language=en-US`
  );

  const maturity = data['release_dates']?.['results']?.find(
    (result) => result['iso_3166_1'] === 'US'
  )?.['release_dates']?.[0]?.['certification'];

  const movieMetadata = {
    genres: data['genres'],
    runtime: `${Math.floor(data['runtime'] / 60)}h ${data['runtime'] % 60}m`,
    maturity: maturityRatingMapping[maturity] || '+13',
    id: data['id'],
  };

  return movieMetadata;
};

export const getCategory = async function (type, genre = null, random = false) {
  // Get random
  if (random && type == 'tv') {
    genre =
      state.genres.showGenres[
        Math.floor(Math.random() * state.genres.showGenres.length)
      ].name;
  } else if (random && type == 'movie') {
    genre =
      state.genres.movieGenres[
        Math.floor(Math.random() * state.genres.showGenres.length)
      ].name;
  }

  const data = genre
    ? await AJAX(
        `https://api.themoviedb.org/3/discover/${type}?include_adult=false&include_null_first_air_dates=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=${mapGenre(
          genre,
          type
        )}`
      )
    : await AJAX(
        'https://api.themoviedb.org/3/tv/popular?language=en-US&page=1'
      );

  // Get logos to display
  // for (let i = 0; i < data.results.length; i++) {
  //   const show = data.results[i];
  //   const logo = await AJAX(
  //     `https://api.themoviedb.org/3/tv/${show.id}/images?language=en`
  //   );
  //   show.logo = logo['logos'][0]?.['file_path'];
  // }

  const shows = data.results.map((show) => {
    return {
      name: show['original_name'],
      id: show['id'],
      genres: [type],
      thumbnail: show['backdrop_path']
        ? `https://image.tmdb.org/t/p/original${show['backdrop_path']}`
        : 'https://picsum.photos/1600/900',
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

export const getBuiltIn = function () {
  // Gets ONE built-in category
  state.media.categories.push(builtInCategories[state.media.index++]);
};

const getGenres = async function () {
  const movies = await AJAX(
    `https://api.themoviedb.org/3/genre/movie/list?language=en`
  );
  state.genres.movieGenres = movies.genres;

  const tvShows = await AJAX(
    `https://api.themoviedb.org/3/genre/tv/list?language=en`
  );
  state.genres.showGenres = tvShows.genres;
  console.log(state.genres);
};

const mapGenre = function (category, type) {
  if (type === 'tv')
    return state.genres.showGenres.find((genre) => genre.name === category).id;
  else
    return state.genres.movieGenres.find((genre) => genre.name === category).id;
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
