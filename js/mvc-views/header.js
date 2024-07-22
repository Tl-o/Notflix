import 'core-js/stable';
import { View } from './view';
import { mark } from 'regenerator-runtime';

class Header extends View {
  _parentEl = document.querySelector('header');
  _userDropdown;
  _browseDropdown;
  // Check time for scroll in millieseconds
  _checkScrollTime = 100;
  _clearTimeoutTime = 500;

  _generateMarkup() {
    this._generateHeader();
    this._userDropdown = this._parentEl.querySelector('.user-options-dropdown');
    this._browseDropdown = this._parentEl.querySelector('.browse-dropdown');
    this._bindScroll();
    this._bindHover();
    return ``;
  }

  _generateHeader() {
    const markup = `
    <div class="main-header">
        <div class="header-block-start">
            <a class="main-logo"> </a>
            <ul class="main-navigation main-navigation-sm">
                <li class="navigation-item"><a href="#">Home</a></li>
                <li class="navigation-item"><a href="#">TV Shows</a></li>
                <li class="navigation-item"><a href="#">Movies</a></li>
                <li class="navigation-item"><a href="#">New & Popular</a></li>
                <li class="navigation-item"><a href="#">My List</a></li>
                <li class="navigation-item"><a href="#">Browse By Languages</a></li>
            </ul>
            <div class="browse">
                <span class="browse-dropdown-title">Browse</span>
                <span class="cadet"></span>
                <div class="browse-dropdown">
                    <span class="dropdown-browse-arrow"></span>
                    <ul>
                        <li class="browse-list-item">Home</li>
                        <li class="browse-list-item">TV Shows</li>
                        <li class="browse-list-item">Movies</li>
                        <li class="browse-list-item">New & Popular</li>
                        <li class="browse-list-item">My List</li>
                        <li class="browse-list-item">Browse By Languages</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="header-block-end">
            <ul class="secondary-navigation">
                <li class="secondary-navigation-item">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    class="bi bi-search icon"
                    viewBox="0 0 16 16"
                >
                    <path
                    d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"
                    />
                </svg>
                </li>
                <li class="secondary-navigation-item">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="bi bi-bell icon"
                    viewBox="0 0 16 16"
                >
                    <path
                    d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"
                    />
                </svg>
                </li>
                <li class="secondary-navigation-item">
                <div class="user-profile">
                    <img
                    class="profile-picture"
                    src="${this._data.currUser.profilePicture}"
                    />
                    <span class="cadet"></span>
                    ${this._generateDropdown()}
                </div>
                </li>
            </ul>
        </div>
    </div>`;
    this._parentEl.insertAdjacentHTML('afterbegin', markup);
  }

  _generateDropdown() {
    let profilesMarkup = '';
    this._data.allUsers.forEach((user) => {
      if (user.username !== this._data.currUser.username)
        profilesMarkup += `
        <li class="dropdown-item">
            <img
            class="profile-picture"
            src="${user.profilePicture}"
            />
            <span class="profile-name">${user.username}</span>
        </li>
        `;
    });

    return `<div class="user-options-dropdown">
        <span class="dropdown-arrow"></span>
        <ul class="dropdown-profile-section">
            ${profilesMarkup}
        </ul>
        <ul class="dropdown-options-section">
        <li class="dropdown-item">
            <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            class="bi bi-pen dropdown-icon"
            viewBox="0 0 16 16"
            >
            <path
                d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"
            />
            </svg>
            <span class="dropdown-text">Manage Profiles</span>
        </li>
        <li class="dropdown-item">
            <svg
            id="profile-transfer"
            width="24"
            height="24"
            class="dropdown-icon"
            viewBox="0 0 24 24"
            fill="none"
            >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M6 1C3.79086 1 2 2.79086 2 5V17C2 19.2091 3.79086 21 6 21H9.58579L8.29289 22.2929L9.70711 23.7071L12.7071 20.7071C13.0976 20.3166 13.0976 19.6834 12.7071 19.2929L9.70711 16.2929L8.29289 17.7071L9.58579 19H6C4.89543 19 4 18.1046 4 17V5C4 3.89543 4.89543 3 6 3H18C19.1046 3 20 3.89543 20 5V17C20 18.1046 19.1046 19 18 19H15V21H18C20.2091 21 22 19.2091 22 17V5C22 2.79086 20.2091 1 18 1H6ZM7.5 10C8.32843 10 9 9.32843 9 8.5C9 7.67157 8.32843 7 7.5 7C6.67157 7 6 7.67157 6 8.5C6 9.32843 6.67157 10 7.5 10ZM18 8.5C18 9.32843 17.3284 10 16.5 10C15.6716 10 15 9.32843 15 8.5C15 7.67157 15.6716 7 16.5 7C17.3284 7 18 7.67157 18 8.5ZM16.402 12.1985C15.7973 12.6498 14.7579 13 13.5 13C12.2421 13 11.2027 12.6498 10.598 12.1985L9.40195 13.8015C10.4298 14.5684 11.9192 15 13.5 15C15.0808 15 16.5702 14.5684 17.598 13.8015L16.402 12.1985Z"
                fill="currentColor"
            ></path>
            </svg>
            <span class="dropdown-text">Transfer Profile</span>
        </li>
        <li class="dropdown-item">
            <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            class="bi bi-pen dropdown-icon"
            viewBox="0 0 16 16"
            >
            <path
                d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"
            />
            </svg>
            <span class="dropdown-text">Account</span>
        </li>
        <li class="dropdown-item">
            <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            class="bi bi-pen dropdown-icon"
            viewBox="0 0 16 16"
            >
            <path d="M8.05 9.6c.336 0 .504-.24.554-.627.04-.534.198-.815.847-1.26.673-.475 1.049-1.09 1.049-1.986 0-1.325-.92-2.227-2.262-2.227-1.02 0-1.792.492-2.1 1.29A1.7 1.7 0 0 0 6 5.48c0 .393.203.64.545.64.272 0 .455-.147.564-.51.158-.592.525-.915 1.074-.915.61 0 1.03.446 1.03 1.084 0 .563-.208.885-.822 1.325-.619.433-.926.914-.926 1.64v.111c0 .428.208.745.585.745"/>
            <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911z"/>
            <path d="M7.001 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0"/>
        </svg>
            </svg>
            <span class="dropdown-text">Help</span>
        </li>
        </ul>
        <ul class="dropdown-signout-section">
        <li><span>Sign Out</span></li>
        </ul>
    </div>
    `;
  }

  _bindScroll() {
    setInterval(() => {
      if (window.scrollY >= 1)
        this._parentEl.querySelector('.main-header')?.classList.add('scroll');
      else
        this._parentEl
          .querySelector('.main-header')
          ?.classList.remove('scroll');
    }, this._checkScrollTime);
  }

  _bindHover() {
    let hideUserDropdown;
    let hideBrowseDropdown;
    let userProfile = this._parentEl.querySelector('.user-profile');
    let browse = this._parentEl.querySelector('.browse');

    userProfile?.addEventListener('mouseenter', () => {
      this._userDropdown.classList.add('show');
      if (hideUserDropdown) clearTimeout(hideUserDropdown);
    });

    browse?.addEventListener('mouseenter', () => {
      this._browseDropdown.classList.add('show');
      if (hideBrowseDropdown) clearTimeout(hideBrowseDropdown);
    });

    userProfile?.addEventListener('mouseleave', () => {
      hideUserDropdown = setTimeout(() => {
        this._userDropdown.classList.remove('show');
      }, this._clearTimeoutTime);
    });

    browse?.addEventListener('mouseleave', () => {
      hideBrowseDropdown = setTimeout(() => {
        this._browseDropdown.classList.remove('show');
      }, this._clearTimeoutTime);
    });
  }
}

export default new Header();
