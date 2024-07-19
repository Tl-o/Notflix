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
