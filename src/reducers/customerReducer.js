import { createStore } from 'react-hooks-global-state';
import {GET_ACTIVE_CUSTOMERS} from "../actions/type";
import _ from 'lodash';

export const { dispatch, useStoreState } = createStore(
  (state, action) => {
    switch (action.type) {
      // case GET_ENTIRE_CUSTOMERS: 
      //   return {
      //     ...state,
      //     entireCustomerList: action.payload
      //   };

      case GET_ACTIVE_CUSTOMERS:  return {
          ...state,
          activeCustomertList: action.payload,
        };

      // case ADD_CUSTOMER:  
      //   return {
      //     ...state,
      //     [action.payload.id]: action.payload
      //   };

      //   case EDIT_CUSTOMER:  
      //   return {
      //     ...state,
      //     [action.payload.id]: action.payload
      //   };

      //   case DELETE_CUSTOMER:
      //     return  _.omit(state, action.payload);
          
        
      default: return state;
    }
  },
  {
    entireCustomerList:[],
    activeCustomerList:[]
  },
);