'use strict';
import * as model from './model.js';
import categories from './mvc-views/categories.js';
import header from './mvc-views/header.js';
import billboard from './mvc-views/billboard.js';
import profile from './mvc-views/profile.js';
import footer from './mvc-views/footer.js';
import title from './mvc-views/title.js';
import search from './mvc-views/search.js';
import notifications from './mvc-views/notifications.js';
import dialogue from './mvc-views/dialogue.js';
import * as config from './config.js';
import { updateURL } from './helper.js';

history.scrollRestoration = 'manual';

/*
==================================================
                     ROUTING
==================================================
*/

const routes = {
  '/': () => profile.render(model.state.users),
  '/browse': () => renderHomepage(),
  '/title/tv': (id) => renderTitleModal(id, 'tv'),
  '/title/movie': (id) => renderTitleModal(id, 'movie'),
  '/search': (query) => {
    renderHomepage();
    controlSearch(query);
  },
};

const loadPage = () => {
  const url = window.location.pathname;
  const match = url.match(/\/(title\/(tv|movie)|search)(?=\/\d*)/);
  const id = match && url.split('/').pop();
  const query = window.location.href.split('?q=').pop();
  const handler = routes[url] || (match && routes[match[0]]);

  handler
    ? handler(id || query)
    : profile.renderError('404. Seems like this page doesn’t exist.');
};

/*
==================================================
                      INIT
==================================================
*/

const init = () => {
  profile.addHandler(controlUsers);
  search.addHoverHandler(controlSearchMetadata);
  header.addSearchHandler(controlSearch, renderBrowse);
  header.addNavigationHandler(renderBrowse, controlNonFunctionalButtons);
  header.addHandler(controlUsers);
  controlDisclaimer();
};

const controlDisclaimer = () => {
  const seenDisclaimer = window.localStorage.getItem('disclaimer');
  if (seenDisclaimer) return;

  window.localStorage.setItem('disclaimer', true);
  dialogue.renderMessage();
};

/*
==================================================
                    RENDERING
==================================================
*/

const renderHomepage = () => {
  categories.render(model.state.media);
  categories.bindHover(controlShowMetadata);
  categories.addObserverHandler(controlInfiniteScrolling);
  categories.addModalHandler(renderModal);
  header.render(model.state.users);
  billboard.render(model.state.billboard);
  footer.render();
  updateURL('/browse', 'Notflix');
};

const renderBrowse = () => {
  search.clear();
  categories.render(model.state.media);
  billboard.changeVisibility(true);
};

const renderModal = async (id, type) => {
  updateURL(`/title/${type}/${id}`);
  billboard.pause();
  title.render();
  title.addCloseHandler(controlBillboard);
  controlTitle(id, type);
  title.addSeasonHandler(controlSeasons, controlAllEpisodes);
  title.addNavigationHandler(controlNavigation, controlTitle);
};

const renderTitleModal = (id, type) => {
  renderHomepage();
  renderModal(id, type);

  setTimeout(() => {
    billboard.pause();
  }, 0.25 * config.MILLISECONDS_IN_SECOND);
};

const clear = () => {
  model.clearData();
  categories.clear();
  header.clear();
  billboard.clear();
  profile.clear();
  footer.clear();
  search.clear();
};

/*
==================================================
                    HANDLERS
==================================================
*/

const controlShowMetadata = async (id, type) => {
  try {
    if (!id) return;

    const data =
      type === 'tv'
        ? await model.getShowDetails(id)
        : await model.getMovieDetails(id);
    categories.updateHoverMetadata(data);
  } catch (err) {
    console.log(err);
    notifications.renderError(
      'Could not fetch title data. Please try again later.'
    );
  }
};

const controlUsers = async (userID) => {
  try {
    clear();
    model.getCurrUserData(userID);
    profile.setData(model.state.users);
    profile.renderSpinner(true);
    await model.getCategory('tv');
    profile.clear();
    renderHomepage();
  } catch (err) {
    console.log(err);
    profile.renderError();
  }
};

const controlInfiniteScrolling = async () => {
  try {
    if (model.state.media.categories.length >= config.MAX_CATEGORIES_PER_PAGE)
      return;
    categories.renderSkeleton();
    await Promise.all([
      model.getBuiltIn(),
      model.getCategory('tv', null, true),
      model.getBuiltIn(),
      model.getCategory('movie', null, true),
    ]);
    categories.clearSkeleton();
    categories.renderNewCategories();
  } catch (err) {
    categories.clearSkeleton();
    console.log(err);
    notifications.renderError(
      'Could not get next categories. Please try again later.'
    );
  }
};

const controlSeasons = async (id, seasonNum, render = true) => {
  try {
    const seasonData = await model.getShowSeason(id, seasonNum);
    title.updateSeason(seasonData, seasonNum, render);
  } catch (err) {
    console.log(err);
    notifications.renderError(
      'Could not retrieve season information. Please try again later.'
    );
  }
};

const controlAllEpisodes = async (data) => {
  try {
    const numSeasons = data['number_of_seasons'];
    const id = data['id'];
    const allMissingSeasons = [];

    for (let i = 1; i <= numSeasons; i++) {
      if (!data[`season_${i}`]) allMissingSeasons.push([id, i]);
    }

    await Promise.all(
      allMissingSeasons.map((season) => controlSeasons(...season, false))
    );
    title.updateAllEpisodesMarkup();
  } catch (err) {
    console.log(err);
    notifications.renderError(
      'Could not retrieve all episodes. Please try again later.'
    );
  }
};

const controlBillboard = () => {
  billboard.resume();
};

const controlTitle = async (id, type) => {
  try {
    const data =
      type === 'tv'
        ? await model.getShowModal(id)
        : await model.getMovieModal(id);
    data['type'] = 'title';
    title.updateData(data);
    title.updateTitleMarkup();
  } catch (err) {
    console.log(err);
    notifications.renderError(
      'Could not retrieve title. Please try again later.'
    );
  }
};

const controlNavigation = async (query, type) => {
  try {
    const data = await {
      cast: model.getMediaWithCast,
      genre: model.getMediaWithGenre,
      keyword: model.getMediaWithKeyword,
      company: model.getMediaWithCompany,
    }[type](query);

    data['type'] = 'nav';
    title.updateData(data);
    title.updateNavigationMarkup();
  } catch (err) {
    console.log(err);
    notifications.renderError(
      `Could not retrieve ${type} information. Please try again later.`
    );
  }
};

const controlSearch = async (query) => {
  try {
    updateURL(`search?q=${query}`);
    categories.clear();
    billboard.changeVisibility();
    profile.clear();

    const data = await model.getSearch(query);
    data['query'] = query;

    if (!window.location.href.includes('search?q=')) return;

    search.render(data);
    search.addObserverHandler(controlSearchPages);
  } catch (err) {
    console.log(err);
    search.renderError();
  }
};

const controlSearchPages = async (prevData, page) => {
  try {
    const data = await model.getSearch(prevData['query'], page);
    search.updateResults(data);
  } catch (err) {
    console.log(err);
    notifications.renderError(
      'Could not retrieve next page of search. Please try again later.'
    );
  }
};

const controlSearchMetadata = async (id, type) => {
  try {
    const data =
      type === 'tv'
        ? await model.getShowModal(id)
        : await model.getMovieModal(id);
    search.updateDataHistory(data);
    search.updateMetadataMarkup(data);
  } catch (err) {
    console.log(err);
    notifications.renderError(
      'Could not fetch title data. Please try again later.'
    );
  }
};

const controlNonFunctionalButtons = () => {
  notifications.renderNotification(
    'This button does not currently do anything.'
  );
};

/*
==================================================
                    EVENT LISTENERS
==================================================
*/

init();
window.addEventListener('load', loadPage);
