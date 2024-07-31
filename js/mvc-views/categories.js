import 'core-js/stable';
import { View } from './view';
import { Category } from './category';
import { mark } from 'regenerator-runtime';

class Categories extends View {
  _parentEl = document.querySelector('.categories');
  // An array of category view objects.
  _categories = [];
  _lastRenderedCategory = 0;
  _itemSize;
  _numOfResults;

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

  _timeout;
  _waitForHover = 0.4 * 1000; // In millieseconds
  _bound = false; // Check if hover and responsiveness are binded
  _observer;
  _isFetching = false;

  renderSkeleton() {
    this._isFetching = true;
    let numOfShows = '';
    for (let i = 0; i < this._numOfResults + 1; i++) {
      numOfShows += `
        <div class="category-item">
          <div class="category-loading-skeleton show-img"></div>
        </div>
      `;
    }

    const markup = `
        <div class="category-container skeleton">
          <div class="category-metadata">
            <div class="category-title">
              <h2 class="category-loading-skeleton"></h2>
            </div>
            <div class="category-pagination">
              <ul class="category-pages">
                <li class="category-loading-skeleton"></li>
              </ul>
            </div>
          </div>
          <div class="category-main-content">
            <div class="category-shows">
              ${numOfShows}
            </div>
          </div>
        </div>
    `;
    this._parentEl.insertAdjacentHTML('beforeend', markup);
  }

  clear() {
    this._isFetching = true;
    this._parentEl.innerHTML = '';
  }

  clearSkeleton() {
    this._isFetching = false;
    document.querySelector('.skeleton')?.remove();
  }

  bindHover(handler) {
    if (this._bound) return;
    this._bound = true;

    this._parentEl.addEventListener(
      'mouseenter',
      (e) => {
        if (!e.target?.classList.contains('category-item')) return;
        if (e.target.classList.contains('opaque')) return;

        // If only a bit of the element is showing, ignore
        const size = e.target.getBoundingClientRect();
        // Number is half of header's length
        if (size.top - 35 <= 0) return;

        this._timeout = setTimeout(() => {
          if (!e.target.dataset.gotData)
            handler(e.target.dataset.id, e.target.dataset.name, e);
        }, this._waitForHover);
      },
      true
    );

    this._parentEl.addEventListener(
      'mouseleave',
      (e) => {
        if (!e.target?.classList.contains('category-item')) return;
        if (this._timeout) clearTimeout(this._timeout);
      },
      true
    );
  }

  updateMetadata(name) {
    const allInstances = [
      ...document.querySelectorAll(`[data-name="${name}"]`),
    ];
    console.log(allInstances);
  }

  addObserverHandler(handler) {
    if (this._observer) return;
    this._observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this._isFetching) {
            handler();
          }
        });
      },
      {
        root: null,
        threshold: 0.2,
      }
    );
    this._observer.observe(document.querySelector('.intersection-observer'));
  }

  renderNewCategories() {
    for (
      let i = this._lastRenderedCategory;
      i < this._data.categories.length;
      i++
    ) {
      let newCategory = new Category();

      // Set number of results based on this object's data
      newCategory.setResultsPerPage(this._numOfResults, this._itemSize);
      newCategory.init(this._data.categories[i]);

      // Add it to the array to keep track of all categories from this object
      this._categories.push(newCategory);
    }

    this._lastRenderedCategory = this._data.categories.length;
  }

  _generateMarkup() {
    this.clear();
    this._generateViews();
    this._bindResponsiveness();
    this._lastRenderedCategory = this._data.categories.length;
    this._isFetching = false;
    return '';
  }

  _generateViews() {
    this._setInitialSize();
    this._data.categories.forEach((category) => {
      let newCategory = new Category();

      // Set number of results based on this object's data
      newCategory.setResultsPerPage(this._numOfResults, this._itemSize);
      newCategory.init(category);

      // Add it to the array to keep track of all categories from this object
      this._categories.push(newCategory);
    });
  }

  _bindResponsiveness() {
    if (this._bound) return;
    this._defaultQuery.addEventListener('change', (e) => {
      if (e.matches) this._updateCategories(6, 15);
    });

    this._largeQuery.addEventListener('change', (e) => {
      if (e.matches) this._updateCategories(5, 18);
    });

    this._mediumQuery.addEventListener('change', (e) => {
      if (e.matches) this._updateCategories(4, 22.5);
    });

    this._smallQuery.addEventListener('change', (e) => {
      if (e.matches) this._updateCategories(3, 30);
    });

    this._tinyQuery.addEventListener('change', (e) => {
      if (e.matches) this._updateCategories(2, 45);
    });
  }

  hover(e, data) {
    const size = e.target.getBoundingClientRect();
    const placement = e.target.dataset.placement;
    const hoverDiv = document.createElement('div');
    const showImg = e.target.querySelector('img').getAttribute('src');
    const logoImg = e.target.querySelector('.show-logo')?.getAttribute('src');
    hoverDiv.classList.add('category-item-hover');
    hoverDiv.classList.add(`category-${placement}`);

    let genres = `<span class="item-genre">${data.genres[0].name}</span>`;
    for (let i = 1; i < data.genres.length; i++) {
      // Break out of loop to only show 3 genres, max
      if (i === 3) break;
      genres += `<span class="item-genre separator">${
        data.genres[i].name.split(' ')[0]
      }</span>`;
    }

    const markup = `
        <div style="position: relative;" class="show-img-hover">
          <img src="${showImg}"/>
          ${logoImg ? `<img class="show-logo" src="${logoImg}"/>` : ''}
        </div>
        <div class="category-hover-data">
          <div class="category-icons">
            <div class="category-icon-left">
              <div class="category-icon category-icon-white">
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
              <div class="category-icon category-icon-transparent" data-message="Add to my list">
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
              <div class="category-icon category-icon-transparent" data-message="I like this!">
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
              <div class="category-icon category-icon-transparent" data-message="Episodes & info">
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
          <div class="category-item-metadata">
            <span class="category-match">${
              Math.floor(Math.random() * 50) + 50
            }% Match</span>
            <span class="category-age-rating">${data.maturity}</span>
            <span class="category-duration">${
              data.seasons > 1
                ? `${data.seasons} Seasons`
                : `${data.episodes} Episodes`
            }</span>
            <span class="category-special-badge">HD</span>
          </div>
          <div class="category-item-genres">
            ${genres}
          </div>
        </div>
        `;
    hoverDiv.innerHTML = markup;
    hoverDiv.style.cssText += `
          width: ${size.width}px;
          top: ${size.top + window.scrollY}px;
          bottom: ${size.bottom}px;
          left: ${size.left}px;
          right: ${size.right}px;
        `;

    // Add animation
    hoverDiv.addEventListener('mouseleave', function (e) {
      e.target.addEventListener('animationend', (e) => {
        if (e.target.classList.contains(`category-item-unhover-${placement}`))
          this.remove();
      });
      e.target.classList.add(`category-item-unhover-${placement}`);
    });

    document.body.insertAdjacentElement('afterbegin', hoverDiv);

    // Add hover tooltip on buttons
    hoverDiv.addEventListener(
      'mouseenter',
      (e) => {
        if (!e.target.classList.contains('category-icon')) return;

        const tooltipMessage = e.target.dataset.message;
        // If has message
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

    hoverDiv.addEventListener(
      'mouseleave',
      (e) => {
        if (!e.target.classList.contains('category-icon')) return;

        const tooltip = e.target.querySelector('.tooltip');
        if (tooltip) tooltip.remove();
      },
      true
    );

    // When scrolling off-screen
    const observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) entries[0].target.remove();
    });
    observer.observe(hoverDiv);
  }

  _updateCategories(newItemCount, newItemSize) {
    this._itemSize = newItemSize;
    this._categories.forEach((category) => {
      category.setResultsPerPage(newItemCount, this._itemSize);
      category.updateDom();
    });
  }

  _setInitialSize() {
    const windowWidthOnLoad = window.innerWidth;

    if (windowWidthOnLoad > 1400) {
      this._itemSize = 15; // Default, biggest size
      this._numOfResults = 6;
    }
    if (windowWidthOnLoad <= 1400 && windowWidthOnLoad > 1100) {
      this._itemSize = 18; // Default, biggest size
      this._numOfResults = 5;
    }
    if (windowWidthOnLoad <= 1100 && windowWidthOnLoad > 800) {
      this._itemSize = 22.5; // Default, biggest size
      this._numOfResults = 4;
    }
    if (windowWidthOnLoad <= 800 && windowWidthOnLoad > 500) {
      this._itemSize = 30; // Default, biggest size
      this._numOfResults = 3;
    }
    if (windowWidthOnLoad <= 500) {
      this._itemSize = 45; // Default, biggest size
      this._numOfResults = 2;
    }
  }
}

export default new Categories();
