import React from 'react';
import { render } from 'react-dom';
import StatusList from './StatusList';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import io from 'socket.io-client';
import rootReducer from './statuslistreducer';

const initialState = window.__INITIAL_STATE__;
// var initial = [{"id":"1","uuid":"7172da6d-58c8-48d9-855f-e54c8776d061","StudyInstanceUID":"1.2.840.1.2.2026846767.4006","PatientID":"TCC^100226","PatientName":"DENISON^PAMELA","destination_id":"1","destination_name":"localhost","status":"Queued","updatedAt":"2016-09-14T06:12:15Z"},{"id":"2","uuid":"1ac50375-a33d-49cf-8b7f-ce0728ebc7ec","StudyInstanceUID":"1.2.840.1.2.2026846767.4005","PatientID":"TCC^ST121437","PatientName":"TORRES^SANDRA","destination_id":"1","destination_name":"localhost","status":"Queued","updatedAt":"2016-09-14T06:25:51Z"},{"id":"3","uuid":"9c729bd6-d8d4-4945-bc81-a6c2be0fc20c","StudyInstanceUID":"1.2.840.113681.2229464764.11196.3618670647.90","PatientID":"100226","PatientName":"DENISON^PAMELA","destination_id":"1","destination_name":"localhost","status":"Queued","updatedAt":"2016-09-14T07:33:02Z"},{"id":"4","uuid":"ca3d7a6e-b37e-4fc4-b2d3-bd2d061adb6a","StudyInstanceUID":"1.2.840.113681.2229464764.11196.3618670647.90","PatientID":"100226","PatientName":"DENISON^PAMELA","destination_id":"1","destination_name":"localhost","status":"0 of 5 sent","updatedAt":"2016-09-14T02:36:02Z"},{"id":"5","uuid":"e3a9e803-abaa-4b0c-a7cb-8cbfb6448ef7","StudyInstanceUID":"1.2.840.113681.2229464764.11196.3618670647.90","PatientID":"100226","PatientName":"DENISON^PAMELA","destination_id":"1","destination_name":"localhost","status":"5 of 5 sent","updatedAt":"2016-09-14T02:36:55Z"},{"id":"6","uuid":"3a43695f-21d6-446f-a0c4-9f2dc1268132","StudyInstanceUID":"1.2.840.1.2.2026846767.4007","PatientID":"TCC^EG921255","PatientName":"GUTIERREZ^ELIZABETH","destination_id":"1","destination_name":"localhost","status":"1251 of 1251 sent","updatedAt":"2016-09-14T02:41:20Z"},{"id":"7","uuid":"b50c8cdd-2992-4ce3-a152-5a30e216157a","StudyInstanceUID":"1.2.840.1.2.2026846767.4006","PatientID":"TCC^100226","PatientName":"DENISON^PAMELA","destination_id":"1","destination_name":"localhost","status":"1251 of 1251 sent","updatedAt":"2016-09-14T22:18:45Z"},{"id":"8","uuid":"81f80042-c808-405b-90d4-3b23bafe6636","StudyInstanceUID":"1.2.840.1.2.2026846767.4006","PatientID":"TCC^100226","PatientName":"DENISON^PAMELA","destination_id":"1","destination_name":"localhost","status":"616 of 1251 sent","updatedAt":"2016-09-14T23:50:00Z"},{"id":"9","uuid":"c57555fb-2841-492f-907b-b9f826acaef4","StudyInstanceUID":"1.2.840.1.2.2026846767.4006","PatientID":"TCC^100226","PatientName":"DENISON^PAMELA","destination_id":"1","destination_name":"localhost","status":"1251 of 1251 sent","updatedAt":"2016-09-15T05:38:59Z"}];

let store = createStore(rootReducer, initialState)
/*store.dispatch({
 type: 'SET_OUTSESSION',
  statuslist: []
});*/

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
