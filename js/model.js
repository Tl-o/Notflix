import { CreateUser, shuffleArray } from './helper.js';
import placeHolderData from './placeholderDatabase.js';

// State object holds all data relevant to the current state of the application
let results_per_page = 6;

export const state = {
  users: {
    currUser: {},
    allUsers: [],
  },
  billboard: {},
  media: {
    // An array of objects where each object is a category.
    categories: [
      {
        name: 'Continue Watching',
        shows: placeHolderData.slice(0, 8),
      },
      {
        name: 'Drama',
        shows: shuffleArray(
          placeHolderData.filter((show) => show.genres.includes('Drama'))
        ),
      },
      {
        name: 'My List',
        shows: [
          placeHolderData[Math.floor(Math.random() * placeHolderData.length)],
          placeHolderData[Math.floor(Math.random() * placeHolderData.length)],
        ],
      },
      {
        name: 'Comedy',
        shows: shuffleArray(
          placeHolderData.filter((show) => show.genres.includes('Comedy'))
        ),
      },
      {
        name: 'Critically Acclaimed Movies',
        shows: shuffleArray(
          placeHolderData.filter((show) => show.genres.includes('Movies'))
        ),
      },
      {
        name: 'To Keep You On Your Toes',
        shows: shuffleArray(
          placeHolderData.filter(
            (show) =>
              show.genres.includes('Mystery') ||
              show.genres.includes('Thriller')
          )
        ),
      },
      {
        name: 'Suspense',
        shows: shuffleArray(
          placeHolderData.filter((show) => show.genres.includes('Suspenseful'))
        ),
      },
    ],
    // Num of results per page for EACH category, to ensure responsiveness.
    numOfResults: results_per_page,
  },
  search: {
    query: '',
    result: '',
  },
};

// Initalize all users, later should recreate from actual data
const init = function initalizeModel() {
  const rosa = new CreateUser(
    'Rosa Ushiromiya',
    '../../imgs/profile_pics/rosapfp.png',
    '',
    ''
  );

  state.allUsers = [rosa];
};

const showAnatomy = {
  name: 'Show_Name',
  thumbnail: '',
  genres: [],
};

init();
