import axios from "axios";
import constants from "../constants";

export const last7daysSales = async () => {
  let url = constants.MIDDLEWARE_GET_LAST_DAYS_SALES_URL;
  return await axios
    .get(url,  {
      auth: {
        username: constants.MIDDLEWARE_USERNAME,
        password: constants.MIDDLEWARE_PASSWORD,
      },
    })
};

