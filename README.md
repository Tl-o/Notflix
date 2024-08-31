<p align="center">
  <img src="./imgs/misc/NOTFLIX_backdrop.png" alt="Notflix, a front-end recreation of Netflix's UI"/>
</p>

<h1 align="center"><strong>Notflix</strong></h1>

<p align="center">
  <a href="#about"><strong>About</strong></a> • 
  <a href="#features"><strong>Features</strong></a> • 
  <a href="#demo"><strong>Demo</strong></a> • 
  <a href="#technologies"><strong>Technologies</strong></a> • 
  <a href="#learning"><strong>Learning Outcomes</strong></a> • 
  <a href="#installation"><strong>Installation</strong></a> • 
  <a href="#license"><strong>License</strong></a>
</p>

## <a id="about"></a>**About**

I wanted to try building a faithful front-end creation of Netflix's UI within the MVC (Model-View-Controller) using only Vanilla JavaScript, HTML, and CSS (with the added constraint of achieving the layout using **flexbox only**), implementing architectural patterns suitable for an single-page application (SPA). It's a showcase of a responsive and scalable web application.

### **What I Tried To Focus On**

<p align="center">
  <strong>Asynchronous Programming</strong> • 
  <strong>Code Architecture (MVC and Publisher-Subscriber)</strong> • 
  <strong>Dynamic Route Handling</strong> • 
  <strong>Advanced Responsive Design</strong> • 
  <strong>State Management</strong> • 
  <strong>Event Delegation</strong> • 
  <strong>ES6+ Features</strong> • 
  <strong>Animation and Transitions</strong>
</p>

## Features

- **Dynamic Content Browsing**:

  - **Infinite Scrolling**: Allows users to explore a vast library of shows and movies without manual pagination.
  - **Category-Specific Pagination**: Each content category has its own pagination, enabling efficient navigation within categories.

- **Advanced Search Functionality**:

  - **Dynamic Search Results**: Instant results with dynamic updates as users type, based on API responses.
  - **Hover Effects**: Displays rich metadata (genres, ratings, descriptions) on hover for enhanced browsing.
  - **Search Scrolling**: Infinite scrolling within search results for a seamless experience.

- **Billboard Feature**:

  - **Auto-Playing Videos**: Featured billboard with auto-playing videos of trending content.
  - **Video Controls & Dynamic Pausing**: Includes volume control, and pauses/resumes based on user interactions like scrolling and modals.

- **Interactive Modal Views**:

  - **Detailed Title View**: Pages for movies and TV shows where you can check title's details, seasons & episodes (image preview, name, duration, description), recommendations (more like this), trailers & more.
  - **Built-In Browsing**: Built-in browsing through modals based on cast member, creators, production companies, genre, keywords, etc... with navigation history.

- **Responsive Design**: Optimized for all screen sizes with responsive elements for desktops to mobile devices.

- **Performance Optimizations**: Uses lazy loading, debouncing, and optimized rendering for a smooth user experience.

- **Routing and Navigation**:
  - **Client-Side Routing**: Dynamic routing allows navigation between pages (browsing, details, search) without reloads.
  - **URL Management**: Dynamic URL updates reflect the current state, supporting deep linking and bookmarking.

## Demo

A live demo of Notflix can be found [here](your-demo-link).

## Technologies

- ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black&style=for-the-badge)
  **[JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)**: The core scripting language used for logic, data manipulation, and API communication.

- ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white&style=for-the-badge)
  **[HTML5](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)**: The latest version of HTML used to structure the web application, providing semantic elements for better accessibility and SEO.

- ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white&style=for-the-badge)
  **[CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS)**: Used for styling the web application, including layout designs, animations, and responsive behaviors.

- ![Parcel](https://img.shields.io/badge/Parcel-BBC1C4?logo=parcel&logoColor=white&style=for-the-badge)
  **[Parcel](https://parceljs.org/)**: For bundling and optimizing assets.

- ![Babel](https://img.shields.io/badge/Babel-F9DC3E?logo=babel&logoColor=black&style=for-the-badge)
  **[Babel](https://babeljs.io/)**: To transpile modern JavaScript for compatibility across browsers.

## <a id="learning"></a> Learning Outcomes

- **Modern JavaScript & Code Architecture**: Built a scalable, modular application using ES6+ features with MVC and Publisher-Subscriber patterns to manage state and UI interactions effectively.
- **Asynchronous Programming & API Integration**: Utilized `async/await` and Promises for efficient API handling with TMDB, incorporating error handling and optimized data fetching for seamless updates.

- **UI/UX & State Management**: Developed a responsive, interactive interface using CSS and JavaScript media queries, advanced state management with a centralized state object, and performance enhancements like lazy loading and infinite scrolling.

- **Performance Optimization & Event Management**: Implemented lazy loading, debouncing, and event delegation to minimize overhead and enhance responsiveness, particularly for large data sets.

- **Routing & Navigation**: Developed a client-side routing system for dynamic URL management and deep linking, enhancing navigation and user experience.

- **Version Control**: Used Git and GitHub for structured version control, employing branching and collaboration best practices.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/notflix.git
   ```
2. Navigate to the project directory:
   ```bash
   cd notflix
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm start
   ```

## License

This project is licensed under the MIT License.
