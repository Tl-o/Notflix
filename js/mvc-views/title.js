'use strict';
import { View } from './view';
import 'core-js/stable';

class Title extends View {
  _parentEl;
  _dataHistory = [];

  _generateMarkup() {
    this._generateSkeleton();
  }

  updateData(data) {
    if (this._data) {
      this._dataHistory.push(this._data);
      this._data = data;
    } else this._data = data;
  }
}

export default new Title();
