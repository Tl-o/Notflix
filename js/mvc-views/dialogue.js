'use strict';
import { mark } from 'regenerator-runtime';
import { View } from './view';
import 'core-js/stable';

class Dialogue extends View {
  _parentEl = document.body;
  _overlay;
  _message = [
    `This website is not affiliated with or endorsed by Netflix, Inc. All
  images and content belong to Netflix, TMDB (The Movie Database) API,
  Bootstrap Icons for icons, or their respective owners. The website
  is solely for educational and portfolio purposes.`,
    `By accessing and using this website, you acknowledge and agree to
  this disclaimer. If you are the owner of any content and wish for
  its removal, please contact me for prompt action.`,
  ];

  renderMessage(...message) {
    this._generateDialogue(message.length > 0 ? message : this._message);
    this._overlay = this._parentEl.querySelector('.dialogue-modal-overlay');

    this._bindClose();
    return '';
  }

  _generateDialogue(message) {
    let text = ``;

    message.forEach((msg) => (text += `<p>${msg}</p>`));

    const markup = `
    <div class="dialogue-modal-overlay">
    <div class="dialogue-modal">
      <div class="modal-close">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-x-circle-fill"
          viewBox="0 0 16 16"
        >
          <path
            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"
          />
        </svg>
      </div>
      <div class="dialogue-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          fill="currentColor"
          class="bi bi-lightbulb"
          viewBox="0 0 16 16"
        >
          <path
            d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13a.5.5 0 0 1 0 1 .5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1 0-1 .5.5 0 0 1 0-1 .5.5 0 0 1-.46-.302l-.761-1.77a2 2 0 0 0-.453-.618A5.98 5.98 0 0 1 2 6m6-5a5 5 0 0 0-3.479 8.592c.263.254.514.564.676.941L5.83 12h4.342l.632-1.467c.162-.377.413-.687.676-.941A5 5 0 0 0 8 1"
          />
        </svg>
      </div>
      <div class="dialogue-title">Disclaimer</div>
      <div class="dialogue-info">
        ${text}
      </div>
      <button class="dialogue-button">Got It</button>
    </div>
  </div>`;

    this._parentEl.insertAdjacentHTML('afterbegin', markup);
  }

  _bindClose() {
    this._overlay.addEventListener('click', (e) => {
      const target =
        e.target.closest('.modal-close') ||
        e.target.closest('.dialogue-button');
      if (!target && !e.target.classList.contains('dialogue-modal-overlay'))
        return;

      this._hide();
    });
  }

  _hide() {
    this._overlay.classList.add('fade-out-dialogue');

    this._overlay.addEventListener('animationend', (e) => {
      if (e.target !== this._overlay) return;

      e.target.remove();
    });
  }
}

export default new Dialogue();
