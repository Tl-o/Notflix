import { showsDatabase } from './placeholderDatabase';

export const MAX_CATEGORIES_PER_PAGE = 23;
export const MAX_SHOWS_PER_CATEGORY = 42;
export const TOP_TEN_INDEX = Math.floor(
  Math.random() * (showsDatabase.length - 10)
);
export const MATURITY_RATING_MAPPING = {
  'TV-Y': '+3',
  'TV-Y7': '+7',
  'TV-Y7 FV': '+7',
  'TV-G': '+10',
  'TV-PG': '+10',
  'TV-14': '+14',
  'TV-MA': '+18',
  G: 'G',
  PG: 'PG',
  'PG-13': '+13',
  R: 'R',
  'NC-17': '+18',
};
export const MILLISECONDS_IN_SECOND = 1000;
export const IMG_PATH = `https://image.tmdb.org/t/p/original`;
