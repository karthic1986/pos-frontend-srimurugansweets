export default class UtilsUtils  {
  // Get Login User Details
  static getUser = () => {
    return JSON.parse(localStorage.getItem("user"));
  };
}

