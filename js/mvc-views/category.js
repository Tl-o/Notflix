import "core-js/stable";
import { View } from "./view";
import { mark } from "regenerator-runtime";

export class Category extends View {
  // Should start with the categories parent to insert elements there.
  _parentEl = document.querySelector(".categories");
  _ID = "ID" + Math.floor(Math.random() * 999999);
  _transitionTime = 0.5 * 1000; // Transition time to slide shows in millieseconds.\
  _currIndex = 0; // The index of current element.
  // Category element is the category's rendered DOM, to control pagination and sliding.
  _categoryEl;
  _resultsPerPage;
  _currPage = 1;

  init(data) {
    this.render(data);
    this._categoryEl = this._parentEl.querySelector(`#${this._ID}`);
    this._generateSliders();
  }

  setResultsPerPage(num) {
    this._resultsPerPage = num;
  }

  _generateMarkup() {
    return `
    <div id='${this._ID}' class="category-container">
      <div class="category-metadata">
        <div class="category-title">
          <h2 class="title">${this._data.name}</h2>
        </div>
        <div class="category-pagination">
          <ul class="category-pages">
            ${this._generateListOfPages()}
          </ul>
        </div>
      </div>
      <div class="category-main-content">
        <div class="category-shows">
          ${this._generateShows()}
        </div>
      </div>
    </div>
    `;
  }

  _generateListOfPages() {
    // Edit later to account for 6 / 6 pages
    let markup = "";
    const numPages = Math.floor(this._data.shows.length / this._resultsPerPage);

    for (let i = 0; i < numPages; i++) markup += `<li>Page ${i + 1}</li>`;
    return markup;
  }

  _generateShows() {
    let markup = "";
    for (let i = 0; i < this._data.shows.length; i++) {
      markup += `
        <div class="category-item">
          <div class="show-img"></div>
          <div class="progress-bar"></div>
        </div>
      `;
    }
    return markup;
  }

  _generateSliders() {
    const numPages = Math.floor(this._data.shows.length / this._resultsPerPage);
    const showContainer = this._categoryEl.querySelector(
      ".category-main-content"
    );

    // If no other pages exist
    if (numPages < 1 && this._currPage === 1) return;

    showContainer.insertAdjacentHTML(
      "afterbegin",
      `<span class="slide slide-left hidden" data-direction="1"></span>`
    );
    showContainer.insertAdjacentHTML(
      "beforeend",
      `<span class="slide slide-right" data-direction="-1"></span>`
    );

    showContainer
      .querySelector(".slide-right")
      .addEventListener("click", this._slideRight.bind(this));
  }

  _slideRight() {
    const style = window.getComputedStyle(
      this._parentEl.querySelector(".category-item")
    );

    this._currIndex += this._resultsPerPage;

    /* Slide by a single show's width multiplied by how many shows on the next page
      This is to ensure that it slides just enough to show the next amount of shows if they're
      less than the current page. */

    // Get specific amount of shows left
    const nextShows = this._data.shows.slice(
      this._currIndex,
      this._currIndex + this._resultsPerPage
    ).length;
    console.log(nextShows);

    const slideBy = parseFloat(style.width) * nextShows;
    this._categoryEl
      .querySelector(".category-shows")
      .setAttribute("style", `transform: translateX(-${slideBy}px)`);
  }
}
