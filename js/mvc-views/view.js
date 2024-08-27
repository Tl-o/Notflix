'use strict';
import 'core-js/stable';
import { mark } from 'regenerator-runtime';

export class View {
  _parentEl;
  _data;
  _errorMessage = 'Some error has occurred. Please try again later.';

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

  renderError(message = this._errorMessage, target = this._parentEl) {
    this.clear();

    const markup = `
    <div class="error-container">
      <div class="error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="error-icon"
          viewBox="0 0 16 16"
        >
          <path
            d="M4.54.146A.5.5 0 0 1 4.893 0h6.214a.5.5 0 0 1 .353.146l4.394 4.394a.5.5 0 0 1 .146.353v6.214a.5.5 0 0 1-.146.353l-4.394 4.394a.5.5 0 0 1-.353.146H4.893a.5.5 0 0 1-.353-.146L.146 11.46A.5.5 0 0 1 0 11.107V4.893a.5.5 0 0 1 .146-.353zM5.1 1 1 5.1v5.8L5.1 15h5.8l4.1-4.1V5.1L10.9 1z"
          />
          <path
            d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"
          />
        </svg>
        <p class="error-message">
          ${message}
        </p>
      </div>
    </div>`;

    target.insertAdjacentHTML('afterbegin', markup);
  }

  clear() {
    this._parentEl.innerHTML = '';
  }
}
