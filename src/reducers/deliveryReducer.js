import { createStore } from "react-hooks-global-state";
import { GET_ORDER_DETAILS } from "../actions/type";

export const { dispatch, useStoreState } = createStore(
  (state, action) => {
    switch (action.type) {
      case GET_ORDER_DETAILS:
        return {
          ...state,
          orderDetails: action.payload,
          isOrderFromDelivery: action.isOrderFromDelivery,
          isOrderFromEdit: action.isOrderFromEdit,
        };
      default:
        return state;
    }
  },
  {
    orderDetails: [],
    isOrderFromDelivery: false,
    isOrderFromEdit: false,
  }
);
