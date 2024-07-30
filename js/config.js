import { showsDatabase } from './placeholderDatabase';

export const MAX_CATEGORIES_PER_PAGE = 14;
export const MAX_SHOWS_PER_CATEGORY = 42;
export const TOP_TEN_INDEX = Math.floor(
  Math.random() * showsDatabase.length - 10
);
