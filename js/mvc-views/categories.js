import "core-js/stable";
import { View } from "./view";
import { Category } from "./category";

class Categories extends View {
  // An array of category view objects.
  _parentEl = document.querySelector(".categories");
  _categories = [];

  _generateMarkup() {
    this._generateViews();
    return "";
  }

  _generateViews() {
    this._data.categories.forEach((category) => {
      let newCategory = new Category();

      // Set number of results based on this object's data
      newCategory.setResultsPerPage(this._data.numOfResults);
      newCategory.init(category);

      // Add it to the array to keep track of all categories from this object
      this._categories.push(newCategory);
    });
    console.log(this._categories);
  }
}

export default new Categories();
