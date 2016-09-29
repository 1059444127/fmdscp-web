import React from 'react';
import { render } from 'react-dom';
import StatusList from './StatusList';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import io from 'socket.io-client';
import rootReducer from './statuslistreducer';

const initialState = window.__INITIAL_STATE__;

let store = createStore(rootReducer, initialState)

const socket = io(`${location.protocol}//${location.hostname}:3000`);
socket.on('updateoutsessionitem', state =>
  store.dispatch({type: 'UPDATE_OUTSESSIONITEM', item: state})
);

render(
  <Provider store={store}>
    <StatusList />
  </Provider>
  ,
  document.getElementById('mount')
)
