'use strict';
import { View } from './view';
import 'core-js/stable';
import { IMG_PATH, MILLISECONDS_IN_SECOND } from '../config';
import { mark } from 'regenerator-runtime';

class Search extends View {
  _parentEl = document.querySelector('.search-container');
  _renderLimitPerSearch = 200; // Items rendered max limit before rendering footer
  _itemsPerRow = 5;

  // All about hovers
  _zIndex = 2005;
  _timeout;
  _activateDuration = 0.75 * MILLISECONDS_IN_SECOND;
  _savedData = []; // Array that holds data of all requested shows

  addHoverHandler(handler) {
    this._parentEl.addEventListener('mouseover', (e) => {
      const target = e.target.closest('.search-item');
      if (!target) return;

      this._timeout = setTimeout(() => {
        const result = target.dataset.order % this._itemsPerRow === 0;
        const slideDirection = result ? 'slide-left' : 'slide-right';
        const metadata = target.querySelector('.search-metadata');

        // Add style to metadata
        metadata.style = result ? 'right: 0;' : '';
        metadata.innerHTML = this._generateMetadataSkeleton();

        target.classList.add(slideDirection, 'search-hover');
      }, this._activateDuration);
    });

    this._parentEl.addEventListener('mouseout', (e) => {
      const target = e.target.closest('.search-item');
      if (!target) return;

      target.classList.remove('slide-left', 'slide-right', 'search-hover');

      if (this._timeout) clearTimeout(this._timeout);
    });
  }

  // Will bind Z-index transitions
  _bindTransitions() {
    this._parentEl.addEventListener('transitionstart', (e) => {
      if (!e.target.classList.contains('search-item')) return;

      e.target.style.zIndex = `${this._zIndex}`;
    });

    this._parentEl.addEventListener('transitionend', (e) => {
      if (!e.target.classList.contains('search-item')) return;
      // If it contains, means user is still hovering so do not adjust Z-index
      if (e.target.classList.contains('search-hover')) return;

      e.target.style = '';
      // Must clear metadata's inline style to ensure no right: 0 remains in case of screen size change to ensure proper responsiveness.
      e.target.querySelector('.search-metadata').style = '';
    });
  }

  updateMarkup() {
    return `
    <div class="search-metadata">
      <div class="category-icons">
        <div class="category-icon-left">
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
      <div class="description">
        Lorem ipsum dolor sit amet consectetur, adipisicing elit.
        Consectetur iste deserunt corrupti ipsam dignissimos ipsum. Incidunt
        ut quibusdam, cum maiores repudiandae magnam hic dolores doloribus,
        similique odit deleniti laborum aliquam.
      </div>
      <div class="search-metadata-wrapper">
        <div class="category-item-genres search-genres">
          <span class="search-genre">Sci-Fi</span>
          <span class="search-genre separator">Fantasy</span>
        </div>
        <div class="metadata-search">
          <span class="media-year-small vw-dependent">2024</span>
          <span class="media-badge age vw-dependent">TV-MA</span>
          <span class="media-badge special vw-dependent">HD</span>
          <span class="media-duration vw-dependent">Episodes</span>
        </div>
      </div>
    </div>`;
  }

  _generateMarkup() {
    this.clear();
    this.addHoverHandler('');
    this._bindTransitions();
    return this._generateResults(this._data['results']);
  }

  _generateResults(results) {
    let markup = ``;
    for (let i = 0; i < results.length; i++) {
      markup += `
      <div class="search-item" data-id="${results[i]['id']}" data-type="${
        results[i]['media_type']
      }" data-order="${i + 1}">
        <div class="search-image-container">
          ${this._generatePlaceholder(results[i])}
        </div>
        <div class="search-metadata">
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
