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

export const getCurrUserData = async function (userID) {
  state.users.currUser = state.users.allUsers.find(
    (user) => user.username === userID
  );

  state.billboard =
    billboardShows[Math.floor(Math.random() * (billboardShows.length - 1))];

  const data = await AJAX(`https://api.themoviedb.org/3/authentication`);
  console.log(data);
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
