'use strict';
import * as model from './model.js';
import categories from './mvc-views/categories.js';
import header from './mvc-views/header.js';
import billboard from './mvc-views/billboard.js';
import profile from './mvc-views/profile.js';
import footer from './mvc-views/footer.js';
import title from './mvc-views/title.js';
import * as config from './config.js';

/* Initalize */
const init = function () {
  categories.render(model.state.media);
  categories.bindHover(controlShowMetadata);
  categories.addObserverHandler(controlInfiniteScrolling);
  categories.addModalHandler(controlTitle);
  header.render(model.state.users);
  billboard.render(model.state.billboard);
  console.log(document.querySelector('[data-name="Killing Eve"]'));
};

const clear = function () {
  model.clearData();
  categories.clear();
  header.clear();
  billboard.clear();
  profile.clear();
  footer.clear();
};

const controlShowMetadata = async function (id, type) {
  let data;
  if (type == 'tv') data = await model.getShowDetails(id);
  if (type == 'movie') data = await model.getMovieDetails(id);
  categories.updateHoverMetadata(data);
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

const controlSeasons = async function (id, seasonNum) {
  const seasonData = await model.getShowSeason(id, seasonNum);
  title.updateSeason(seasonData, seasonNum);
  console.log(seasonData);
};

profile.render(model.state.users);
// init();
profile.addHandler(controlUsers);
header.addHandler(controlUsers);

const controlTitle = async function (id) {
  title.render();
  const data = await model.getShowModal(id);
  title.updateData(data);
  title.updateTitleMarkup();
  title.addSeasonHandler(controlSeasons);
};
// controlTitle();
// 236235 The Gentlemen ID
