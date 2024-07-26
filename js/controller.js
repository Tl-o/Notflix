'use strict';
import * as model from './model.js';
import categories from './mvc-views/categories.js';
import header from './mvc-views/header.js';
import billboard from './mvc-views/billboard.js';
import profile from './mvc-views/profile.js';

/* Initalize */
const init = function () {
  categories.render(model.state.media);
  header.render(model.state.users);
  billboard.render(model.state.billboard);
};
console.log(model.state);
console.log(categories);

const controlCategories = function () {
  categories.render(model.state.media);
};

const controlUsers = function (userID) {
  model.getCurrUserData(userID);
  profile.clear();
  init();
};

profile.render(model.state.users.allUsers);
profile.addHandler(controlUsers);
