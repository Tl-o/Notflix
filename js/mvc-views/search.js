'use strict';
import { View } from './view';
import 'core-js/stable';
import {
  IMG_PATH,
  MILLISECONDS_IN_SECOND,
  MATURITY_RATING_MAPPING,
} from '../config';
import { parseMovieDuration } from '../helper';
import { mark } from 'regenerator-runtime';

class Search extends View {
  renderLimitPerSearch = 300; // Items rendered max limit before rendering footer

  _parentEl = document.querySelector('.search-container');
  _currPage = 1;
  _itemsPerRow = 6;
  _observer;
  _order = 1;

  // Queries
  _defaultQuery = window.matchMedia('(min-width: 1400px)');
  _largeQuery = window.matchMedia(
    '(max-width: 1400px) and (min-width: 1100px)'
  );
  _mediumQuery = window.matchMedia(
    '(max-width: 1100px) and (min-width: 800px)'
  );
  _smallQuery = window.matchMedia('(max-width: 800px) and (min-width: 500px)');
  _tinyQuery = window.matchMedia('(max-width: 500px)');

  // All about hovers
  _zIndex = 2999;
  _timeout;
  _activateDuration = 0.75 * MILLISECONDS_IN_SECOND;
  _savedData = []; // Array that holds data of all requested shows
  _descriptionCharLimit = 255;

  addHoverHandler(handler) {
    this._parentEl.addEventListener('mouseover', (e) => {
      // In case JS is finnicky, and does not detect mouseout event and removes wrapper
      if (e.target.classList.contains('search-wrapper')) {
        e.target.parentElement.classList.remove(
          'search-hover',
          'slide-left',
          'slide-right'
        );
        e.target.remove();
      }
      if (!e.target.closest('.search-image-container')) return;

      const target = e.target.closest('.search-item');
      // Already hovering
      if (target.classList.contains('search-hover')) return;

      this._timeout = setTimeout(() => {
        const result = target.dataset.order % this._itemsPerRow === 0;
        const slideDirection = result ? 'slide-left' : 'slide-right';
        const metadata = target.querySelector('.search-metadata');
        metadata.classList.remove('search-hidden');

        // Add style to metadata
        metadata.style = result ? 'right: 0;' : '';
        metadata.innerHTML = this._generateMetadataSkeleton();

        target.classList.add(slideDirection, 'search-hover');
        this._generateWrapper(target, target.dataset.order);

        // If already gotten show before, only render the data
        const exists = this._savedData.find(
          (title) => title['id'] === +target.dataset.id
        );
        if (exists) {
          this.updateMetadataMarkup(exists);
          return;
        }

        handler(target.dataset.id, target.dataset.type);
      }, this._activateDuration);
    });

    this._parentEl.addEventListener('mouseout', (e) => {
      // Logic for clearing out timeout if you unhovered image before activation
      if (
        (e.target.classList.contains('search-image') ||
          e.target.classList.contains('search-image-placeholder')) &&
        this._timeout
      )
        clearTimeout(this._timeout);

      // Logic for removing wrapper if you activated hover
      if (!e.target.classList.contains('search-wrapper')) return;

      const target = e.target.parentElement;
      e.target.remove();
      // First, clear timeout
      if (this._timeout) clearTimeout(this._timeout);

      target.classList.remove('slide-left', 'slide-right', 'search-hover');
    });
  }

  addObserverHandler(handler) {
    if (this._data['total_results'] <= 20) return;

    this._observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this._isFetching) {
            handler(
              this._data,
              ++this._currPage,
              this._parentEl.childElementCount
            );
          }
        });
      },
      {
        root: null,
        threshold: 0.2,
      }
    );
    this._observer.observe(document.querySelector('.search-observer'));
  }

  // Will bind Z-index transitions
  _bindTransitions() {
    this._parentEl.addEventListener('transitionstart', (e) => {
      if (!e.target.classList.contains('search-item')) return;

      e.target.style.zIndex = `${this._zIndex++}`;
    });

    this._parentEl.addEventListener('transitionend', (e) => {
      if (!e.target.classList.contains('search-item')) return;
      // If it contains, means user is still hovering so do not adjust Z-index
      if (e.target.classList.contains('search-hover')) return;

      e.target.style = '';
      // Must clear metadata's inline style to ensure no right: 0 remains in case of screen size change to ensure proper responsiveness.
      const metadata = e.target.querySelector('.search-metadata');
      metadata.style = '';
      metadata.classList.add('search-hidden');
    });
  }

  _bindTooltip() {
    // Add hover tooltip on buttons
    this._parentEl.addEventListener(
      'mouseenter',
      (e) => {
        if (!e.target.classList.contains('search-icon')) return;

        const tooltipMessage = e.target.dataset.message;
        if (!tooltipMessage) return;

        const coordinates = e.target.getBoundingClientRect();
        const tooltipDiv = document.createElement('div');
        tooltipDiv.classList.add('tooltip');
        tooltipDiv.innerHTML = `
          <span class="tooltip-message">${tooltipMessage}</span>
          <div class="tooltip-arrow"></div>
        `;

        tooltipDiv.style.cssText += `
          top: ${-coordinates.height / 1.2}px;
        `;

        e.target.insertAdjacentElement('afterbegin', tooltipDiv);
      },
      true
    );

    this._parentEl.addEventListener(
      'mouseleave',
      (e) => {
        if (!e.target.classList.contains('search-icon')) return;

        const tooltip = e.target.querySelector('.tooltip');
        if (tooltip) tooltip.remove();
      },
      true
    );
  }

  _bindResponsiveness() {
    this._defaultQuery.addEventListener('change', (e) => {
      if (e.matches) this._itemsPerRow = 6;
    });

    this._largeQuery.addEventListener('change', (e) => {
      if (e.matches) this._itemsPerRow = 5;
    });

    this._mediumQuery.addEventListener('change', (e) => {
      if (e.matches) this._itemsPerRow = 4;
    });

    this._smallQuery.addEventListener('change', (e) => {
      if (e.matches) this._itemsPerRow = 3;
    });

    this._tinyQuery.addEventListener('change', (e) => {
      if (e.matches) this._itemsPerRow = 2;
    });
  }

  updateDataHistory(data) {
    this._savedData.push(data);
  }

  updateMetadataMarkup(data) {
    const target = this._parentEl.querySelector(
      `.search-item[data-id='${data['id']}'] .search-metadata`
    );

    const order = target.closest('.search-item').dataset.order;

    const description =
      data['overview'].length > this._descriptionCharLimit
        ? data['overview'].slice(0, this._descriptionCharLimit).trim() + '...'
        : data['overview'];

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

    let genres = `<span class="item-genre">${
      data.genres?.[0]?.name || 'Unclassified'
    }</span>`;

    for (let i = 1; i < data.genres.length; i++) {
      // Break out of loop to only show 3 genres, max
      if (i === 3) break;
      genres += `<span class="item-genre separator">${
        data.genres[i].name.split(' ')[0]
      }</span>`;
    }

    target.innerHTML = `
      <div class="category-icons" style="${
        order % this._itemsPerRow === 0 ? 'flex-direction: row-reverse;' : ''
      }">
        <div class="category-icon-left" style="${
          order % this._itemsPerRow === 0 ? 'flex-direction: row-reverse;' : ''
        }">
          <div class="search-icon category-icon-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-play-fill"
              viewBox="0 0 16 16"
            >
              <path
                d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"
              />
            </svg>
          </div>
          <div
            class="search-icon category-icon-transparent"
            data-message="Add to my list"
          >
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
          </div>
          <div
            class="search-icon category-icon-transparent"
            data-message="I like this!"
          >
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
          </div>
        </div>
        <div class="category-icon-right">
          <div
            class="search-icon category-icon-transparent category-icon-info"
            data-message="Episodes & info"
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
        </div>
      </div>
      <div class="search-description">
        ${description || 'No description was found.'}
      </div>
      <div class="search-metadata-wrapper">
        <div class="category-item-genres search-genres" style="animation-delay: 0.25s;">
          ${genres}
        </div>
        <div class="metadata-search">
          <span class="media-year-small vw-dependent">${year || 'N/A'}</span>
          <span class="media-badge age vw-dependent">${maturity || 'N/A'}</span>
          <span class="media-badge special vw-dependent">HD</span>
          <span class="media-duration align-right vw-dependent">${duration}</span>
        </div>
      </div>`;
  }

  updateResults(data) {
    const lastItem = [...this._parentEl.children].at(-1);

    this._parentEl.insertAdjacentHTML(
      'beforeend',
      this._generateResults(data['results'])
    );

    lastItem.scrollIntoView({
      behavior: 'instant',
      block: 'end',
      inline: 'nearest',
    });
  }

  _generateMarkup() {
    this.clear();
    this._currPage = 1;
    this._order = 1;
    this._zIndex = 2999;
    this._bindTransitions();
    this._bindTooltip();
    this._bindResponsiveness();
    this._generateIntersection();
    return this._generateResults(this._data['results']);
  }

  _generateResults(results) {
    let markup = ``;
    for (let i = 0; i < results.length; i++) {
      if (results[i]['media_type'] === 'person') continue;

      markup += `
      <div class="search-item" data-id="${results[i]['id']}" data-type="${
        results[i]['media_type']
      }" data-order="${this._order++}">
        <div class="search-image-container">
          ${this._generatePlaceholder(results[i])}
        </div>
        <div class="search-metadata search-hidden">
        </div>
      </div>`;
    }

    return markup;
  }

  _generatePlaceholder(result) {
    if (result['poster_path']) {
      return `
      <img
      class="search-image"
      src="${IMG_PATH + result['poster_path']}"
      />`;
    }

    return `<div class="search-image-placeholder">${
      result['name'] || result['original_title'] || 'N/A'
    }</div>`;
  }

  _generateWrapper(container, wrapperOrder) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('search-wrapper');

    wrapper.style =
      wrapperOrder % this._itemsPerRow === 0 ? 'right: -10%' : 'left: -10%';

    container.insertAdjacentElement('afterbegin', wrapper);
  }

  _generateMetadataSkeleton() {
    return `
    <div class="category-icons">
      <div class="category-icon-left">
        <div class="search-icon">
          <div
            class="metadata-loading-skeleton"
            style="border-radius: 50%"
          ></div>
        </div>
        <div class="search-icon">
          <div
            class="metadata-loading-skeleton"
            style="border-radius: 50%"
          ></div>
        </div>
        <div class="search-icon">
          <div
            class="metadata-loading-skeleton"
            style="border-radius: 50%"
          ></div>
        </div>
      </div>
      <div class="category-icon-right">
        <div class="search-icon">
          <div
            class="metadata-loading-skeleton"
            style="border-radius: 50%"
          ></div>
        </div>
      </div>
    </div>
    <div class="description">
      <div class="metadata-loading-skeleton"></div>
    </div>
    <div class="search-metadata-wrapper">
      <div class="metadata-loading-skeleton"></div>
      </div>
      <div class="metadata-search" style="margin-top: 1vh">
        <div class="metadata-loading-skeleton"></div>
      </div>
    </div>`;
  }

  _generateIntersection() {
    if (
      this._parentEl.querySelector('.search-observer') ||
      this._data['total_results'] <= 20
    )
      return;

    const div = document.createElement('div');
    div.classList.add('search-observer');

    this._parentEl.insertAdjacentElement('beforeend', div);
  }

  _setInitialSize() {
    const windowWidthOnLoad = window.innerWidth;

    if (windowWidthOnLoad > 1400) {
      this._itemsPerRow = 6;
    }
    if (windowWidthOnLoad <= 1400 && windowWidthOnLoad > 1100) {
      this._itemsPerRow = 5;
    }
    if (windowWidthOnLoad <= 1100 && windowWidthOnLoad > 800) {
      this._itemsPerRow = 4;
    }
    if (windowWidthOnLoad <= 800 && windowWidthOnLoad > 500) {
      this._itemsPerRow = 3;
    }
    if (windowWidthOnLoad <= 500) {
      this._itemsPerRow = 2;
    }
  }
}

export default new Search();

/* How search is going to work :

Each result is a 9:16 poster, aligned using flex, that are X viewport width size. (Responsiveness this time is tied to CSS only). Behind it is an
absolutely positioned container with metadata, that on hover, is going to activate a CSS animation and change the Z-index of the whole element to be bigger.

When you search, they are rendered one by one with an animation delay. One function to generate shows, another to generate infinite scrolling
observer if totalResults is bigger than shows limit.

Only render the homepage when the user has written nothing, or when they click the X. As they're typing, if they stop for x milliseconds, search.

That's it, probably.
*/
