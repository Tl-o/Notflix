'use strict';
import 'core-js/stable';
import { View } from './view';
import { MILLISECONDS_IN_SECOND } from '../config.js';

class Billboard extends View {
  // Data
  _parentEl = document.querySelector('.billboard');
  _poster;
  _trailer;
  _trailerControls;
  // This checks if the player has already started
  _hasActivated = false;
  _playTimeout;

  _isPlaying = false;
  // In seconds
  _playFor = 30;
  _playAfter = 100000000000 * MILLISECONDS_IN_SECOND;
  _stopTimeout;

  // Intersection Observer
  _observerOptions = {
    root: null,
    threshold: 0.4,
  };
  _observer;

  // Icons
  _soundOnIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-volume-up billboard-icon" viewBox="0 0 16 16">
  <path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z"/>
  <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z"/>
  <path d="M10.025 8a4.5 4.5 0 0 1-1.318 3.182L8 10.475A3.5 3.5 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.5 4.5 0 0 1 10.025 8M7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12zM4.312 6.39 6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11"/>
</svg>`;
  _soundOffIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-volume-mute billboard-icon" viewBox="0 0 16 16">
    <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06M6 5.04 4.312 6.39A.5.5 0 0 1 4 6.5H2v3h2a.5.5 0 0 1 .312.11L6 10.96zm7.854.606a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0"/>
  </svg>`;
  _replayIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise billboard-icon" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
  <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
</svg>`;

  clear() {
    // Reset video position because videos are not being brought in by APIs.
    if (this._trailer) {
      this._isPlaying = false;
      this._observer.unobserve(this._trailer);
      clearTimeout(this._stopTimeout);
      this._trailer.pause();
      this._trailer.currentTime = 0;
      this._trailer.classList.add('opaque');
      document
        .querySelector('body')
        .insertAdjacentElement('afterbegin', this._trailer);
    }
    this._parentEl.innerHTML = '';
  }

  // Only used when rendering modal
  pause() {
    if (!this._trailer) return;

    this._trailer.pause();
  }

  resume() {
    if (!this._trailer || !this._hasActivated) return;

    const rect = this._trailer.getBoundingClientRect();
    // A third of the trailer's size
    const topLimit = rect.height * 0.6 * -1;
    const bottomLimit =
      window.innerHeight || document.documentElement.clientHeight;

    if (rect.top >= topLimit && rect.bottom <= bottomLimit)
      this._trailer.play();
  }

  _generateMarkup() {
    this._parentEl.classList.remove('hidden');
    this._generateBillboard();
    this._generateTrailer();
    this._poster = this._parentEl.querySelector('.billboard-img');
    this._trailer = this._parentEl.querySelector('.billboard-video');
    this._trailer.volume = 0;
    this._trailerControls = this._parentEl.querySelector('.billboard-sound');
    this._bindObserver();
    this._trailerControls.addEventListener(
      'click',
      this._controlSound.bind(this)
    );

    // Billboard timeout is set using intersection observer.
    return '';
  }

  _generateBillboard() {
    const markup = `
    <div class="billboard-container">
    <div class="billboard-metadata">
        <img
        class="billboard-logo"
        src="${this._data.logo}"
        alt="${this._data.logoAlt}"
        />
        <div class="billboard-promotion">
        <svg viewBox="0 0 28 30" class="billboard-icon">
            <rect x="0" width="28" height="30" rx="3" fill="#e50914"></rect>
            <path
            d="M16.8211527,22.1690594 C17.4133103,22.1690594 17.8777709,21.8857503 18.2145345,21.3197261 C18.5512982,20.7531079 18.719977,19.9572291 18.719977,18.9309018 C18.719977,17.9045745 18.5512982,17.1081018 18.2145345,16.5414836 C17.8777709,15.9754594 17.4133103,15.6921503 16.8211527,15.6921503 C16.2289952,15.6921503 15.7645345,15.9754594 15.427177,16.5414836 C15.0904133,17.1081018 14.9223285,17.9045745 14.9223285,18.9309018 C14.9223285,19.9572291 15.0904133,20.7531079 15.427177,21.3197261 C15.7645345,21.8857503 16.2289952,22.1690594 16.8211527,22.1690594 M16.8211527,24.0708533 C15.9872618,24.0708533 15.2579042,23.8605988 14.6324861,23.4406836 C14.0076618,23.0207685 13.5247891,22.4262352 13.1856497,21.6564897 C12.8465103,20.8867442 12.6766436,19.9786109 12.6766436,18.9309018 C12.6766436,17.8921018 12.8465103,16.9857503 13.1856497,16.2118473 C13.5247891,15.4379442 14.0076618,14.8410352 14.6324861,14.4205261 C15.2579042,14.0006109 15.9872618,13.7903564 16.8211527,13.7903564 C17.6544497,13.7903564 18.3844012,14.0006109 19.0098194,14.4205261 C19.6352376,14.8410352 20.1169224,15.4379442 20.4566558,16.2118473 C20.7952012,16.9857503 20.9656618,17.8921018 20.9656618,18.9309018 C20.9656618,19.9786109 20.7952012,20.8867442 20.4566558,21.6564897 C20.1169224,22.4262352 19.6352376,23.0207685 19.0098194,23.4406836 C18.3844012,23.8605988 17.6544497,24.0708533 16.8211527,24.0708533"
            fill="#FFFFFF"
            ></path>
            <polygon
            fill="#FFFFFF"
            points="8.86676 23.9094206 8.86676 16.6651418 6.88122061 17.1783055 6.88122061 14.9266812 11.0750267 13.8558085 11.0750267 23.9094206"
            ></polygon>
            <path
            d="M20.0388194,9.42258545 L20.8085648,9.42258545 C21.1886861,9.42258545 21.4642739,9.34834303 21.6353285,9.19926424 C21.806383,9.05077939 21.8919103,8.83993091 21.8919103,8.56731273 C21.8919103,8.30122788 21.806383,8.09572485 21.6353285,7.94961576 C21.4642739,7.80410061 21.1886861,7.73104606 20.8085648,7.73104606 L20.0388194,7.73104606 L20.0388194,9.42258545 Z M18.2332436,12.8341733 L18.2332436,6.22006424 L21.0936558,6.22006424 C21.6323588,6.22006424 22.0974133,6.31806424 22.4906012,6.51465818 C22.8831952,6.71125212 23.1872921,6.98684 23.4028921,7.34142182 C23.6178982,7.69659758 23.7259952,8.10522788 23.7259952,8.56731273 C23.7259952,9.04246424 23.6178982,9.45762788 23.4028921,9.8122097 C23.1872921,10.1667915 22.8831952,10.4429733 22.4906012,10.6389733 C22.0974133,10.8355673 21.6323588,10.9335673 21.0936558,10.9335673 L20.0388194,10.9335673 L20.0388194,12.8341733 L18.2332436,12.8341733 Z"
            fill="#FFFFFF"
            ></path>
            <path
            d="M14.0706788,11.3992752 C14.3937818,11.3992752 14.6770909,11.322063 14.9212,11.1664509 C15.1653091,11.0114327 15.3553697,10.792863 15.4913818,10.5107418 C15.6279879,10.2286206 15.695697,9.90136 15.695697,9.52717818 C15.695697,9.1535903 15.6279879,8.82573576 15.4913818,8.54361455 C15.3553697,8.26149333 15.1653091,8.04351758 14.9212,7.88790545 C14.6770909,7.73288727 14.3937818,7.65508121 14.0706788,7.65508121 C13.7475758,7.65508121 13.4642667,7.73288727 13.2201576,7.88790545 C12.9760485,8.04351758 12.7859879,8.26149333 12.6499758,8.54361455 C12.5139636,8.82573576 12.4456606,9.1535903 12.4456606,9.52717818 C12.4456606,9.90136 12.5139636,10.2286206 12.6499758,10.5107418 C12.7859879,10.792863 12.9760485,11.0114327 13.2201576,11.1664509 C13.4642667,11.322063 13.7475758,11.3992752 14.0706788,11.3992752 M14.0706788,12.9957842 C13.5634545,12.9957842 13.0995879,12.9090691 12.6784848,12.7344509 C12.2573818,12.5604267 11.8915152,12.3163176 11.5808848,12.0027176 C11.2708485,11.6891176 11.0314909,11.322063 10.8634061,10.9003661 C10.6953212,10.479263 10.6115758,10.0213358 10.6115758,9.52717818 C10.6115758,9.03302061 10.6953212,8.57568727 10.8634061,8.1539903 C11.0314909,7.73288727 11.2708485,7.36523879 11.5808848,7.05163879 C11.8915152,6.73803879 12.2573818,6.49452364 12.6784848,6.31990545 C13.0995879,6.14588121 13.5634545,6.05857212 14.0706788,6.05857212 C14.577903,6.05857212 15.0417697,6.14588121 15.4628727,6.31990545 C15.8839758,6.49452364 16.2498424,6.73803879 16.5604727,7.05163879 C16.871103,7.36523879 17.1098667,7.73288727 17.2779515,8.1539903 C17.4460364,8.57568727 17.5297818,9.03302061 17.5297818,9.52717818 C17.5297818,10.0213358 17.4460364,10.479263 17.2779515,10.9003661 C17.1098667,11.322063 16.871103,11.6891176 16.5604727,12.0027176 C16.2498424,12.3163176 15.8839758,12.5604267 15.4628727,12.7344509 C15.0417697,12.9090691 14.577903,12.9957842 14.0706788,12.9957842"
            fill="#FFFFFF"
            ></path>
            <polygon
            fill="#FFFFFF"
            points="8.4639503 12.8342327 6.65837455 13.2666206 6.65837455 7.77862061 4.65323515 7.77862061 4.65323515 6.22012364 10.4690897 6.22012364 10.4690897 7.77862061 8.4639503 7.77862061"
            ></polygon>
        </svg>
        <span class="billboard-promotion-text">#${this._data.rank} in ${this._data.type}s Today</span>
        </div>
        <p class="billboard-description">
        ${this._data.description}
        </p>
        <div class="billboard-buttons">
        <button class="billboard-play">
            <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-play-fill billboard-icon"
            viewBox="0 0 16 16"
            >
            <path
                d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"
            />
            </svg>
            Play
        </button>
        <button class="billboard-info">
            <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            fill="currentColor"
            class="bi bi-play-fill billboard-icon"
            viewBox="0 0 16 16"
            >
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
        </svg>
            </svg>
            More Info
        </button>
        </div>
    </div>
    <div class="billboard-controls">
        <button class="billboard-sound">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-volume-up billboard-icon" viewBox="0 0 16 16">
            <path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z"/>
            <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z"/>
            <path d="M10.025 8a4.5 4.5 0 0 1-1.318 3.182L8 10.475A3.5 3.5 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.5 4.5 0 0 1 10.025 8M7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12zM4.312 6.39 6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11"/>
        </svg>
        </button>
        <div class="billboard-age-rating">
        +18
        </div>
    </div>
    <div class="billboard-backdrop">
        <img class="billboard-img" src="${this._data.poster}" alt="${this._data.posterAlt}">
        <div class="billboard-fadeout"></div>
    </div>
    </div>
    `;
    this._parentEl.insertAdjacentHTML('afterbegin', markup);
  }

  _generateTrailer() {
    // Find video
    const video = [...document.querySelectorAll('video')].find(
      (video) => video.getAttribute('id') === this._data.trailer
    );

    this._parentEl
      .querySelector('.billboard-backdrop')
      .insertAdjacentElement('beforeend', video);
  }

  _bindObserver() {
    this._observer = new IntersectionObserver(
      this._controlTrailer.bind(this),
      this._observerOptions
    );
    this._observer.observe(this._trailer);
  }

  // Function to be passed into intersection observer
  _controlTrailer(entries) {
    const lowerVolume = () => {
      if (this._trailer.volume > 0.1) {
        this._trailer.volume -= 0.025;
        setTimeout(lowerVolume, 25);
        return;
      }
      this._trailer.pause();
    };

    const raiseVolume = () => {
      // Safe check to see if user muted the trailer
      if (this._trailer.volume < 1 && this._trailer.volume !== 0) {
        this._trailer.volume += 0.025;
        setTimeout(raiseVolume, 25);
        return;
      }
    };

    entries.forEach((entry) => {
      if (entry.isIntersecting && !this._hasActivated) {
        // To account for user scrolling down too fast before it plays and then going back up.
        this._playTimeout = setTimeout(
          this._playTrailer.bind(this),
          this._playAfter
        );
        return;
      } else if (!entry.isIntersecting && !this._hasActivated) {
        // If user scrolled too fast before it played, clear the timeout.
        clearTimeout(this._playTimeout);
        return;
      }

      if (entry.isIntersecting && this._isPlaying) {
        this._trailer.play();
        raiseVolume();
      } else if (this._isPlaying) {
        lowerVolume();
      }
    });
  }

  _playTrailer() {
    // When restarting, check for previous user preference and set icon to show it.
    if (this._trailer.volume > 0) {
      this._trailer.volume = 1;
      this._trailerControls.innerHTML = this._soundOnIcon;
    } else {
      this._trailerControls.innerHTML = this._soundOffIcon;
    }

    this._trailer.currentTime = 0;
    this._hasActivated = true;
    this._isPlaying = true;

    this._hideMetadata();
    this._poster.classList.add('opaque');
    this._trailer.classList.remove('opaque');
    this._trailer.play();
    this._stopTimeout = setTimeout(this._stopTrailer.bind(this), 1000);
  }

  _stopTrailer() {
    if (this._trailer.currentTime <= this._playFor) {
      this._stopTimeout = setTimeout(this._stopTrailer.bind(this), 1000);
      return;
    }
    // Fade out volume
    if (this._trailer.volume > 0.1) {
      this._trailer.volume -= 0.025;
      setTimeout(this._stopTrailer.bind(this), 75);
      return;
    }

    this._trailerControls.innerHTML = this._replayIcon;
    this._isPlaying = false;
    this._hideMetadata();
    this._trailer.pause();
    this._poster.classList.remove('opaque');
    this._trailer.classList.add('opaque');
  }

  _hideMetadata() {
    if (this._isPlaying)
      this._parentEl
        .querySelector('.billboard-metadata')
        .classList.add('active');
    else
      this._parentEl
        .querySelector('.billboard-metadata')
        .classList.remove('active');
  }

  _controlSound() {
    if (this._isPlaying) {
      // Mute / Unmute
      this._trailerControls.innerHTML =
        this._trailer.volume > 0 ? this._soundOffIcon : this._soundOnIcon;
      this._trailer.volume = this._trailer.volume > 0 ? 0 : 1;
      return;
    }

    this._playTrailer();
  }
}

export default new Billboard();
