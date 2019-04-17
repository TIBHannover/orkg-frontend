import React, { Component } from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";

//import { updateGeneralData, nextStep } from '../../../actions/addPaper';

class Finish extends Component {
    /*constructor(props) {
        super(props);
    }*/

    //TODO: redux action creator for saving all the data to the backend
    //TODO: use loading indicator

    render() {
        if (!this.props.paperNewResourceId) { // no ID yet, thus loading...
            return <div className="text-center text-primary">
                <span style={{ fontSize: 80 }}>
                    <Icon icon={faSpinner} spin />
                </span>
                <br />
                <h2 className="h5">Loading...</h2>
            </div>
        } else {
            return <div className="text-center text-primary">
                <span style={{ fontSize: 80 }}>
                    <Icon icon={faCheckCircle} />
                </span>
                <br />
                <h2 className="h5">Paper has been added successfully</h2>
                <br />
                <Link to={'/paper/' + this.props.paperNewResourceId}> {/* TODO: change route: use constants */}
                    <Button color="primary" className="mb-4">View paper</Button>
                </Link>
            </div>
        }
    }
}

const mapStateToProps = state => ({
    ...state.addPaper
});

const mapDispatchToProps = dispatch => ({

});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Finish);