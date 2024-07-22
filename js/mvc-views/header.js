import 'core-js/stable';
import { View } from './view';

class Header extends View {
  _parentEl = document.querySelector('.categories');

  _generateMarkup() {
    this._bindScroll();
    return '';
  }
}

export default new Header();
