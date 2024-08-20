'use strict';
import * as model from './model.js';
import categories from './mvc-views/categories.js';
import header from './mvc-views/header.js';
import billboard from './mvc-views/billboard.js';
import profile from './mvc-views/profile.js';
import footer from './mvc-views/footer.js';
import title from './mvc-views/title.js';
import search from './mvc-views/search.js';
import error from './mvc-views/error.js';
import * as config from './config.js';

/* Initalize */
const init = function () {
  categories.render(model.state.media);
  categories.bindHover(controlShowMetadata);
  categories.addObserverHandler(controlInfiniteScrolling);
  categories.addModalHandler(renderModal);
  search.addHoverHandler(controlSearchMetadata);
  header.addSearchHandler(controlSearch, renderBrowse);
  header.addNavigationHandler(renderBrowse);
  header.render(model.state.users);
  billboard.render(model.state.billboard);
  footer.render();
};

const clear = function () {
  model.clearData();
  categories.clear();
  header.clear();
  billboard.clear();
  profile.clear();
  footer.clear();
};

const renderBrowse = function () {
  search.clear();
  categories.render(model.state.media);
  billboard.changeVisibility(true);
};

const controlShowMetadata = async function (id, type) {
  try {
    let data;
    if (type === 'tv') data = await model.getShowDetails(id);
    if (type === 'movie') data = await model.getMovieDetails(id);
    categories.updateHoverMetadata(data);
  } catch (err) {
    console.log(err);
    error.renderError(`Could not fetch title data. Please try again later.`);
  }
};

const controlUsers = async function (userID) {
  try {
    clear();
    model.getCurrUserData(userID);
    profile.renderSpinner(true);
    await model.getCategory('tv');
    profile.clear();
    init();
  } catch (err) {
    console.log(err);
    profile.renderError();
  }
};

const controlInfiniteScrolling = async function () {
  try {
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

    // // If all categories rendered, render footer
    // if (model.state.media.categories.length >= config.MAX_CATEGORIES_PER_PAGE)
    //   footer.render();
  } catch (err) {
    categories.clearSkeleton();
    console.log(err);
    error.renderError(`Could not get next categories. Please try again later.`);
  }
};

const controlSeasons = async function (id, seasonNum, render = true) {
  try {
    const seasonData = await model.getShowSeason(id, seasonNum);
    title.updateSeason(seasonData, seasonNum, render);
  } catch (err) {
    console.log(err);
    error.renderError(
      'Could not retrieve season information. Please try again later.'
    );
  }
};

const controlAllEpisodes = async function (data) {
  try {
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
  } catch (err) {
    console.log(err);
    error.renderError(
      `Could not retrieve all episodes. Please try again later.`
    );
  }
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
  try {
    let data;
    if (type === 'tv') data = await model.getShowModal(id);
    else if (type === 'movie') data = await model.getMovieModal(id);
    data['type'] = 'title';
    title.updateData(data);
    title.updateTitleMarkup();
  } catch (err) {
    console.log(err);
    error.renderError('Could not retrieve title. Please try again later.');
  }
};

const controlNavigation = async function (query, type) {
  try {
    let data;

    if (type === 'cast') data = await model.getMediaWithCast(query);
    if (type === 'genre') data = await model.getMediaWithGenre(query);
    if (type === 'keyword') data = await model.getMediaWithKeyword(query);
    if (type === 'company') data = await model.getMediaWithCompany(query);

    data['type'] = 'nav';
    title.updateData(data);
    title.updateNavigationMarkup();
  } catch (err) {
    console.log(err);
    renderError(
      `Could not retrieve ${type} information. Please try again later.`
    );
  }
};

const controlSearch = async function (query) {
  try {
    categories.clear();
    billboard.changeVisibility();
    profile.clear();

    const data = await model.getSearch(query);
    data['query'] = query;
    search.render(data);
    search.addObserverHandler(controlSearchPages);

    // if (data['total_pages'] === 1 && data['total_results'] > 0) footer.render();
    // else footer.clear();
  } catch (err) {
    search.renderError();
  }
};

const controlSearchPages = async function searchInfiniteScrolling(
  prevData,
  page,
  childElementCount
) {
  // // Return if max search limit has been reached.
  // if (
  //   childElementCount >= search.renderLimitPerSearch ||
  //   prevData['total_pages'] < page
  // ) {
  //   footer.render();
  //   return;
  // }

  try {
    const data = await model.getSearch(prevData['query'], page);
    console.log(data);
    search.updateResults(data);
  } catch (err) {
    console.log(err);
    error.renderError(
      `Could not retrieve next page of search. Please try again later.`
    );
  }
};

const controlSearchMetadata = async function (id, type) {
  try {
    let data;
    if (type === 'tv') data = await model.getShowModal(id);
    else if (type === 'movie') data = await model.getMovieModal(id);
    search.updateDataHistory(data);
    search.updateMetadataMarkup(data);
  } catch (err) {
    console.log(err);
    error.renderError(`Could not fetch title data. Please try again later.`);
  }
};

// renderModal(84209, 'tv');
// controlNavigation('Bob Odenkirk', '');
// controlTitle(419430);
// 236235 The Gentlemen ID
