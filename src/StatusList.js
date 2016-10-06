import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class StatusListItem extends Component {
  render() {
    var nodisplay = { display: 'none' };
    return (
      <tr>
        <td>{this.props.uuid}</td>
        <td>
           <a href={'/studies/' + this.props.StudyInstanceUID}>{this.props.StudyInstanceUID}</a>
        </td>
        <td>{this.props.PatientID}</td>
        <td>{this.props.PatientName}</td>
        <td>{this.props.destination_name}</td>
        <td><span style={nodisplay}>{this.props.updatedAt}</span><div>{fixdate(this.props.updatedAt)}</div></td>
        <td><span style={nodisplay}>{this.props.createdAt}</span><div>{fixdate(this.props.createdAt)}</div></td>
        <td>{this.props.status}</td>
      </tr>
    );
  }
};

function fixdate(date) {
  var d = moment(date);
  return d.format('lll');
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
      <table className='table table-bordered' data-toggle="table" data-unique-id="uuid">
        <thead>
          <tr>
            <th data-visible="false" data-field="StudyInstanceUID">uuid</th>
            <th>StudyInstanceUID</th>
            <th>PatientID</th>
            <th>PatientName</th>
            <th>Destination</th>
            <th data-sortable="true">last update</th>
            <th data-sortable="true">started at</th>
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
