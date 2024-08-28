'use strict';
import { all } from 'core-js/./es/promise';
import {
  CreateUser,
  shuffleArray,
  autoResolvePromise,
  AJAX,
  parseMovieDuration,
} from './helper.js';
import * as config from './config.js';
import { showsDatabase, billboardShows } from './placeholderDatabase.js';

// State object holds all data relevant to the current state of the application
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
        shows: Array.from(
          { length: 4 },
          () => showsDatabase[Math.floor(Math.random() * showsDatabase.length)]
        ),
      },
    ],
  },
  search: {
    query: '',
    result: '',
  },
};

/*
==================================================
                   DATA MANAGEMENT
==================================================
*/

export const clearData = () => {
  state.media.categories = state.media.categories.slice(0, 3);
  state.media.index = 0;
};

export const getCurrUserData = (userID) => {
  state.users.currUser = state.users.allUsers.find(
    (user) => user.username === userID
  );
  localStorage.setItem('user', JSON.stringify(state.users.currUser));
  state.billboard =
    billboardShows[Math.floor(Math.random() * billboardShows.length)];
};

export const getBuiltIn = () => {
  state.media.categories.push(builtInCategories[state.media.index++]);
};

/*
==================================================
                   MEDIA FETCHING
==================================================
*/

export const getSearch = async (query, page = 1) => {
  try {
    return await AJAX(
      `https://api.themoviedb.org/3/search/multi?query=${query}&include_adult=false&language=en-US&page=${page}`
    );
  } catch (error) {
    throw error;
  }
};

export const getShowDetails = async (id) => {
  try {
    const data = await AJAX(
      `https://api.themoviedb.org/3/tv/${id}?append_to_response=content_ratings&language=en-US`
    );
    const maturity = data['content_ratings']?.['results'].find(
      (result) => result['iso_3166_1'] === 'US'
    )?.['rating'];

    return {
      genres: data['genres'],
      episodes: data['number_of_episodes'],
      seasons: data['number_of_seasons'],
      maturity: config.MATURITY_RATING_MAPPING[maturity] || '+13',
      id: data['id'],
    };
  } catch (error) {
    throw error;
  }
};

export const getMovieDetails = async (id) => {
  try {
    const data = await AJAX(
      `https://api.themoviedb.org/3/movie/${id}?append_to_response=release_dates&language=en-US`
    );
    const maturity = data['release_dates']?.['results']
      ?.find((result) => result['iso_3166_1'] === 'US')
      ?.['release_dates']?.find((cert) => cert['certification'])?.[
      'certification'
    ];

    return {
      genres: data['genres'],
      runtime: parseMovieDuration(data),
      maturity: config.MATURITY_RATING_MAPPING[maturity] || '+13',
      id: data['id'],
    };
  } catch (error) {
    throw error;
  }
};

export const getShowModal = async (id) => {
  try {
    const data = await AJAX(
      `https://api.themoviedb.org/3/tv/${id}?append_to_response=content_ratings,keywords,credits,recommendations,videos,images?include_image_language=en&language=en-US`
    );
    data[`season_1`] = await getShowSeason(id, 1);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getMovieModal = async (id) => {
  try {
    return await AJAX(
      `https://api.themoviedb.org/3/movie/${id}?append_to_response=credits%2Crelease_dates%2Crecommendations%2Cvideos%2Ckeywords%2Cimages%3Finclude_image_language%3Den&language=en-US`
    );
  } catch (error) {
    throw error;
  }
};

export const getShowSeason = async (id, seasonNum) => {
  try {
    return await AJAX(
      `https://api.themoviedb.org/3/tv/${id}/season/${seasonNum}?language=en-US`
    );
  } catch (error) {
    throw error;
  }
};

/*
==================================================
                   MEDIA NAVIGATION
==================================================
*/

export const getMediaWithCast = async (cast) => {
  try {
    const castMember = await AJAX(
      `https://api.themoviedb.org/3/search/person?query=${cast}&include_adult=false&language=en-US&page=1`
    );

    const moviesWithCast = await AJAX(
      `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_cast=${castMember['results'][0]['id']}`
    );

    moviesWithCast['results'].forEach((movie) => {
      movie['media_type'] = 'movie';
    });

    return {
      name: `Shows Featuring ${castMember['results']?.[0]['name']}`,
      results: [
        ...castMember['results']?.[0]['known_for'].filter(
          (show) => show['media_type'] === 'tv'
        ),
        ...moviesWithCast['results'],
      ],
    };
  } catch (error) {
    throw error;
  }
};

export const getMediaWithGenre = async (genre) => {
  try {
    const genreShowID = mapGenre(genre, 'tv');
    const genreMovieID = mapGenre(genre, 'movie');

    const tvShows = await AJAX(
      `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=${genreShowID}`
    );
    tvShows['results'].forEach((tvShow) => {
      tvShow['media_type'] = 'tv';
    });

    const movies = await AJAX(
      `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=${genreMovieID}`
    );
    movies['results'].forEach((movie) => {
      movie['media_type'] = 'movie';
    });

    return {
      name: `Navigating ${genre}`,
      results: shuffleArray([...tvShows['results'], ...movies['results']]),
    };
  } catch (error) {
    throw error;
  }
};

export const getMediaWithKeyword = async (keyword) => {
  try {
    const tvShows = await AJAX(
      `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=1&sort_by=popularity.desc&with_keywords=${keyword[0]}`
    );
    tvShows['results'].forEach((tvShow) => {
      tvShow['media_type'] = 'tv';
    });

    const movies = await AJAX(
      `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=16&with_keywords=${keyword[0]}`
    );
    movies['results'].forEach((movie) => {
      movie['media_type'] = 'movie';
    });

    return {
      name: `Navigating ${keyword[1]}`,
      results: shuffleArray([...tvShows['results'], ...movies['results']]),
    };
  } catch (error) {
    throw error;
  }
};

export const getMediaWithCompany = async (company) => {
  try {
    const tvShows = await AJAX(
      `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=1&sort_by=popularity.desc&with_companies=${company[0]}`
    );
    tvShows['results'].forEach((tvShow) => {
      tvShow['media_type'] = 'tv';
    });

    const movies = await AJAX(
      `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_companies=${company[0]}}`
    );
    movies['results'].forEach((movie) => {
      movie['media_type'] = 'movie';
    });

    return {
      name: `Produced By ${company[1]}`,
      results: shuffleArray([...tvShows['results'], ...movies['results']]),
    };
  } catch (error) {
    throw error;
  }
};

export const getCategory = async (type, genre = null, random = false) => {
  try {
    if (random) {
      genre =
        type === 'tv'
          ? state.genres.showGenres[
              Math.floor(Math.random() * state.genres.showGenres.length)
            ].name
          : state.genres.movieGenres[
              Math.floor(Math.random() * state.genres.movieGenres.length)
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

    const shows = data.results.map((show) => ({
      name: show['original_name'],
      id: show['id'],
      genres: [type],
      thumbnail: show['backdrop_path']
        ? `https://image.tmdb.org/t/p/original${show['backdrop_path']}`
        : 'https://picsum.photos/1600/900',
      logo: show.logo
        ? `https://image.tmdb.org/t/p/original${show.logo}`
        : null,
    }));

    state.media.categories.push({
      name: genre ? genre : 'Popular',
      shows,
    });
  } catch (error) {
    throw error;
  }
};

/*
==================================================
                   UTILITY FUNCTIONS
==================================================
*/

const mapGenre = (category, type) => {
  return type === 'tv'
    ? state.genres.showGenres.find((genre) => genre.name === category)?.id
    : state.genres.movieGenres.find((genre) => genre.name === category)?.id;
};

const getGenres = async () => {
  try {
    const movies = await AJAX(
      `https://api.themoviedb.org/3/genre/movie/list?language=en`
    );
    state.genres.movieGenres = movies.genres;

    const tvShows = await AJAX(
      `https://api.themoviedb.org/3/genre/tv/list?language=en`
    );
    state.genres.showGenres = tvShows.genres;
  } catch (error) {
    throw error;
  }
};

/*
==================================================
                   INITIALIZATION
==================================================
*/

const init = async () => {
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
  state.users.currUser = JSON.parse(localStorage.getItem('user')) || bojack;

  await getGenres();
};

init();

/*
==================================================
                   BUILT-IN CATEGORIES
==================================================
*/

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
    shows: shuffleArray(
      Array.from(
        { length: 12 },
        () => showsDatabase[Math.floor(Math.random() * showsDatabase.length)]
      )
    ),
  },
  {
    name: 'Sports',
    shows: shuffleArray(
      showsDatabase.filter((show) => show.genres.includes('Sports'))
    ),
  },
];
