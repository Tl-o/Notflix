import { CreateUser } from "./helper.js";

// State object holds all data relevant to the current state of the application
let results_per_page = 6;

export const state = {
  users: {
    currUser: {},
    allUsers: [],
  },
  billboard: {},
  shows: {
    query: "",
    categories: [],
    results: results_per_page,
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
