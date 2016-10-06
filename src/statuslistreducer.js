import { combineReducers } from 'redux';

const statuslistitemReducer = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_ITEM':
      if (state.uuid === action.uuid) {
        return action.data;
      }
      return state;
    default:
      return state;
  }
};

const statuslistReducer = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_OUTSESSIONITEM':
      var f;
      var found = state.some((element, index, array) => { f = index; return (action.item.uuid == element.uuid) });
      if(found) {
        state[f].updatedAt = action.item.updatedAt;
        state[f].status = action.item.status;
        return [ ...state];
      }
      else
        return [ {
          uuid: action.item.uuid,
          StudyInstanceUID: action.item.StudyInstanceUID,
          PatientID: action.item.PatientID,
          PatientName: action.item.PatientName,
          destination_name: action.item.destination_name,
          status: action.item.status,
          updatedAt: action.item.updatedAt,
          createdAt: action.item.createdAt },
          ...state];
    case 'SET_OUTSESSIONS':
      return action.statuslist;
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  statuslist: statuslistReducer
});

export default rootReducer;
