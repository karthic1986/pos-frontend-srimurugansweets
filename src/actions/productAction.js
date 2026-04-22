import {GET_ENTIRE_PRODUCTS,GET_ACTIVE_PRODUCTS, ADD_PRODUCT, EDIT_PRODUCT, DELETE_PRODUCT} from "./type";
import axios from "axios";
import constants from "../constants";
import { dispatch } from '../reducers/productReducer';



export const getEntireProductsSvc = async () =>{
  return await axios.get(constants.MIDDLEWARE_PRODUCTS_URL, {
    auth: {
      username: constants.MIDDLEWARE_USERNAME,
      password: constants.MIDDLEWARE_PASSWORD,
    },
  });
};


export const getActiveProductsSvc = () =>{
  axios.get(constants.MIDDLEWARE_GET_ACTIVE_PRODUCTS_URL, {
   auth: {
     username: constants.MIDDLEWARE_USERNAME,
     password: constants.MIDDLEWARE_PASSWORD,
   },
 }).then((res) => {

  res.data.forEach(element => {
    element.qty=0;
    element.total=0;
  });

   dispatch({
     payload: res.data,
     type: GET_ACTIVE_PRODUCTS,
   });
 })
 .catch((error) => {
   console.log(error);
   CustomToast("error","Failed to Loading product List. Please try again..");
 });

};
 

  
export const addProductSvc = async (content) =>{
  return await axios.post(constants.MIDDLEWARE_PRODUCTS_URL,content, {
   auth: {
     username: constants.MIDDLEWARE_USERNAME,
     password: constants.MIDDLEWARE_PASSWORD,
   },
  });
};


export const editProductSvc = async (id,content) =>{
  return await axios.put(constants.MIDDLEWARE_PRODUCTS_URL+`${id}`,content, {
   auth: {
     username: constants.MIDDLEWARE_USERNAME,
     password: constants.MIDDLEWARE_PASSWORD,
   },
 });
};
  
export const deleteProductSvc = async (id) =>{
return await axios.delete(constants.MIDDLEWARE_PRODUCTS_URL+`${id}`, {
   auth: {
     username: constants.MIDDLEWARE_USERNAME,
     password: constants.MIDDLEWARE_PASSWORD,
   },
 });

};