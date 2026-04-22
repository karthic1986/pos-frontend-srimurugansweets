import { createStore } from 'react-hooks-global-state';
import {CREATE_ORDER} from "../actions/type";


export const { dispatch, useStoreState } = createStore(
  (state, action) => {
    switch (action.type) {
      case CREATE_ORDER:  return {...state, [action.payload.id]:action.payload};
      default: return state;
    }
  },
  {
    IsSuccess: false,
  },
);