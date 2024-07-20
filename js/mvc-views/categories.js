import 'core-js/stable';
import { View } from './view';
import { Category } from './category';

class Categories extends View {
  // An array of category view objects.
  _parentEl = document.querySelector('.categories');
  _categories = [];
  _testQuery = window.matchMedia('(min-width: 1400px) and (max-width: 1450px)');
  _defaultQuery = window.matchMedia('(min-width: 1400px)');
  _largeQuery = window.matchMedia(
    '(max-width: 1400px) and (min-width: 1101px)'
  );
  _mediumQuery = window.matchMedia(
    '(max-width: 1100px) and (min-width: 801px)'
  );
  _smallQuery = window.matchMedia('(max-width: 800px)');
  _itemSize = 15;

  _generateMarkup() {
    this._generateViews();
    this._bindResponsiveness();
    return '';
  }

  _generateViews() {
    this._data.categories.forEach((category) => {
      let newCategory = new Category();

      // Set number of results based on this object's data
      newCategory.setResultsPerPage(this._data.numOfResults, this._itemSize);
      newCategory.init(category);

      // Add it to the array to keep track of all categories from this object
      this._categories.push(newCategory);
    });
  }

  _bindResponsiveness() {
    this._testQuery.addEventListener('change', (e) => {
      if (e.matches) console.log('Hi?');
    });

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
  }

  _updateCategories(newItemCount, newItemSize) {
    this._itemSize = newItemSize;
    this._categories.forEach((category) => {
      category.setResultsPerPage(newItemCount, this._itemSize);
      category.updateDom();
    });
  }
}

export default new Categories();
