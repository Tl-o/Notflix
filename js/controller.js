'use strict';
import * as model from './model.js';
import categories from './mvc-views/categories.js';
import header from './mvc-views/header.js';
import billboard from './mvc-views/billboard.js';
import profile from './mvc-views/profile.js';

/* Initalize */
const init = function () {
  categories.render(model.state.media);
  categories.addObserverHandler(controlInfiniteScrolling);
  header.render(model.state.users);
  billboard.render(model.state.billboard);
};

const clear = function () {
  categories.clear();
  header.clear();
  billboard.clear();
  profile.clear();
};

const controlCategories = function () {
  categories.render(model.state.media);
};

const controlUsers = async function (userID) {
  clear();
  model.getCurrUserData(userID);
  profile.renderSpinner(true);
  await model.getCategories();
  profile.clear();
  init();
};

const controlInfiniteScrolling = async function () {
  categories.renderSkeleton();
  await model.getCategories('Documentary');
  categories.clearSkeleton();
  categories.renderNewCategories();
};

// profile.render(model.state.users);
init();
profile.addHandler(controlUsers);
header.addHandler(controlUsers);
