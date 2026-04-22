import React from 'react';
import ReactDOM, { createRoot } from 'react-dom/client';
import App from './components/App';
import {Provider} from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import rootReducer from './reducers';
// import './styles/index.css';
import thunk from "redux-thunk";
import { ToastContainer, toast } from 'react-toastify';
import * as serviceWorker from './serviceWorker';

//console.log(env);

//import 'react-toastify/dist/ReactToastify.css';
//import { createGlobalState } from 'react-hooks-global-state';
// import "@fortawesome/fontawesome-free/css/all.min.css";
// import "bootstrap-css-only/css/bootstrap.min.css";
// import "mdbreact/dist/css/mdb.css";

const store = createStore(rootReducer, applyMiddleware(thunk));
const root = ReactDOM.createRoot(document.querySelector('#root'));

//const initialState = { cartCount: 0, };
//const { setGlobalState,useGlobalState } = createGlobalState(initialState);

root.render(
    <Provider store={store}>
        
    <App/>
    <ToastContainer />
    </Provider>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();

