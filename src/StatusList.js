import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class StatusListItem extends Component {
  render() {
    return (
      <tr>
        <td>{this.props.uuid}</td>
        <td>
           <a href={'/studies/' + this.props.StudyInstanceUID}>{this.props.StudyInstanceUID}</a>
        </td>
        <td>{this.props.PatientID}</td>
        <td>{this.props.PatientName}</td>
        <td>{this.props.destination_name}</td>
        <td>{fixdate(this.props.updatedAt)}</td>
        <td>{this.props.status}</td>
      </tr>
    );
  }
};

function fixdate(date) {
  var d = new Date(date);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}
/*
StatusListItem.propTypes = {
  uuid: PropTypes.string.isRequired,
  StudyInstanceUID: PropTypes.string.isRequired,
  PatientID: PropTypes.string.isRequired,
  PatientName: PropTypes.string.isRequired,
  destination_name: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired
};*/

class StatusList extends Component {

  render() {
    return (
      <table className='table table-bordered'>
        <thead>
          <tr>
            <th>uuid</th>
            <th>StudyInstanceUID</th>
            <th>PatientID</th>
            <th>PatientName</th>
            <th>Destination</th>
            <th>last update</th>
            <th>status</th>
          </tr>
        </thead>
        <tbody>
          {
            this.props.statuslist ?
              this.props.statuslist.map(item => {
                return <StatusListItem {...item} key={item.uuid} />
              }) : <tr></tr>
          }
        </tbody>
        <tfoot></tfoot>
      </table>
    );
  }
};

// Function passed in to `connect` to subscribe to Redux store updates.
// Any time it updates, mapStateToProps is called.
function mapStateToProps(state) {
  return {
    statuslist: state.statuslist
  };
}

// Connects React component to the redux store
// It does not modify the component class passed to it
// Instead, it returns a new, connected component class, for you to use.
export default connect(mapStateToProps)(StatusList);
