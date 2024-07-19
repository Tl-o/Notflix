import { CreateUser } from "./helper.js";

// State object holds all data relevant to the current state of the application
let results_per_page = 6;

export const state = {
  users: {
    currUser: {},
    allUsers: [],
  },
  billboard: {},
  media: {
    // An array of objects where each object is a category.
    categories: [
      {
        name: "Continue Watching",
        shows: [
          {
            name: "Breaking Bad",
            thumbnail:
              "https://occ-0-55-56.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABW5zXYyBPcIUk2lLreaVm-PtlIEg7GSR-dmTAMOW0DHVJ-3K2gnh6Iw61UZ5qe0qW6I0veiAMDaKoxKLeufBEqt6T6Kq8o_h8uc.webp?r=c64",
            genres: [],
          },
          {
            name: "Dark",
            thumbnail:
              "https://occ-0-55-56.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABb7T3Rg8T5TD9STxLqhG7oNnTymOI1rEsroMbJSIBjhDXU8pcwTbhKv4C4b0lkGGX0rzec9V9IwgqWx7SvO-IJMsIgMjN190ArUs2xl0wuEDhKmCoRiUkt9o8RfKOnGQUZeV.jpg?r=a13",
            genres: [],
          },
          {
            name: "Killing Eve",
            thumbnail:
              "https://occ-0-55-56.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABa18volSaSYCkCzZF5K3zRlQK-qLXTL2WmSzrSDxuah5Njpx5k2Rlq5I_XmoPMRz0pMujqLzpx4XhxRkCjN_7ycpvxtUU1JbJGg.webp?r=35c",
            genres: [],
          },
          {
            name: "Neon Genesis Evangelion",
            thumbnail:
              "https://occ-0-55-56.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABUoN0iVheKvLhd3KVLwGoPn9VMqvTf46BsEweQb2ZXF4UsLu7PRUVvMfpRVNKdOGOPVvdeuyz9e-yZ_jXjG5JlfDLdRVkoB3EgE.webp?r=c4d",
            genres: [],
          },
          {
            name: "Better Call Saul",
            thumbnail:
              "https://occ-0-55-56.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABfq-5DS3q-SPZNROrCAzWTk9hAQvwv8p2pyc1fGsqI46PEGN7Tjn18Ag6uZk7N-q05TqjTlZo526hFwiFRlpNErxP_KyiBqX8VI.webp?r=e18",
            genres: [],
          },
          {
            name: "BoJack Horseman",
            thumbnail:
              "https://occ-0-55-56.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABaPXz7v2NuyiSemal6D36nkcyn9nORgB7bOfyWtUz1lUQgUExwnWYbGRFeACqn5vjUibRnuZGI4MKcdUetzZrlQPizurNnbkWLA1-hmz2CyXsE23F4x1melfVNXp5lzUoKSp.jpg?r=37e",
            genres: [],
          },
          {
            name: "Arcane",
            thumbnail:
              "https://occ-0-55-56.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABZ6DhpKEIXgIl-nZHrtKRs0td6a1zrdHO9aF-e-dYRma_UCa49cC9ESzumA4ZioMkxi8w1bkmtrzXfH1rNYcGBqLUmOXwdveNwUnqlFVDwjV7DxZwRqIK2G8fP7atHcmUFeI.jpg?r=e88",
            genres: [],
          },
        ],
      },
      {
        name: "Action",
        shows: [, , , , , , , , , , , , , , ,],
      },
      {
        name: "Anime",
        shows: [, , , , , , , , , , , , , , ,],
      },
      {
        name: "Small",
        shows: [, , , , , , ,],
      },
    ],
    // Num of results per page for EACH category, to ensure responsiveness.
    numOfResults: results_per_page,
  },
  search: {
    query: "",
    result: "",
  },
};

// Initalize all users, later should recreate from actual data
const init = function initalizeModel() {
  const rosa = new CreateUser(
    "Rosa Ushiromiya",
    "../../imgs/profile_pics/rosapfp.png",
    "",
    ""
  );

  state.allUsers = [rosa];
};

const showAnatomy = {
  name: "Show_Name",
  thumbnail: "",
  genres: [],
};

init();
