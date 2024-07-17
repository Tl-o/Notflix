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
        name: "Action",
        shows: [, , , , , , , , , , , , , , ,],
      },
      {
        name: "Anime",
        shows: [, , , , , , , , , , , , , , ,],
      },
      {
        name: "Continue Watching",
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

init();
