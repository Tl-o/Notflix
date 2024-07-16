let itemLength = 15;
let itemsPerPage = 6;
let currPage = 0;

// * Get elements * //

const sliderButtons = document.querySelectorAll(".slide");
console.log(sliderButtons);

const slide = function slideShows() {
  const showList = this.parentNode.querySelector(".category-shows");
  if (!showList) return;

  const direction = Number.parseInt(this.dataset.direction);
  direction === -1 ? ++currPage : --currPage;
  if (currPage < 0) currPage = 0;
  console.log(currPage);
  // Dynamically updates based on the length of a singular item and items per page.
  const slideBy = itemLength * itemsPerPage * currPage * -1;
  console.log(showList.getAttribute("style"));
  showList.setAttribute("style", `transform: translateX(${slideBy}vw)`);
};

sliderButtons.forEach((button) => button.addEventListener("click", slide));
