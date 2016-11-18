import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

class StatusListItem extends Component {
  constructor(props) {
    super(props);

    this.cancelhandler = this.cancelhandler.bind(this);
  }

  cancelhandler() {
    axios.post('/statuslist/cancel', {uuid: this.props.uuid});
  }

  render() {
    var nodisplay = { display: 'none' };
    return (
      <tr>
        <td className='uuid'>{this.props.uuid}</td>
        <td>
           <a href={'/studies/' + this.props.StudyInstanceUID}>Study</a>
        </td>
        <td>{this.props.PatientID}</td>
        <td>{this.props.PatientName}</td>
        <td>{fixdate(this.props.StudyDate, 'l')}</td>
        <td>{this.props.ModalitiesInStudy}</td>
        <td>{this.props.destination_name}</td>
        <td><span style={nodisplay}>{this.props.updatedAt}</span><div>{fixdate(this.props.updatedAt)}</div></td>
        <td><span style={nodisplay}>{this.props.createdAt}</span><div>{fixdate(this.props.createdAt)}</div></td>
        <td>{this.props.status}</td>
        <td><input type='button' onClick={this.cancelhandler} value='Cancel' /></td>
      </tr>
    );
  }
};

function fixdate(date, formatstring = 'lll') {
  var d = moment(date);
  return d.format(formatstring);
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
      <table ref='mytable' className='table table-bordered'>
        <thead>
          <tr>
            <th>uuid</th>
            <th>StudyInstanceUID</th>
            <th>PatientID</th>
            <th>Patient Name</th>
            <th>Study Date</th>
            <th>Modalities</th>
            <th>Destination</th>
            <th>last update</th>
            <th>started at</th>
            <th>status</th>
            <th></th>
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
