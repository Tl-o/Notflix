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

// Automatic timeout

export function autoResolvePromise() {
  return new Promise(function (resolve, reject) {
    setTimeout(() => resolve('Done!'), 2000);
  });
}

export async function AJAX(url, data = undefined) {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
    },
  });

  const tmdbData = await res.json();
  return tmdbData;
}
