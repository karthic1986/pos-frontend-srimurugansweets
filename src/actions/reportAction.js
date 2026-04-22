import { GET_REPORT_DELIVERY, GET_REPORT_BY_CUSTOMER, GET_REPORT_BY_PRODUCT, GET_REPORT_BY_DATE } from "./type";
import axios from "axios";
import constants from "../constants";
import { format } from "date-fns";

export const deliveryReport = async (content) => {
  let url = constants.MIDDLEWARE_GET_DELIVERY_REPORT_URL;
  url = url.replace("{{fDate}}", format(content.fromDate, "yyyy-MM-dd"));
  url = url.replace("{{tDate}}", format(content.toDate, "yyyy-MM-dd"));

  return await axios.get(url, {
    auth: {
      username: constants.MIDDLEWARE_USERNAME,
      password: constants.MIDDLEWARE_PASSWORD,
    },
  });
};

export const nondeliveryReport = async (content) => {
  let url = constants.MIDDLEWARE_GET_NON_DELIVERY_REPORT_URL;
  url = url.replace("{{fDate}}", format(content.fromDate, "yyyy-MM-dd"));
  url = url.replace("{{tDate}}", format(content.toDate, "yyyy-MM-dd"));

  return await axios.get(url, {
    auth: {
      username: constants.MIDDLEWARE_USERNAME,
      password: constants.MIDDLEWARE_PASSWORD,
    },
  });
};

export const reportByCustomer = async (content) => {
  let url = constants.MIDDLEWARE_GET_REPORT_BY_CUSTOMER_URL;
  url = url.replace("{{fDate}}", format(content.fromDate, "yyyy-MM-dd"));
  url = url.replace("{{tDate}}", format(content.toDate, "yyyy-MM-dd"));

  return await axios.get(url, {
    auth: {
      username: constants.MIDDLEWARE_USERNAME,
      password: constants.MIDDLEWARE_PASSWORD,
    },
  });
};

export const reportByProducts = async (content) => {
  let url = constants.MIDDLEWARE_GET_REPORT_BY_PRODUCT_URL;
  url = url.replace("{{fDate}}", format(content.fromDate, "yyyy-MM-dd"));
  url = url.replace("{{tDate}}", format(content.toDate, "yyyy-MM-dd"));

  return await axios.get(url, {
    auth: {
      username: constants.MIDDLEWARE_USERNAME,
      password: constants.MIDDLEWARE_PASSWORD,
    },
  });
};

export const reportByDatewise = async (content) => {
  let url = constants.MIDDLEWARE_GET_REPORT_BY_DATE_URL;
  url = url.replace("{{fDate}}", format(content.fromDate, "yyyy-MM-dd"));
  url = url.replace("{{tDate}}", format(content.toDate, "yyyy-MM-dd"));

  return await axios.get(url, {
    auth: {
      username: constants.MIDDLEWARE_USERNAME,
      password: constants.MIDDLEWARE_PASSWORD,
    },
  });
};

// export const reportByDatewise = (content) => {
//   let url = constants.MIDDLEWARE_GET_REPORT_BY_DATE_URL;
//   url = url.replace("{{fDate}}",format(content.fromDate,'yyyy-MM-dd'));
//   url = url.replace("{{tDate}}",format(content.toDate,'yyyy-MM-dd'));

//   axios
//     .get(url,  {
//       auth: {
//         username: constants.MIDDLEWARE_USERNAME,
//         password: constants.MIDDLEWARE_PASSWORD,
//       },
//     })
//     .then((res) => {
//       dispatch({
//         payload: res.data,
//         type: GET_REPORT_BY_DATE,
//       });
//     })
//     .catch((error) => {
//       console.log(error);
//       CustomToast(
//         "error",
//         "Failed to load. Please try again.."
//       );
//     });

// };
