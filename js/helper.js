// Helper Functions //

/*
==================================================
                USER AND SHOW CREATION
==================================================
*/

export function CreateUser(username, profilePicture, preference, watched) {
  this.username = username;
  this.profilePicture = profilePicture;
  this.preference = preference;
  this.watched = watched;
}

export function CreateShow(name, thumbnail, genres) {
  this.name = name;
  this.thumbnail = thumbnail;
  this.genres = genres;
}

/*
==================================================
                 ARRAY MANIPULATION
==================================================
*/

export function shuffleArray(arr) {
  let currIndex = arr.length;

  while (currIndex !== 0) {
    const randomElement = Math.floor(Math.random() * currIndex);
    currIndex--;

    [arr[currIndex], arr[randomElement]] = [arr[randomElement], arr[currIndex]];
  }

  return arr;
}

/*
==================================================
                 STRING MANIPULATION
==================================================
*/

export function capitalizeEveryWord(string) {
  return string
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

/*
==================================================
                   DATA PARSING
==================================================
*/

export function parseMovieDuration(data) {
  const hours = Math.floor(data['runtime'] / 60) || '';
  const minutes = data['runtime'] % 60 || '';
  let time = `${hours ? `${hours}h ` : ''}${minutes ? `${minutes}m` : ''}`;

  if (!hours && !minutes) time = '1h 30m';

  return time;
}

/*
==================================================
                  ASYNC UTILITIES
==================================================
*/

export function autoResolvePromise() {
  return new Promise((resolve) => {
    setTimeout(() => resolve('Done!'), 2000);
  });
}

export async function AJAX(url, data = undefined) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
    });

    const tmdbData = await res.json();

    if (!res.ok) throw new Error(`${res.statusText} (${res.status})`);

    return tmdbData;
  } catch (error) {
    throw error;
  }
}

/*
==================================================
                   URL HANDLING
==================================================
*/

export function updateURL(url, title = '', state = {}) {
  window.history.replaceState({ ...state, url, title }, title, url);
}
