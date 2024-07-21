import 'core-js/stable';
import { View } from './view';
import { Category } from './category';

class Categories extends View {
  // An array of category view objects.
  _parentEl = document.querySelector('.categories');
  _categories = [];
  _defaultQuery = window.matchMedia('(min-width: 1400px)');
  _largeQuery = window.matchMedia(
    '(max-width: 1400px) and (min-width: 1100px)'
  );
  _mediumQuery = window.matchMedia(
    '(max-width: 1100px) and (min-width: 800px)'
  );
  _smallQuery = window.matchMedia('(max-width: 800px) and (min-width: 500px)');
  _tinyQuery = window.matchMedia('(max-width: 500px)');
  _itemSize;
  _numOfResults;

  _generateMarkup() {
    this._generateViews();
    this._bindResponsiveness();
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
