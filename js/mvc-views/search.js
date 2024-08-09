import { View } from './view';
import 'core-js/stable';

class Search extends View {
  _parentEl;

  _generateMarkup() {}
}

export default new Search();

/* How search is going to work :

Each result is a 9:16 poster, aligned using flex, that are X viewport width size. (Responsiveness this time is tied to CSS only). Behind it is an
absolutely positioned container with metadata, that on hover, is going to activate a CSS animation and change the Z-index of the whole element to be bigger.

When you search, they are rendered one by one with an animation delay. One function to generate shows, another to generate infinite scrolling
observer if totalResults is bigger than shows limit.

Only render the homepage when the user has written nothing, or when they click the X. As they're typing, if they stop for x milliseconds, search.

That's it, probably.
*/
