import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Statements from './Statements';
import { Provider } from 'react-redux';
import configureStore from '../../store';

class StatementBrowserDialog extends Component {
    constructor(props) {
        super(props);
        this.store = configureStore(); //create a new store because the statement browser should be completely independent from the current state
    }

    render() {
        return (
            <Modal isOpen={this.props.show} toggle={this.props.toggleModal} size="lg">
                <ModalHeader toggle={this.props.toggleModal}>View existing resource: {this.props.resourceLabel}</ModalHeader>
                <ModalBody>
                    <Provider store={this.store}>
                        <Statements enableEdit={false} initialResourceId={this.props.resourceId} initialResourceLabel={this.props.resourceLabel} />
                    </Provider>
                </ModalBody>
            </Modal>
        );
    }
}

StatementBrowserDialog.propTypes = {
    resourceLabel: PropTypes.string.isRequired,
    resourceId: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    toggleModal: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return {};
};

export default connect(mapStateToProps)(StatementBrowserDialog);
