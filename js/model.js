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
  },
  search: {
    query: '',
    result: '',
  },
};

// Initalize all users, later should recreate from actual data
const init = function initalizeModel() {
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
};

init();
