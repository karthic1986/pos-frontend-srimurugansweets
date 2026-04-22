import {
  GET_ACTIVE_CUSTOMERS,
} from "./type";
import axios from "axios";
import constants from "../constants";
import { dispatch } from "../reducers/customerReducer";
import CustomToast from "../components/CustomToast";

export const getEntireCustomersSvc = async () => {
  return await axios.get(constants.MIDDLEWARE_CUSTOMERS_URL, {
    auth: {
      username: constants.MIDDLEWARE_USERNAME,
      password: constants.MIDDLEWARE_PASSWORD,
    },
  });

  // .then((res) => {
  //   dispatch({
  //     payload: res.data,
  //     type: GET_ENTIRE_CUSTOMERS,
  //   });
  // })
  // .catch((error) => {
  //   console.log(error);
  //   toast.error("Failed to Load entire customer List. Please try again..");
  // });
};

export const getActiveCustomersSvc = () => {
  axios
    .get(constants.MIDDLEWARE_GET_ACTIVE_CUSTOMERS_URL, {
      auth: {
        username: constants.MIDDLEWARE_USERNAME,
        password: constants.MIDDLEWARE_PASSWORD,
      },
    })
    .then((res) => {
      dispatch({
        payload: res.data,
        type: GET_ACTIVE_CUSTOMERS,
      });
    })
    .catch((error) => {
      console.log(error);
      CustomToast("error","Failed to Loading customer List. Please try again..");
    });
};

export const addCustomerSvc = async (content) => {
  return await axios.post(constants.MIDDLEWARE_CUSTOMERS_URL, content, {
    auth: {
      username: constants.MIDDLEWARE_USERNAME,
      password: constants.MIDDLEWARE_PASSWORD,
    },
  });
};

export const editCustomerSvc = async (id, content) => {
  return await axios.put(
    constants.MIDDLEWARE_CUSTOMERS_URL + `${id}`,
    content,
    {
      auth: {
        username: constants.MIDDLEWARE_USERNAME,
        password: constants.MIDDLEWARE_PASSWORD,
      },
    }
  );
  //  }).then((res) => {
  //    dispatch({
  //      payload: res.data,
  //      type: EDIT_CUSTOMER,
  //    });
  //    toast.success("Updated Successfully");
  //  })
  //  .catch((error) => {
  //    console.log(error);
  //    toast.error("Failed to update customer. Please try again..");
  //  });
};

export const deleteCustomerSvc = async (id) => {
  return await axios
    .delete(constants.MIDDLEWARE_CUSTOMERS_URL + `${id}`, {
      auth: {
        username: constants.MIDDLEWARE_USERNAME,
        password: constants.MIDDLEWARE_PASSWORD,
      },
    });
    // .then(() => {
    //   dispatch({
    //     payload: id,
    //     type: DELETE_CUSTOMER,
    //   });
    //   toast.success("Deleted Successfully");
    // })
    // .catch((error) => {
    //   console.log(error);
    //   toast.error("Failed to delete customer. Please try again..");
    // });
};
