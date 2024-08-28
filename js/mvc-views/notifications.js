'use strict';
import { View } from './view';
import 'core-js/stable';
import { MILLISECONDS_IN_SECOND } from '../config';

class Notifications extends View {
  _parentEl = document.querySelector('.errors');

  _notificationTimeout;
  _notificationTimeoutDuration = 5 * MILLISECONDS_IN_SECOND;
  _isBound = false;

  // Icons
  _errIconPath = `<path
  d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"
  />
  <path
  d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"
  />`;

  _infoIconPath = ` <path d="m9.97 4.88.953 3.811C10.159 8.878 9.14 9 8 9s-2.158-.122-2.923-.309L6.03 4.88C6.635 4.957 7.3 5 8 5s1.365-.043 1.97-.12m-.245-.978L8.97.88C8.718-.13 7.282-.13 7.03.88L6.275 3.9C6.8 3.965 7.382 4 8 4s1.2-.036 1.725-.098m4.396 8.613a.5.5 0 0 1 .037.96l-6 2a.5.5 0 0 1-.316 0l-6-2a.5.5 0 0 1 .037-.96l2.391-.598.565-2.257c.862.212 1.964.339 3.165.339s2.303-.127 3.165-.339l.565 2.257z"/>`;

  renderError(message) {
    if (this._notificationTimeout) clearTimeout(this._notificationTimeout);
    this._notificationTimeout = setTimeout(
      this._removeNotification.bind(this),
      this._notificationTimeoutDuration
    );

    this.clear();
    this._generateNotification(message, 'notif-error');
    this._bindClick();
  }

  renderNotification(message) {
    if (this._notificationTimeout) clearTimeout(this._notificationTimeout);
    this._notificationTimeout = setTimeout(
      this._removeNotification.bind(this),
      this._notificationTimeoutDuration
    );

    this.clear();
    this._generateNotification(message, 'notif-info');
    this._bindClick();
  }

  _generateNotification(message, type) {
    this._parentEl.innerHTML = `
    <div class="notification">
        <div class="notification-wrapper ${type}">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="notification-icon"
            viewBox="0 0 16 16"
        >
            ${type === 'notif-error' ? this._errIconPath : this._infoIconPath}
        </svg>
        <p class="error-message">${message}</p>
        </div>
    </div>`;
  }

  _bindClick() {
    if (this._isBound) return;

    this._isBound = true;
    this._parentEl.addEventListener('click', (e) => {
      if (this._errTimeout) clearTimeout(this._errTimeout);
      this._removeNotification();
    });
  }

  _removeNotification() {
    const target = this._parentEl.querySelector('.notification-wrapper');
    if (!target) return;

    target.addEventListener('animationend', function () {
      this.parentElement.remove();
    });

    target.classList.add('notif-remove');
  }
}

export default new Notifications();
