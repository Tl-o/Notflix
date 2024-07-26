'use strict';
import 'core-js/stable';
import { View } from './view';
import { forEach } from 'core-js/./es/array';

class Profile extends View {
  _parentEl = document.querySelector('.main-container');

  addHandler(handler) {
    this._parentEl.addEventListener('click', function (e) {
      const target = e.target.closest('li');
      if (!target) return;

      const userID = target.dataset.id;
      handler(userID);
    });
  }

  _generateMarkup() {
    return `
    <div class="centered-div">
        <div class="profile-selection-container">
            <h1 class="profile-selection-header">Who's Watching?</h1>
            <div>
                <ul class="profiles-container profile-list">
                    ${this._generateProfiles()}
                </ul>
            </div>
        </div>
        <button aria-label="Manage Profiles" class="manage-profiles-button">
        Manage Profiles
        </button>
    </div>
    `;
  }

  _generateProfiles() {
    let markup = '';
    this._data.forEach((profile) => {
      markup += `
      <li class="profile" data-id="${profile.username}">
        <a class="profile-link">
            <div
            class="profile-picture-selection"
            style="
                background-image: url(${profile.profilePicture});
            "
            ></div>
            <span class="profile-name-selection">${profile.username}</span>
        </a>
      </li>
        `;
    });
    return markup;
  }
}

export default new Profile();
