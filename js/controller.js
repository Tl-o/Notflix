'use strict';
import * as model from './model.js';
import categories from './mvc-views/categories.js';
import header from './mvc-views/header.js';
import billboard from './mvc-views/billboard.js';
import profile from './mvc-views/profile.js';
import footer from './mvc-views/footer.js';
import title from './mvc-views/title.js';
import search from './mvc-views/search.js';
import * as config from './config.js';

/* Initalize */
const init = function () {
  categories.render(model.state.media);
  categories.bindHover(controlShowMetadata);
  categories.addObserverHandler(controlInfiniteScrolling);
  categories.addModalHandler(renderModal);
  header.render(model.state.users);
  billboard.render(model.state.billboard);
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
  if (type === 'tv') data = await model.getShowDetails(id);
  if (type === 'movie') data = await model.getMovieDetails(id);
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

const controlSeasons = async function (id, seasonNum, render = true) {
  const seasonData = await model.getShowSeason(id, seasonNum);
  title.updateSeason(seasonData, seasonNum, render);
};

const controlAllEpisodes = async function (data) {
  const numSeasons = data['number_of_seasons'];
  const id = data['id'];
  const allSeasons = [];
  for (let i = 1; i <= numSeasons; i++) {
    if (data[`season_${i}`]) continue;

    allSeasons.push([id, i]);
  }

  // Get all missing seasons in parellal
  await Promise.all(
    allSeasons.map((season) => controlSeasons(...season, false))
  );
  title.updateAllEpisodesMarkup();
};

profile.render(model.state.users);
// init();
profile.addHandler(controlUsers);
header.addHandler(controlUsers);

const controlBillboard = function () {
  billboard.resume();
};

const renderModal = async function (id, type) {
  billboard.pause();
  title.render();
  title.addCloseHandler(controlBillboard);
  controlTitle(id, type);
  title.addSeasonHandler(controlSeasons, controlAllEpisodes);
  title.addNavigationHandler(controlNavigation, controlTitle);
};

const controlTitle = async function (id, type) {
  let data;
  if (type === 'tv') data = await model.getShowModal(id);
  else if (type === 'movie') data = await model.getMovieModal(id);
  data['type'] = 'title';
  title.updateData(data);
  title.updateTitleMarkup();
};

const controlNavigation = async function (query, type) {
  let data;

  if (type === 'cast') data = await model.getMediaWithCast(query);
  if (type === 'genre') data = await model.getMediaWithGenre(query);
  if (type === 'keyword') data = await model.getMediaWithKeyword(query);
  if (type === 'company') data = await model.getMediaWithCompany(query);

  data['type'] = 'nav';
  title.updateData(data);
  title.updateNavigationMarkup();
};

const controlSearch = async function (query) {
  const data = await model.getSearch(query);
  console.log(data);
  search.render(data);
};

// renderModal(236235, 'tv');
controlSearch('Breaking');
// controlNavigation('Bob Odenkirk', '');
// controlTitle(419430);
// 236235 The Gentlemen ID
