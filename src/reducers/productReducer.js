import { createStore } from 'react-hooks-global-state';
import {GET_ENTIRE_PRODUCTS,ADD_PRODUCT,EDIT_PRODUCT, DELETE_PRODUCT,GET_ACTIVE_PRODUCTS} from "../actions/type";
import _ from 'lodash';

export const { dispatch, useStoreState } = createStore(
  (state, action) => {
    switch (action.type) {
      case GET_ENTIRE_PRODUCTS: 
        return {
          ...state,
          entireProductList: action.payload
        };

      case GET_ACTIVE_PRODUCTS:  
      return {
          ...state,
          productList: action.payload,
          cartCount:action.payload.filter(obj => obj.qty > 0).length
        };

      case ADD_PRODUCT:  
        return {
          ...state,
          [action.payload.id]: action.payload,
        };

        case EDIT_PRODUCT:  
        return {
          ...state,
          [action.payload.id]: action.payload
        };

        case DELETE_PRODUCT:
          return  _.omit(state, action.payload);
          
        
      default: return state;
    }
  },
  {
    entireProductList:[],
    productList:[],
    cartCount:0
  },
);