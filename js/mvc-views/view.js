'use strict';
import 'core-js/stable';

export class View {
  _parentEl;
  _data;

  render(data) {
    this._data = data;
    this._parentEl.insertAdjacentHTML('beforeend', this._generateMarkup());
  }

  renderSpinner() {}

  renderError() {}

  clear() {
    this._parentEl.innerHTML = '';
  }
}
