import axios from "axios";
import constants from "../constants";
import { GET_ORDER_DETAILS } from "./type";
import { dispatch } from "../reducers/deliveryReducer";

export const getSearchResultSvc = async (searchTerm) => {
    let url = constants.MIDDLEWARE_GET_SEARCH_RESULT_URL;
    url = url.replace("{{searchTerm}}",searchTerm);
    return await axios.get(url, {
      auth: {
        username: constants.MIDDLEWARE_USERNAME,
        password: constants.MIDDLEWARE_PASSWORD,
      },
    });
};

export const getOrderDetailsSvc = async (orderID) => {
    let url = constants.MIDDLEWARE_GET_ORDER_DETAILS_URL;
    url = url.replace("{{orderID}}",orderID);
    return await axios.get(url, {
      auth: {
        username: constants.MIDDLEWARE_USERNAME,
        password: constants.MIDDLEWARE_PASSWORD,
      },
    })
    // .then((res) => {
    //   dispatch({
    //     payload: res.data,
    //     type: GET_ORDER_DETAILS,
    //   });
    // })
    // .catch((error) => {
    //   console.log(error);
    //   CustomToast("error","Failed to Load Order details. Please try again..");
    // });

  };