import axios from "axios";
import constants from "../constants";

export const getEntireCategoriesSvc = async () => {
  return await axios.get(constants.MIDDLEWARE_CATEGORIES_URL, {
    auth: {
      username: constants.MIDDLEWARE_USERNAME,
      password: constants.MIDDLEWARE_PASSWORD,
    },
  });
};

export const addCategorySvc = async (content) => {
  return await axios.post(constants.MIDDLEWARE_CATEGORIES_URL, content, {
    auth: {
      username: constants.MIDDLEWARE_USERNAME,
      password: constants.MIDDLEWARE_PASSWORD,
    },
  });
};

export const editCategorySvc = async (id, content) => {
  return await axios.put(constants.MIDDLEWARE_CATEGORIES_URL + `${id}`, content, {
    auth: {
      username: constants.MIDDLEWARE_USERNAME,
      password: constants.MIDDLEWARE_PASSWORD,
    },
  });
};

export const deleteCategorySvc = async (id) => {
  return await axios.delete(constants.MIDDLEWARE_CATEGORIES_URL + `${id}`, {
    auth: {
      username: constants.MIDDLEWARE_USERNAME,
      password: constants.MIDDLEWARE_PASSWORD,
    },
  });
};
