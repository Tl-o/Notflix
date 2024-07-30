'use strict';
import * as model from './model.js';
import categories from './mvc-views/categories.js';
import header from './mvc-views/header.js';
import billboard from './mvc-views/billboard.js';
import profile from './mvc-views/profile.js';
import footer from './mvc-views/footer.js';
import * as config from './config.js';

/* Initalize */
const init = function () {
  categories.render(model.state.media);
  categories.addObserverHandler(controlInfiniteScrolling);
  header.render(model.state.users);
  billboard.render(model.state.billboard);
};

const clear = function () {
  model.clearData();
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
  await model.getCategory('tv');
  profile.clear();
  init();
};

const controlInfiniteScrolling = async function () {
  if (model.state.media.categories.length >= config.MAX_CATEGORIES_PER_PAGE)
    return;

  console.log('Infinite activated...');
  categories.renderSkeleton();
  // Get four different categories to render
  model.getBuiltIn();
  await model.getCategory('tv', null, true);
  model.getBuiltIn();
  await model.getCategory('movie', null, true);

  categories.clearSkeleton();
  categories.renderNewCategories();
  // If all categories rendered, render footer
  if (model.state.media.categories.length >= config.MAX_CATEGORIES_PER_PAGE)
    footer.render();
};

profile.render(model.state.users);
// init();
profile.addHandler(controlUsers);
header.addHandler(controlUsers);
