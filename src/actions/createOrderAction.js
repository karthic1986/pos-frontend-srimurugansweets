import {CREATE_ORDER} from "./type";
import history from "../history";
import axios from "axios";
import constants from "../constants";




export const createOrderSvc = (content) =>{
   return axios.post(constants.MIDDLEWARE_CREATE_ORDER,content, {
    auth: {
      username: constants.MIDDLEWARE_USERNAME,
      password: constants.MIDDLEWARE_PASSWORD,
    },
  });

};
  
  