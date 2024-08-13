// Helper Functions //

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

export function shuffleArray(arr) {
  let currIndex = arr.length;

  while (currIndex != 0) {
    let randomElement = Math.floor(Math.random() * currIndex);
    currIndex--;

    [arr[currIndex], arr[randomElement]] = [arr[randomElement], arr[currIndex]];
  }

  return arr;
}

export function capitalizeEveryWord(string) {
  return string
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

export function parseMovieDuration(data) {
  const hours = Math.floor(data['runtime'] / 60) || '';
  const minutes = data['runtime'] % 60 || '';
  let time = `${hours ? `${hours}h ` : ''} ${minutes ? `${minutes}m` : ''}`;

  if (hours === '' && minutes === '') time = `1h 30m`;

  return time;
}

// Automatic timeout

export function autoResolvePromise() {
  return new Promise(function (resolve, reject) {
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
    return tmdbData;
  } catch (error) {
    console.log(error);
  }
}
