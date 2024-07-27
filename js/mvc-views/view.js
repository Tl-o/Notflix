'use strict';
import 'core-js/stable';
import { mark } from 'regenerator-runtime';

export class View {
  _parentEl;
  _data;

  render(data) {
    this._data = data;
    this._parentEl.insertAdjacentHTML('beforeend', this._generateMarkup());
  }

  renderSpinner(profile = false) {
    this.clear();
    const markup = `
    <div class="spinner-container">
      <div class="spinner"></div>
      ${
        profile
          ? `
      <img
          class="spinner-profile-picture"
          src="${this._data.currUser.profilePicture}"
          />
      `
          : ''
      }   
    </div>
    `;
    this._parentEl.insertAdjacentHTML('afterbegin', markup);
  }

  renderError() {}

  clear() {
    this._parentEl.innerHTML = '';
  }
}
