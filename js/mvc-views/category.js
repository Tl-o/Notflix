import "core-js/stable";
import { View } from "./view";
import { mark } from "regenerator-runtime";

export class Category extends View {
  // Should start with the categories parent to insert elements there.
  _parentEl = document.querySelector(".categories");
  _ID = "ID" + Math.floor(Math.random() * 999999);
  // Category element is the category's rendered DOM, to control pagination and sliding.
  _categoryEl;
  // The actual shows container, to add / update shows and enable endless scrolling
  _showContainerEl;
  _resultsPerPage;
  _currIndex = 0; // The index of current element.
  _firstVisibleElementIndex = 0; // The index of the first visible element out of resultsPerPage
  _currPage = 0;
  _itemSize = 15; // One item's size in vw unit, based on css class

  init(data) {
    this.render(data);
    this._categoryEl = this._parentEl.querySelector(`#${this._ID}`);
    this._showContainerEl = this._categoryEl.querySelector(".category-shows");
    this._resetPos();
    this._generateSliders();
    this._categoryEl
      .querySelector(".category-shows")
      .addEventListener("transitionend", () => {
        console.log("Ended");
      });
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
    const numPages =
      Math.floor(this._data.shows.length / this._resultsPerPage) + 1;

    if (numPages === 1) return "";

    for (let i = 0; i < numPages; i++) markup += `<li>Page ${i + 1}</li>`;
    return markup;
  }

  _generateShows() {
    return `
      ${this._generatePreviousShows()}
      ${this._generateCurrShows()}
      ${this._generateNextShows()}
    `;
  }

  _generateCurrShows() {
    let markup = "";

    // Generate initial page, next page, and one more to hide the dynamic generation
    let until =
      this._data.shows.length > this._resultsPerPage
        ? this._resultsPerPage
        : this._data.shows.length;

    for (let i = 0; i < this._resultsPerPage; i++) {
      markup += `
        <div class="category-item">
          <div class="show-img">Init</div>
          <div class="progress-bar"></div>
        </div>
      `;
    }
    return markup;
  }

  _generateNextShows() {
    // If the amount of shows are less than the results per page, means there is no next page to navigate to
    if (this._data.shows.length <= this._resultsPerPage) return "";

    let markup = "";

    // Starting index, if it's bigger than the length then we're on the last page, so reset to 0
    let index = this._currIndex + this._resultsPerPage;
    if (index > this._data.shows.length) index = 0;

    // How many shows to print, if it's bigger then length then it means we're on the last page
    let until = index + this._resultsPerPage;
    if (until > this._data.shows.length) until = this._data.shows.length;

    // for (index; index < until; index++) {
    //   markup += `
    //     <div class="category-item">
    //       <div class="show-img">Next</div>
    //       <div class="progress-bar"></div>
    //     </div>
    //   `;
    // }
    for (let i = 0; i < this._resultsPerPage + 1; i++) {
      markup += `
        <div class="category-item">
          <div class="show-img">Next</div>
          <div class="progress-bar"></div>
        </div>
      `;
    }
    return markup;
  }

  _generatePreviousShows() {
    // If the amount of shows are less than the results per page, means there is no previous page to navigate to
    let markup = "";
    if (this._data.shows.length <= this._resultsPerPage) return markup;

    let index = this._firstVisibleElementIndex;
    for (let i = 0; i < this._resultsPerPage + 1; i++) {
      index = index - 1 < 0 ? this._data.shows.length : index - 1;
      console.log(index);
      markup += `
        <div class="category-item">
          <div class="show-img">Prev</div>
          <div class="progress-bar"></div>
        </div>
      `;
    }
    return markup;
  }

  _generateSliders() {
    const numPages = this._data.shows.length / this._resultsPerPage;
    let mainContent = this._categoryEl.querySelector(".category-main-content");

    // If no other pages exist
    if (numPages <= 1 && this._currPage === 0) return;

    mainContent.insertAdjacentHTML(
      "afterbegin",
      `<span class="slide slide-left" data-direction="1"></span>`
    );
    mainContent.insertAdjacentHTML(
      "beforeend",
      `<span class="slide slide-right" data-direction="-1"></span>`
    );

    mainContent
      .querySelector(".slide-right")
      .addEventListener("click", this._slideRight.bind(this));

    mainContent
      .querySelector(".slide-left")
      .addEventListener("click", this._slideLeft.bind(this));

    this._categoryEl
      .querySelector(".category-shows")
      .addEventListener("transitionend", this._updateShows.bind(this));
  }

  _updateShows() {
    this._showContainerEl.classList.remove("animatable");
    const reRender = this._generateShows();
    this._showContainerEl.innerHTML = reRender;
    // categoryDiv.insertAdjacentHTML("beforeend", this._generateNextShows());
    // categoryDiv.insertAdjacentHTML("afterbegin", this._generatePreviousShows());

    // Default is slide by however many results per page
    let slideMultiplier = this._resultsPerPage;
    // If next page is the last page with less elements than the resultsPerPage, then only slide by that amount
    if (this._data.shows.length - this._currIndex < this._resultsPerPage)
      slideMultiplier = this._data.shows.length - this._currIndex;
    // Index of first visible element
    this._firstVisibleElementIndex = slideMultiplier;
    console.log(this._firstVisibleElementIndex);

    this._resetPos();
  }

  _slideRight() {
    if (this._showContainerEl.classList.contains("animatable")) return;
    this._currIndex += this._resultsPerPage;
    this._currPage++;
    const numPages =
      Math.floor(this._data.shows.length / this._resultsPerPage) + 1;

    if (this._currPage >= numPages) {
      this._currIndex = 0;
      this._firstVisibleElementIndex = 0;
      this._currPage = 0;
    }

    this._showContainerEl.classList.add("animatable");

    /* Slide by a single show's width multiplied by how many shows on the next page
      This is to ensure that it slides just enough to show the next amount of shows if they're
      less than the current page. */

    // Get specific amount of shows left
    const nextShows = this._data.shows.slice(
      this._currIndex,
      this._currIndex + this._resultsPerPage
    ).length;

    const defaultPos = this._itemSize * (this._resultsPerPage + 1) * -1;
    const slideBy = this._itemSize * nextShows;
    this._slide(-slideBy + defaultPos);
  }

  _slideLeft() {
    this._currIndex -= this._resultsPerPage;
    this._currPage--;
    const numPages =
      Math.floor(this._data.shows.length / this._resultsPerPage) + 1;
    let prevPageElements = this._resultsPerPage; // Default

    if (this._currPage < 0) {
      this._currIndex = this._resultsPerPage;
      this._firstVisibleElementIndex =
        this._data.shows.length - this._resultsPerPage;
      this._currPage = numPages - 1;
    } else if (this._currPage === 0) {
      prevPageElements = this._firstVisibleElementIndex;
      this._currIndex = 0;
      this._firstVisibleElementIndex = 0;
    }

    debugger;

    this._categoryEl
      .querySelector(".category-shows")
      .classList.add("animatable");

    /* Slide by a single show's width multiplied by how many shows on the next page
      This is to ensure that it slides just enough to show the next amount of shows if they're
      less than the current page. */

    // Get specific amount of shows left

    const defaultPos = this._itemSize * (this._resultsPerPage + 1) * -1;
    const slideBy = this._itemSize * prevPageElements;
    this._slide(slideBy + defaultPos);
  }

  _resetPos() {
    const defaultPos = this._itemSize * (this._resultsPerPage + 1) * -1;
    this._slide(defaultPos);
  }

  _slide(by) {
    this._categoryEl
      .querySelector(".category-shows")
      .setAttribute("style", `transform: translateX(${by}vw)`);
  }
}
