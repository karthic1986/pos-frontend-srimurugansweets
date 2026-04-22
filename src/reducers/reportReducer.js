import { createStore } from 'react-hooks-global-state';
import {GET_REPORT_DELIVERY, GET_REPORT_BY_CUSTOMER, GET_REPORT_BY_PRODUCT, GET_REPORT_BY_DATE} from '../actions/type';

export const { dispatch, useStoreState } = createStore(
  (state, action) => {
    switch (action.type) {

      case GET_REPORT_DELIVERY:  
      return {
        ...state,
        deliveryReport: action.payload,
      };

      case GET_REPORT_BY_CUSTOMER:  
      return {
        ...state,
        customerwiseReport: action.payload,
      };

      case GET_REPORT_BY_PRODUCT:  
      return {
        ...state,
        productwiseReport: action.payload,
      };

      case GET_REPORT_BY_DATE:  
      return {
        ...state,
        datewiseReport: action.payload,
      };


      default: return state;
    }
  },
  {
    deliveryReport:[],
    customerwiseReport:[],
    productwiseReport:[],
    datewiseReport:[]
  },
);
