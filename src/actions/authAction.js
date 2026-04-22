import { REMOVE_USER_INFO } from "./type";
import axios from "axios";
import constants from "../constants";

import { dispatch } from '../reducers/authReducer';

export const loginSvc = async (content) => {
  logoutSvc();
  return axios
    .post(constants.MIDDLEWARE_USER_VALIDATE_URL, content, {
      auth: {
        username: constants.MIDDLEWARE_USERNAME,
        password: constants.MIDDLEWARE_PASSWORD,
      },
    });
    

};

export const logoutSvc = () => {
  console.log("logout");
  dispatch({
    payload: null,
    type: REMOVE_USER_INFO,
  });
  localStorage.removeItem('user');
}


