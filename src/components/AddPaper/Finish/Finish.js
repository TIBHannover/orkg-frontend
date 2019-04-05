import React, { Component } from 'react';
import { crossrefUrl, submitGetRequest } from '../../../network';
import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { connect } from 'react-redux';
import { updateGeneralData, nextStep } from '../../../actions/addPaper';

class Finish extends Component {
    constructor(props) {
        super(props);
    }

    //TODO: redux action creator for saving all the data to the backend
    //TODO: use loading indicator

    render() {
        return <div className="text-center text-primary">
            <span style={{fontSize: 80}}>
                <Icon icon={faCheckCircle} />
            </span> 
            <br />
            <h2 className="h5">Paper has been added successfully</h2>
            <br />
            <Button color="primary" className="mb-4">View paper</Button>
        </div>
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