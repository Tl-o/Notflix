"use strict";
import * as model from "./model.js";
import categories from "./mvc-views/categories.js";

/* Initalize */
const init = function () {};
console.log(model.state);
console.log(categories);

const controlCategories = function () {
  categories.render(model.state.media);
};

categories.render(model.state.media);
