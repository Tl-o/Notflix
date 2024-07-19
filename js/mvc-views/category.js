"use strict";
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
  _endlessScrollEnabled = false;

  init(data) {
    this.render(data);
    this._categoryEl = this._parentEl.querySelector(`#${this._ID}`);
    this._showContainerEl = this._categoryEl.querySelector(".category-shows");
    this._resetPos();
    this._updatePagination();
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

    for (let i = 0; i < numPages; i++) markup += `<li class="pagination"></li>`;
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

    let currEl = this._firstVisibleElementIndex;

    for (let i = 0; i < until; i++) {
      markup += `
        <div class="category-item">
          <div class="show-img">
            <img src="${this._data.shows[currEl]?.thumbnail}">
          </div>
          <div class="progress-bar"></div>
        </div>
      `;
      currEl++;
    }
    return markup;
  }

  _generateNextShows() {
    // If the amount of shows are less than the results per page, means there is no next page to navigate to
    if (this._data.shows.length <= this._resultsPerPage) return "";

    let markup = "";

    let index = this._firstVisibleElementIndex + this._resultsPerPage;
    // Reset because next page is first page to allow for endless scrolling.
    if (index >= this._data.shows.length) index = 0;

    for (let i = 0; i < this._resultsPerPage + 1; i++) {
      markup += `
        <div class="category-item">
          <div class="show-img">
            <img src="${this._data.shows[index]?.thumbnail}">
          </div>
          <div class="progress-bar"></div>
        </div>
      `;
      index = index + 1 >= this._data.shows.length ? 0 : index + 1;
    }
    return markup;
  }

  _generatePreviousShows() {
    // If the amount of shows are less than the results per page, means there is no previous page to navigate to
    let markup = "";
    if (this._data.shows.length <= this._resultsPerPage) return markup;

    /* Generate the elements starting from the first in the previous page
     This is because the last element, once all the others are added, will 
     be visible as the left edge of the scrolling category. Refer to
     the above documentation.*/

    let index = this._firstVisibleElementIndex - this._resultsPerPage - 1;
    if (index < 0) index = this._data.shows.length + index;

    for (let i = 0; i < this._resultsPerPage + 1; i++) {
      markup += `
        <div class="category-item ${
          this._endlessScrollEnabled === false ? "opaque" : ""
        }">
          <div class="show-img">
            <img src="${this._data.shows[index]?.thumbnail}">
          </div>
          <div class="progress-bar"></div>
        </div>
      `;
      index = index + 1 >= this._data.shows.length ? 0 : index + 1;
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
      `<span class="slide slide-left hidden" data-direction="1"></span>`
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
    this._enableEndlessScrolling();
    const reRender = this._generateShows();
    this._showContainerEl.innerHTML = reRender;
    this._resetPos();
  }

  _updatePagination() {
    this._categoryEl.querySelectorAll(".pagination").forEach((page, i) => {
      if (i !== this._currPage) page.classList.remove("active");
      else page.classList.add("active");
    });
  }

  _enableEndlessScrolling() {
    if (this._endlessScrollEnabled) return;

    this._endlessScrollEnabled = true;
    this._categoryEl.querySelector(".slide-left").classList.remove("hidden");
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

    this._firstVisibleElementIndex += nextShows;

    if (this._currPage === 0) {
      this._firstVisibleElementIndex = 0;
    }

    this._updatePagination();
    const defaultPos = this._itemSize * (this._resultsPerPage + 1) * -1;
    const slideBy = this._itemSize * nextShows;
    this._slide(-slideBy + defaultPos);
  }

  _slideLeft() {
    if (this._showContainerEl.classList.contains("animatable")) return;

    this._showContainerEl.classList.add("animatable");
    let numOfPrevShows;
    let numPages =
      Math.floor(this._data.shows.length / this._resultsPerPage) + 1;

    // If on first page, go to last page
    if (this._currPage === 0) {
      let newIndex = this._data.shows.length - this._resultsPerPage;
      this._currIndex = this._firstVisibleElementIndex = newIndex;
      this._currPage = numPages - 1;

      numOfPrevShows = this._data.shows.slice(
        this._firstVisibleElementIndex,
        this._firstVisibleElementIndex + this._resultsPerPage
      ).length;
    }
    // Else if on second page, going to first
    else if (this._currPage === 1) {
      numOfPrevShows = this._firstVisibleElementIndex;
      this._currIndex = this._firstVisibleElementIndex = 0;
      this._currPage--;
    }
    // On any other page
    else {
      this._firstVisibleElementIndex -= this._resultsPerPage;
      this._data.shows.slice(
        this._firstVisibleElementIndex,
        this._firstVisibleElementIndex + this._resultsPerPage
      ).length;
      this._currPage--;
    }

    this._updatePagination();
    const defaultPos = this._itemSize * (this._resultsPerPage + 1) * -1;
    const slideBy = this._itemSize * numOfPrevShows;
    this._slide(slideBy + defaultPos);
    console.log(this._firstVisibleElementIndex);
  }

  _resetPos() {
    if (this._data.shows.length <= 6) return;

    const defaultPos = this._itemSize * (this._resultsPerPage + 1) * -1;
    this._slide(defaultPos);
  }

  _slide(by) {
    this._categoryEl
      .querySelector(".category-shows")
      .setAttribute("style", `transform: translateX(${by}vw)`);
  }
}
