import { createStore } from 'react-hooks-global-state';
import {SET_USER_INFO,REMOVE_USER_INFO} from '../actions/type';

export const { dispatch, useStoreState } = createStore(
  (state, action) => {
    switch (action.type) {
      case SET_USER_INFO:  return {
        ...state,
        userInfo: action.payload,
        isAuth: true,
      };
      case REMOVE_USER_INFO:  return {
        isAuth: false,
      };
      default: return state;
    }
  },
  {
    userInfo:[],
    isAuth: null,
  },
);
