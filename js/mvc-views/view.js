class View {
  _parentEl;
  _data;

  render(data) {
    this._data = data;
    this._generateMarkup();
  }
}
