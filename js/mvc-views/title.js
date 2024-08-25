'use strict';
import { View } from './view';
import 'core-js/stable';
import MATURITY_RATING_MAPPING from '../config.js';
import { capitalizeEveryWord, parseMovieDuration } from '../helper';
import { mark } from 'regenerator-runtime';

class Title extends View {
  _parentEl = document.body;
  _modal;
  _overlay;
  _dataHistory = [];
  _imgPath = `https://image.tmdb.org/t/p/original`;

  // Properties relating to titles' DOM
  _titleBackdrop;
  _titleDetails;
  _titleEpisodes;
  _titleRecommendations;
  _titleTrailers;
  _titleProduction;
  _btnBack;

  // Path
  _upChevron = `<path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"/>`;
  _downChevron = `<path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>`;

  _maxEpChars = 225;
  _maxRecChars = 145;

  // Properties relating to results' DOM

  _generateMarkup() {
    // Generate modal
    this._parentEl.style = 'overflow: hidden';
    this._generateStructure();

    // Update all DOM-related variables
    this._modal = document.querySelector('.media-modal');
    this._overlay = document.querySelector('.media-modal-overlay');
    this._titleBackdrop = document.querySelector('.media-modal-backdrop');
    this._titleDetails = document.querySelector('.media-details');
    this._titleEpisodes = document.querySelector('.media-episodes');
    this._titleRecommendations = document.querySelector(
      '.media-recommendations'
    );
    this._titleTrailers = document.querySelector('.trailers');
    this._titleProduction = document.querySelector('.production');
    this._btnBack = this._modal.querySelector('.modal-back');

    // Generate Skeleton
    this._generateTitleSkeleton();

    // Bind all events
    this._bindToggles();
    this._bindSeason();
    this._bindBack();
    return '';
  }

  addSeasonHandler(seasonHandler, allHandler) {
    // Arrow function so that the this keyword refers to the class
    const manageSeason = (e) => {
      const target = e.target.closest('.season-list-item');
      if (!target) return;

      const seasonNum = target.dataset.season;
      const episodeNum = target.dataset.ep;
      const btn = document.querySelector('.season-select');

      // If season's data already exists
      if (this._data[`season_${seasonNum}`]) {
        const markup = this._updateEpisodes(
          this._data[`season_${seasonNum}`]['episodes']
        );
        this._modal.querySelector('.episodes-wrapper').innerHTML = markup;
      } else if (seasonNum === 'all') {
        this._generateEpisodesSkeleton(10);
        allHandler(this._data);
      } else {
        this._generateEpisodesSkeleton(episodeNum);
        seasonHandler(this._data['id'], seasonNum);
      }

      btn.textContent = target.textContent.split('(')[0]; // Only get season, no episodes
      this._toggleSeasons(btn);
    };

    this._modal.addEventListener('click', manageSeason);
  }

  addNavigationHandler(resultHandler, titleHandler) {
    // For data navigation
    this._modal.addEventListener('click', (e) => {
      const target = e.target.closest('.navigation');
      if (!target) return;

      // Check if title first
      if (target.classList.contains('navigation-title')) {
        const mediaType = target.dataset.type;
        const id = target.dataset.id;

        this._modal.classList.remove('full-size');
        this._generateTitleSkeleton();
        titleHandler(id, mediaType);
        this._titleBackdrop.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      // Continue as normal, since navigation is results-based
      this._modal.classList.add('full-size');
      let type;
      if (
        target.classList.contains('navigation-cast') ||
        target.classList.contains('navigation-creator')
      )
        type = 'cast';
      if (target.classList.contains('navigation-genre')) type = 'genre';
      if (target.classList.contains('navigation-keyword')) type = 'keyword';
      if (target.classList.contains('navigation-company')) type = 'company';

      this._generateNavigationSkeleton();
      this._overlay.scrollTop = 0;
      // Either get target's ID, in case of keyword or other title navigation, or the text content in case of cast or genre.
      const query = target.dataset.id
        ? [target.dataset.id, target.textContent]
        : target.textContent;
      resultHandler(query, type);
    });

    // For navigation to full production information
    this._modal.addEventListener('click', (e) => {
      const target = e.target.closest('.more');
      if (!target) return;

      this._titleProduction.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // For billboard

  // REFACTOR: take document event listener to another function and call it separately, not every time the modal is rendered
  addCloseHandler(handler) {
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;

      this._hide(handler);
    });

    this._overlay.addEventListener('click', (e) => {
      const target = e.target.closest('.modal-close');
      if (!target) return;

      this._hide(handler);
    });
  }

  updateTitleMarkup() {
    this._titleBackdrop.innerHTML = this._generateBackdrop(this._data);
    this._titleDetails.innerHTML = this._generateDetails(this._data);
    this._titleEpisodes.innerHTML = this._generateEpisodes(this._data);
    this._titleRecommendations.innerHTML = this._generateRecommendations(
      this._data['recommendations']?.['results']
    );
    this._titleTrailers.innerHTML = this._generateTrailers(
      this._data['videos']?.['results']
    );
    this._titleProduction.innerHTML = this._generateProduction(this._data);
  }

  updateNavigationMarkup() {
    const results = this._data['results'].map((show, i) => {
      const year =
        show['first_air_date']?.split('-')[0] ||
        show['release_date']?.split('-')[0];

      const type = show['media_type'] === 'tv' ? 'TV Show' : 'Movie';

      const rating = show['vote_average'].toFixed(1);

      // Get two first sentences, add period at end if no period exists.
      let description =
        show['overview'].length > this._maxRecChars
          ? show['overview'].slice(0, this._maxRecChars).trim() + '...'
          : show['overview'];

      return `
        <div class="recommendation navigation-result" style="animation-delay: ${
          0.05 * i
        }s;">
            <div class="poster">
            <div class="recommendation-type">${type}</div>
            <img
                src="${this._imgPath + show['poster_path']}"
            />
            <div class="play-icon">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                fill="currentColor"
                class="bi bi-play-circle"
                viewBox="0 0 16 16"
                >
                <path
                    d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"
                />
                <path
                    d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445"
                />
                </svg>
            </div>
            </div>
            <div class="recommendation-body">
            <div class="metadata">
                <span class="media-year-small">${year || 'Unknown'}</span>
                <span class="media-badge age">${rating}</span>
                <span class="media-badge special">HD</span>
                <button class="modal-icon small navigation navigation-title" data-type="${
                  show['media_type']
                }" data-id="${show['id']}">
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      class="bi bi-plus-lg"
                      viewBox="0 0 16 16"
                  >
                    <path d="m9.708 6.075-3.024.379-.108.502.595.108c.387.093.464.232.38.619l-.975 4.577c-.255 1.183.14 1.74 1.067 1.74.72 0 1.554-.332 1.933-.789l.116-.549c-.263.232-.65.325-.905.325-.363 0-.494-.255-.402-.704zm.091-2.755a1.32 1.32 0 1 1-2.64 0 1.32 1.32 0 0 1 2.64 0"/>
                  </svg>
                </button>
            </div>
            <div class="recommendation-description">
                ${description || 'No description was found for this show.'}
            </div>
            </div>
        </div>`;
    });

    const recommendations = results.join('');

    this._titleRecommendations.innerHTML = `
    <div class="header-title center">
      ${this._data['name']}
    </div>
    <div class="recommendations-wrapper wrapper">
      <div class="recommendations-container full-view">
        ${recommendations}
      </div>
    </div>`;
  }

  updateAllEpisodesMarkup() {
    const numOfSeasons = this._data['number_of_seasons'];
    const episodesWrapper =
      this._titleEpisodes.querySelector('.episodes-wrapper');

    let markup = `
    <div class="full-toggle" ${
      this._data['number_of_episodes'] <= 10 ? 'hidden' : ''
    }>
      <div
      class="recommendations-show-more absolute-center show-more-icon"
      data-message="Show More"
      >
      <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-chevron-down"
          viewBox="0 0 16 16"
      >
        ${
          episodesWrapper.classList.contains('full-view')
            ? this._upChevron
            : this._downChevron
        }
      </svg>
      </div>
  </div>`;

    // Render each seasons
    for (let i = 1; i <= numOfSeasons; i++) {
      let data = this._data[`season_${i}`]['episodes'];
      markup += `<div class="season-header ${
        i === 1 ? 'season-one' : ''
      }">Season ${i}</div>`;
      // Render episodes for each season
      for (let j = 0; j < data.length; j++) {
        let description =
          data[j]['overview'].length > this._maxEpChars
            ? data[j]['overview'].slice(0, this._maxEpChars) + '...'
            : data[j]['overview'];

        markup += `
          <div class="media-episode ${j === 0 ? 'first-episode' : ''}">
              <div class="episode-wrapper">
              <div class="episode-index">${data[j]['episode_number']}</div>
              <div class="episode-img">
                  <img
                  class="episode-thumbnail"
                  src="${
                    data[j]['still_path']
                      ? this._imgPath + data[j]['still_path']
                      : 'https://media.lordicon.com/icons/wired/gradient/980-not-applicable.svg'
                  }"
                  />
                  <div class="play-icon">
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      fill="currentColor"
                      class="bi bi-play-circle"
                      viewBox="0 0 16 16"
                  >
                      <path
                      d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"
                      />
                      <path
                      d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445"
                      />
                  </svg>
                  </div>
              </div>
              <div class="episode-data">
                  <div class="episode-title-wrapper">
                  <span class="episode-title">${data[j]['name']}</span>
                  <span class="episode-duration">${data[j]['runtime']}m</span>
                  </div>
                  <div class="episode-description">
                  ${description}
                  </div>
              </div>
              </div>
          </div>`;
      }
    }

    episodesWrapper.innerHTML = markup;
  }

  updateData(data) {
    if (this._data) {
      this._dataHistory.push(this._data);
      this._data = data;
      this._btnBack.classList.remove('hidden');
    } else this._data = data;
  }

  updateSeason(seasonData, seasonNum, render = true) {
    this._data[`season_${seasonNum}`] = seasonData;
    console.log(this._data);

    if (!render) return;

    const markup = this._updateEpisodes(
      this._data[`season_${seasonNum}`]['episodes']
    );
    this._modal.querySelector('.episodes-wrapper').innerHTML = markup;
    this._modal.querySelector('.season-list')?.remove();
  }

  _bindToggles() {
    this._modal.addEventListener('click', (e) => {
      const target = e.target.closest('.full-toggle');
      if (!target) return;

      let targetContainer =
        target.parentElement.querySelector('.toggle-target');

      // To scroll back later
      const scrollY = this._overlay.scrollTop;

      // If toggling recommendations or trailers
      if (targetContainer) {
        targetContainer.classList.toggle('full-view');
      } else {
        targetContainer = target.closest('.wrapper');
        targetContainer.classList.toggle('full-view');
      }

      // Update Chevron
      target.querySelector('svg').innerHTML =
        targetContainer.classList.contains('full-view')
          ? this._upChevron
          : this._downChevron;

      // If expanded, keep scroll position. If shrunk, scroll back to the shrunk wrapper.
      if (this._overlay.scrollTop >= scrollY) this._overlay.scrollTop = scrollY;
      else target.closest('.wrapper').scrollIntoView({ behavior: 'instant' });
    });
  }

  _bindSeason() {
    this._modal.addEventListener('click', (e) => {
      const target = e.target.closest('.season-select');
      if (!target) return;

      this._toggleSeasons(target);
    });
  }

  _bindBack() {
    this._modal.addEventListener('click', (e) => {
      const target = e.target.closest('.modal-back');
      if (!target) return;

      this._data = this._dataHistory.pop();

      // Hide button if no more history
      if (this._dataHistory.length === 0) this._btnBack.classList.add('hidden');

      if (this._data['type'] === 'title') {
        this._modal.classList.remove('full-size');
        this.updateTitleMarkup();
      } else if (this._data['type'] === 'nav') {
        this._modal.classList.add('full-size');
        // Generates skeleton to empty out all other containers
        this._generateNavigationSkeleton();
        this.updateNavigationMarkup();
      }
    });
  }

  _hide(handler) {
    this._overlay.classList.add('fade-out-modal');

    this._overlay.addEventListener('animationend', (e) => {
      if (e.target !== this._overlay) return;

      handler();
      e.target.remove();
      this._dataHistory.splice(0); // Delete all history
      this._data = null;
      this._parentEl.style = 'overflow: visible';
    });
  }

  _toggleSeasons(target) {
    target.classList.toggle('active');

    if (target.classList.contains('active')) {
      let ul = document.createElement('ul');
      ul.classList.add('season-list');

      let seasons = this._data['seasons'].filter((season) =>
        season['name'].startsWith('Se')
      );

      let seasonsHTML = seasons
        .map(
          (season, i) => `
          <li class="season-list-item" data-season="${i + 1}" data-ep="${
            season['episode_count']
          }">
            Season ${i + 1}<span class="episode-count">(${
            season['episode_count']
          } episodes)</span>
          </li>`
        )
        .join('');

      // Add divider and all episodes
      seasonsHTML += `
      <div class="season-list-separator"></div>
      <li class="season-list-item" data-season="all">See All Episodes</li>`;

      ul.innerHTML = seasonsHTML;
      // Insert as sibling
      target.parentElement.insertAdjacentElement('beforeend', ul);
    } else {
      target.parentElement.querySelector('.season-list')?.remove();
    }
  }

  _generateStructure() {
    const markup = `
    <div class="media-modal-overlay" tabindex="0">
      <div class="media-modal">
        <div class="nav-icon modal-close">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-x-circle-fill"
            viewBox="0 0 16 16"
          >
            <path
              d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"
            />
          </svg>
        </div>
        <div class="nav-icon modal-back hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-x-circle-fill"
            viewBox="0 0 16 16"
          >
            <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
          </svg>
        </div>
        <div class="media-modal-backdrop">
        </div>
        <div class="modal-body">
          <div class="media-details">
          </div>
          <div class="media-episodes">
          </div>
          <div class="media-recommendations">
          </div>
          <div class="trailers">
          </div>
          <div class="production">
          </div>
        </div>
        <div class="media-modal-spacer"></div>
      </div>
    </div>`;

    document.body.insertAdjacentHTML('afterbegin', markup);
  }

  _generateTitleSkeleton() {
    this._titleBackdrop.innerHTML = `
    <div class="media-backdrop-wrapper">
      <div class="modal-backdrop">
        <div class="category-loading-skeleton"></div>
      </div>
    </div>`;

    this._titleDetails.innerHTML = `
    <div class="media-metadata">
      <div class="metadata">
        <div class="category-loading-skeleton"></div>
        <div class="category-loading-skeleton"></div>
        <div class="category-loading-skeleton"></div>
        <div class="category-loading-skeleton"></div>
        <div class="category-loading-skeleton"></div>
        <div class="category-loading-skeleton"></div>
      </div>
      <div class="description">
        <div class="category-loading-skeleton"></div>
      </div>
    </div>
    <div class="media-production">
      <div>
        <div class="category-loading-skeleton"></div>
      </div>
      <div>
        <div class="category-loading-skeleton"></div>
      </div>
      <div>
        <div class="category-loading-skeleton"></div>
      </div>
    </div>`;

    this._titleEpisodes.innerHTML = `
    <div class="episodes-header">
      <div class="category-loading-skeleton"></div>
    </div>
    <div class="episodes-wrapper wrapper">
    </div>`;

    // This is called here and not inserted in the above string literal because it automatically inserts itself.
    // It is coded this way because this function is called whenever the user is loading a new season's info.
    this._generateEpisodesSkeleton(8);

    this._titleRecommendations.innerHTML = `
    <div class="recommendations-wrapper wrapper">
      <div class="recommendations-container">
        <div class="recommendation">
          <div class="poster">
            <div class="category-loading-skeleton"></div>
          </div>
          <div class="recommendation-body">
            <div class="metadata">
              <div class="category-loading-skeleton"></div>
            </div>
          </div>
        </div>
        <div class="recommendation">
          <div class="poster">
            <div class="category-loading-skeleton"></div>
          </div>
          <div class="recommendation-body">
            <div class="metadata">
              <div class="category-loading-skeleton"></div>
            </div>
          </div>
        </div>
        <div class="recommendation">
          <div class="poster">
            <div class="category-loading-skeleton"></div>
          </div>
          <div class="recommendation-body">
            <div class="metadata">
              <div class="category-loading-skeleton"></div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

    this._titleTrailers.innerHTML = `
    <div class="header-title">
      <div class="category-loading-skeleton"></div>
    </div>
    <div class="trailers-container">
      <a class="trailer-link" target="_blank" rel="noopener noreferrer">
        <div class="category-loading-skeleton"></div>
      </a>
      <a class="trailer-link" target="_blank" rel="noopener noreferrer">
        <div class="category-loading-skeleton"></div>
      </a>
      <a class="trailer-link" target="_blank" rel="noopener noreferrer">
        <div class="category-loading-skeleton"></div>
      </a>
    </div>`;

    this._titleProduction.innerHTML = `
    <div class="header-title">
      <div class="category-loading-skeleton"></div>
    </div>
    <div class="media-production">
      <div class="creators">
        <div class="category-loading-skeleton"></div>
      </div>
      <div class="cast">
        <div class="category-loading-skeleton"></div>
      </div>
      <div class="genres">
        <div class="category-loading-skeleton"></div>
      </div>
      <div class="keywords">
        <div class="category-loading-skeleton"></div>
      </div>
      <div class="maturity">
        <div class="category-loading-skeleton"></div>
      </div>
    </div>`;
  }

  _generateNavigationSkeleton() {
    let recommendations = '';

    for (let i = 0; i < 8; i++) {
      recommendations += `
      <div class="recommendation">
        <div class="poster">
          <div class="category-loading-skeleton"></div>
        </div>
        <div class="recommendation-body">
          <div class="metadata">
            <div class="category-loading-skeleton"></div>
          </div>
        </div>
      </div>`;
    }

    this._titleBackdrop.innerHTML = ``;

    this._titleDetails.innerHTML = ``;

    this._titleEpisodes.innerHTML = ``;

    this._titleRecommendations.innerHTML = `
    <div class="header-title center">
      <div class="category-loading-skeleton"></div>
    </div>
    <div class="recommendations-wrapper wrapper">
      <div class="recommendations-container">
        ${recommendations}
      </div>
    </div>`;

    this._titleTrailers.innerHTML = ``;

    this._titleProduction.innerHTML = ``;
  }

  _generateEpisodesSkeleton(episodeNum) {
    if (!episodeNum) return '';
    const wrapper = this._modal?.querySelector('.episodes-wrapper');

    let markup = `
    <div class="full-toggle">
      <div
        class="recommendations-show-more absolute-center show-more-icon"
        data-message="Show More"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-chevron-down"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
          />
        </svg>
      </div>
    </div>`;

    for (let i = 0; i < episodeNum; i++) {
      markup += `
      <div class="media-episode">
        <div class="episode-wrapper">
          <div class="episode-index">
            <div class="category-loading-skeleton"></div>
          </div>
          <div class="episode-img">
            <div class="category-loading-skeleton"></div>
          </div>
          <div class="episode-data">
            <div class="episode-title-wrapper">
              <span class="episode-title">
                <div class="category-loading-skeleton"></div>
              </span>
              <span class="episode-duration">
                <div class="category-loading-skeleton"></div>
              </span>
            </div>
            <div class="category-loading-skeleton"></div>
          </div>
        </div>
      </div>`;
    }

    // If wrapper exists, update, if not, return markup
    if (wrapper) wrapper.innerHTML = markup;
    else return markup;
  }

  _generateBackdrop(data) {
    // If no data, don't generate
    if (!data) return '';

    console.log(data);
    // All images
    const imgData = data['images?include_image_language=en'];
    const backdrop =
      imgData['backdrops'][0]?.[`file_path`] || data['backdrop_path'];
    const logo = imgData['logos'][0]?.[`file_path`];
    const type = data['number_of_episodes'] ? 'Episode' : 'Movie';

    return `
    <div class="media-backdrop-wrapper">
        <div class="modal-backdrop">
        <img
            class="modal-backdrop-image"
            ${
              backdrop
                ? `src="${this._imgPath + backdrop}"`
                : `src="https://images.ctfassets.net/y2ske730sjqp/1aONibCke6niZhgPxuiilC/2c401b05a07288746ddf3bd3943fbc76/BrandAssets_Logos_01-Wordmark.jpg?w=940"`
            }
        />
        </div>
        <div class="modal-backdrop-metadata">
        <div class="modal-backdrop-left">
            
            ${
              logo
                ? `<img
            class="modal-metadata-logo" src="${this._imgPath + logo}"/>`
                : `<div class="title-name">${
                    this._data['name'] || this._data['original_title']
                  }</div>`
            }
            
            <div class="modal-backdrop-icons">
            <button class="modal-play">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-play-fill billboard-icon"
                viewBox="0 0 16 16"
                >
                <path
                    d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"
                />
                </svg>
                Play ${type}
            </button>
            <button class="modal-icon">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-plus-lg"
                viewBox="0 0 16 16"
                >
                <path
                    fill-rule="evenodd"
                    d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
                />
                </svg>
            </button>
            <button class="modal-icon">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-hand-thumbs-up"
                viewBox="0 0 16 16"
                >
                <path
                    d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.2 2.2 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"
                />
                </svg>
            </button>
            </div>
        </div>
        <div class="modal-backdrop-right">
            <button class="modal-sound">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-volume-up billboard-icon"
                viewBox="0 0 16 16"
            >
                <path
                d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z"
                />
                <path
                d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z"
                />
                <path
                d="M10.025 8a4.5 4.5 0 0 1-1.318 3.182L8 10.475A3.5 3.5 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.5 4.5 0 0 1 10.025 8M7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12zM4.312 6.39 6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11"
                />
            </svg>
            </button>
        </div>
        </div>
    </div>`;
  }

  _generateDetails(data) {
    if (!data) return '';

    const year =
      data['first_air_date']?.split('-')[0] ||
      data['release_date']?.split('-')[0];

    // Either TV show or Movie, based on API schema
    const maturity =
      data['content_ratings']?.['results'].find(
        (result) => result['iso_3166_1'] === 'US'
      )?.['rating'] ||
      data['release_dates']?.['results']
        ?.find((result) => result['iso_3166_1'] === 'US')
        ?.['release_dates']?.find((cert) => cert['certification'])?.[
        'certification'
      ];

    // Get duration in seasons, episodes, or runtime if movie
    const duration =
      data['number_of_seasons'] > 1
        ? `${data['number_of_seasons']} Seasons`
        : data['number_of_episodes']
        ? `${data['number_of_episodes']} Episodes`
        : parseMovieDuration(data);

    // Get two first sentences, add period at end if no period exists.
    let description =
      data['overview'].split('.').slice(0, 2).join('.') ||
      'No description was found for this title.';
    if (description.at(-1) !== '.') description += '.';

    // Only three or less keywords in metadata summary
    const allKeywords =
      data['keywords']?.['results'] || data['keywords']?.['keywords'];
    const keywords = [];
    for (let i = 0; i < 3; i++) {
      if (allKeywords[i]) {
        const keyword = allKeywords[i]['name'];
        const keywordID = allKeywords[i]['id'];

        const capitalized = capitalizeEveryWord(keyword);
        keywords.push(
          `<span data-id="${keywordID}" class='navigation navigation-keyword'>${capitalized}</span>`
        );
      }
    }

    const genres = [];
    for (let i = 0; i < data['genres'].length; i++) {
      const genre = data['genres'][i]['name'];
      genres.push(`<span class='navigation navigation-genre'>${genre}</span>`);
    }

    const filteredActing = data['credits']['cast'].filter(
      (castMember) => castMember['known_for_department'] === 'Acting'
    );
    // Only three or less acting cast members in metadata summary
    const cast = [];
    for (let i = 0; i < 3; i++) {
      if (filteredActing[i]) {
        const actor = filteredActing[i]['name'];
        cast.push(`<span class='navigation navigation-cast'>${actor}</span>`);
      }
    }

    return `
    <div class="media-metadata">
        <div class="metadata">
        <span class="media-year">${year}</span>
        <span class="media-badge age">${maturity || 'G'}</span>
        <span class="media-duration">${duration}</span>
        <span class="media-badge special">HD</span>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            role="img"
            data-icon="AudioDescriptionStandard"
            aria-hidden="true"
            class="accessibility-icon"
        >
            <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M21.9782 7.52002H22.2621C23.37 8.81831 24.0001 10.4801 24.0001 12.2077C24.0001 13.7414 23.505 15.2301 22.6221 16.4453H22.3348H21.8501H21.5662C22.5598 15.2613 23.1207 13.7691 23.1207 12.2077C23.1207 10.449 22.404 8.75599 21.1611 7.52002H21.445H21.9782ZM6.91381 16.4796H8.87336V7.52661H6.42566L0 16.4796H2.87701L3.63174 15.2956H6.91381V16.4796ZM4.8625 13.4299H6.92592V10.224L4.8625 13.4299ZM12.3019 9.62283C13.621 9.62283 14.6839 10.6926 14.6839 12.0048C14.6839 13.3203 13.621 14.3901 12.3019 14.3901H11.6787V9.62283H12.3019ZM12.5443 16.4743C15.0128 16.4743 17.0208 14.4698 17.0208 12.0048C17.0208 9.52935 15.0335 7.52826 12.565 7.52826H12.5373H9.79883V16.4778H12.5443V16.4743ZM20.0103 7.52002H19.7264H19.1932H18.9093C20.1522 8.75599 20.8689 10.449 20.8689 12.2077C20.8689 13.7691 20.308 15.2613 19.3144 16.4453H19.5983H20.083H20.3634C21.2531 15.2301 21.7482 13.7414 21.7482 12.2077C21.7482 10.4801 21.1181 8.81831 20.0103 7.52002ZM17.4745 7.52002H17.7584C18.8663 8.81831 19.4895 10.4801 19.4895 12.2077C19.4895 13.7414 19.0013 15.2301 18.1116 16.4453H17.8277H17.3464H17.0625C18.0492 15.2613 18.6101 13.7691 18.6101 12.2077C18.6101 10.449 17.9004 8.75599 16.6575 7.52002H16.9344H17.4745Z"
            fill="currentColor"
            ></path>
        </svg>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-chat-right-text"
            viewBox="0 0 16 16"
        >
            <path
            d="M2 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.586a2 2 0 0 1 1.414.586l2 2V2a1 1 0 0 0-1-1zm12-1a2 2 0 0 1 2 2v12.793a.5.5 0 0 1-.854.353l-2.853-2.853a1 1 0 0 0-.707-.293H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z"
            />
            <path
            d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6m0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5"
            />
        </svg>
        </div>
        <div class="description">
        <span>
            ${description}
        </span>
        </div>
    </div>
    <div class="media-production">
        <div>
        <span class="media-tag">Cast:</span> ${
          cast.join(', ') || 'None Found'
        }${
      filteredActing.length > 3
        ? `<span class="emphasis more">, more...</span>`
        : ''
    }
        </div>
        <div>
        <span class="media-tag">Genres:</span> ${
          genres.join(', ') || 'None Found'
        }
        </div>
        <div>
        <span class="media-tag">Keywords:</span> ${
          keywords.join(', ') || 'None Found'
        } ${
      allKeywords.length > 3
        ? `<span class="emphasis more">, more...</span>`
        : ''
    }
        </div>
    </div>`;
  }

  _generateEpisodes(data) {
    if (!data || !data['number_of_episodes']) return '';

    let seasons =
      data['seasons'].length > 1
        ? `<div class="custom-select">
            <button class="season-select">Season 1</button>
          </div>`
        : `<h3>${data.name}</h3>`;

    let markup = `
    <div class="episodes-header">
        <h2>Episodes</h2>
        ${seasons}
    </div>
    <div class="episodes-wrapper wrapper">
        ${this._updateEpisodes(data['season_1']['episodes'])}
    </div>`;

    return markup;
  }

  _updateEpisodes(data) {
    if (!data) return '';

    // Fullview toggle
    let markup = `
    <div class="full-toggle" ${data.length <= 10 ? 'hidden' : ''}>
        <div
        class="recommendations-show-more absolute-center show-more-icon"
        data-message="Show More"
        >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-chevron-down"
            viewBox="0 0 16 16"
        >
        ${
          this._titleEpisodes
            ?.querySelector('.episodes-wrapper')
            ?.classList.contains('full-view')
            ? this._upChevron
            : this._downChevron
        }
        </svg>
        </div>
    </div>`;

    for (let i = 0; i < data.length; i++) {
      let description =
        data[i]['overview'].length > this._maxEpChars
          ? data[i]['overview'].slice(0, this._maxEpChars) + '...'
          : data[i]['overview'];

      markup += `
        <div class="media-episode ${i === 0 ? 'first-episode' : ''}">
            <div class="episode-wrapper">
            <div class="episode-index">${data[i]['episode_number']}</div>
            <div class="episode-img">
                <img
                class="episode-thumbnail"
                ${
                  data[i]['still_path']
                    ? `src="${this._imgPath + data[i]['still_path']}"`
                    : 'style="border: 1px dashed rgb(128, 128, 128);"'
                }
                />
                <div class="play-icon">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="currentColor"
                    class="bi bi-play-circle"
                    viewBox="0 0 16 16"
                >
                    <path
                    d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"
                    />
                    <path
                    d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445"
                    />
                </svg>
                </div>
            </div>
            <div class="episode-data">
                <div class="episode-title-wrapper">
                <span class="episode-title">${
                  data[i]['name'] || 'Unknown'
                }</span>
                <span class="episode-duration">${
                  data[i]['runtime'] || 'N/A '
                }m</span>
                </div>
                <div class="episode-description">
                ${description || 'No description for this episode was found.'}
                </div>
            </div>
            </div>
        </div>`;
    }

    return markup;
  }

  _generateRecommendations(data) {
    if (!data || data.length === 0) return '';

    let markup = `
    <div class="header-title">More Like This</div>
    <div class="recommendations-wrapper wrapper">
      <div class="full-toggle">
        <div
          class="recommendations-show-more absolute-center show-more-icon"
          data-message="Show More"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-chevron-down"
            viewBox="0 0 16 16"
          >
            <path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
          </svg>
        </div>
      </div>
      <div class="recommendations-container toggle-target">`;

    for (let i = 0; i < data.length; i++) {
      const year =
        data[i]['first_air_date']?.split('-')[0] ||
        data[i]['release_date']?.split('-')[0];

      const type = data[i]['media_type'] === 'tv' ? 'TV Show' : 'Movie';

      const rating = data[i]['vote_average'].toFixed(1);

      // Get two first sentences, add period at end if no period exists.
      let description =
        data[i]['overview'].length > this._maxRecChars
          ? data[i]['overview'].slice(0, this._maxRecChars).trim() + '...'
          : data[i]['overview'];

      markup += `
        <div class="recommendation">
            <div class="poster">
            <div class="recommendation-type">${type}</div>
            <img
                src="${this._imgPath + data[i]['poster_path']}"
            />
            <div class="play-icon">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                fill="currentColor"
                class="bi bi-play-circle"
                viewBox="0 0 16 16"
                >
                <path
                    d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"
                />
                <path
                    d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445"
                />
                </svg>
            </div>
            </div>
            <div class="recommendation-body">
            <div class="metadata">
                <span class="media-year-small">${year || 'Unknown'}</span>
                <span class="media-badge age">${rating}</span>
                <span class="media-badge special">HD</span>
                <button class="modal-icon small navigation navigation-title" data-type="${
                  data[i]['media_type']
                }" data-id="${data[i]['id']}">
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-plus-lg"
                      viewBox="0 0 16 16"
                  >
                    <path d="m9.708 6.075-3.024.379-.108.502.595.108c.387.093.464.232.38.619l-.975 4.577c-.255 1.183.14 1.74 1.067 1.74.72 0 1.554-.332 1.933-.789l.116-.549c-.263.232-.65.325-.905.325-.363 0-.494-.255-.402-.704zm.091-2.755a1.32 1.32 0 1 1-2.64 0 1.32 1.32 0 0 1 2.64 0"/>
                  </svg>
                </button>
            </div>
            <div class="recommendation-description">
                ${description || 'No description was found for this show.'}
            </div>
            </div>
        </div>`;
    }

    markup += `
    </div>
    </div>
    `; // To close up recommendations wrapper and recommendations container. Check initial markup.

    return markup;
  }

  _generateTrailers(data) {
    if (!data) return '';

    let markup = `
    <div class="header-title">Trailers & More</div>
    <div class="trailers-wrapper wrapper">
      <div class="full-toggle ${data.length > 6 ? '' : 'hidden'}">
        <div
          class="recommendations-show-more absolute-center show-more-icon"
          data-message="Show More"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-chevron-down"
            viewBox="0 0 16 16"
          >
            <path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
          </svg>
        </div>
      </div>
      <div class="trailers-container toggle-target ${
        data.length > 6 ? '' : 'maskless'
      }">
        `;

    for (let i = 0; i < data.length; i++) {
      markup += `
        <a
        class="trailer-link"
        href="https://www.youtube.com/watch?v=${data[i]['key']}"
        target="_blank"
        rel="noopener noreferrer"
        >
            <div class="trailer">
            <div class="trailer-image">
                <img
                src="http://img.youtube.com/vi/${data[i]['key']}/maxresdefault.jpg
                "
                />
                <div class="play-icon">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    fill="currentColor"
                    class="bi bi-play-circle"
                    viewBox="0 0 16 16"
                >
                    <path
                    d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"
                    />
                    <path
                    d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445"
                    />
                </svg>
                </div>
            </div>

            <span class="trailer-title"
                >${data[i]['name']}</span
            >
            </div>
        </a>`;
    }

    markup += `</div>
    </div>`; // Close trailers container & wrapper. Check HTML above.

    return markup;
  }

  _generateProduction(data) {
    if (!data) return '';

    // Either creators if TV Show, or production companies if movie
    const createdBy = data['created_by']?.map(
      (creator) =>
        `<span class='navigation navigation-creator'>${creator.name}</span>`
    );

    const producedBy = data['production_companies']?.map(
      (company) =>
        `<span class='navigation navigation-company' data-id="${company.id}">${company.name}</span>`
    );

    const filteredActing = data['credits']['cast']
      .filter((castMember) => castMember['known_for_department'] === 'Acting')
      .map(
        (actor) =>
          `<span class='navigation navigation-cast'>${actor.name}</span>`
      );

    const genres = data['genres'].map(
      (genre) =>
        `<span class='navigation navigation-genre'>${genre.name}</span>`
    );

    const keywordsArr =
      data['keywords']?.['results'] || data['keywords']?.['keywords'];
    const keywords = keywordsArr.map(
      (keyword) =>
        `<span data-id="${
          keyword.id
        }" class='navigation navigation-keyword'>${capitalizeEveryWord(
          keyword.name
        )}</span>`
    );

    // Either TV show or Movie, based on API schema
    const maturity =
      data['content_ratings']?.['results'].find(
        (result) => result['iso_3166_1'] === 'US'
      )?.['rating'] ||
      data['release_dates']?.['results']
        ?.find((result) => result['iso_3166_1'] === 'US')
        ?.['release_dates']?.find((cert) => cert['certification'])?.[
        'certification'
      ];

    // Creators if tv sow, production companies if movie
    const creators =
      createdBy?.length > 0
        ? `<span class="media-tag">Creators:</span> ${
            createdBy?.join(', ') || 'Unknown'
          }`
        : `<span class="media-tag">Production Companies:</span> ${
            producedBy?.join(', ') || 'Unknown'
          }`;

    return `
    <div class="header-title">About ${data.name || data['original_title']}</div>
    <div class="media-production">
      <div class="creators">
        ${creators}
      </div>
      <div class="cast">
        <span class="media-tag">Cast:</span> ${filteredActing.join(', ')}
      </div>
      <div class="genres">
        <span class="media-tag">Genres:</span> ${genres.join(', ')}
      </div>
      <div class="keywords">
        <span class="media-tag">Keywords:</span> ${keywords.join(', ')}
      </div>
      <div class="maturity">
        <span class="media-tag">Maturity Rating:</span>
        <span class="media-badge age">${maturity || 'G'}</span>
      </div>
    </div>`;
  }
}

export default new Title();
