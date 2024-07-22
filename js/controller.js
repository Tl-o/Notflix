'use strict';
import * as model from './model.js';
import categories from './mvc-views/categories.js';
import header from './mvc-views/header.js';

/* Initalize */
const init = function () {};
console.log(model.state);
console.log(categories);

const controlCategories = function () {
  categories.render(model.state.media);
};

categories.render(model.state.media);
header.render(model.state.users);
