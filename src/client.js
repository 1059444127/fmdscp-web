require("babel-polyfill");
import React from 'react';
import { render } from 'react-dom';
import StatusList from './StatusList';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import io from 'socket.io-client';
import rootReducer from './statuslistreducer';


const initialState = window.__INITIAL_STATE__;

let store = createStore(rootReducer, initialState, window.devToolsExtension && window.devToolsExtension());

const socket = io(`${location.protocol}//${location.host}`);
socket.on('updateoutsessionitem', data =>
  store.dispatch({type: 'UPDATE_OUTSESSIONITEM', item: data})
);

socket.on('setoutsessions', data =>
  store.dispatch({type: 'SET_OUTSESSIONS', statuslist: data})
);

// tell the server we are a front end
socket.on('connect', () =>
  socket.emit('front_end', ''));

render(
  <Provider store={store}>
    <StatusList />
  </Provider>
  ,
  document.getElementById('mount')
)
