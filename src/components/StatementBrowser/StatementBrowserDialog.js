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
                    {this.props.newStore ? (
                        <Provider store={this.store}>
                            <Statements
                                enableEdit={false}
                                initialResourceId={this.props.resourceId}
                                initialResourceLabel={this.props.resourceLabel}
                            />
                        </Provider>
                    ) : (
                        <Statements
                            enableEdit={this.props.enableEdit}
                            initialResourceId={this.props.resourceId}
                            initialResourceLabel={this.props.resourceLabel}
                            newStore={this.props.newStore}
                        />
                    )}
                </ModalBody>
            </Modal>
        );
    }
}

StatementBrowserDialog.propTypes = {
    resourceLabel: PropTypes.string.isRequired,
    resourceId: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    toggleModal: PropTypes.func.isRequired,
    newStore: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired
};

StatementBrowserDialog.defaultProps = {
    newStore: true,
    enableEdit: false
};

const mapStateToProps = state => {
    return {};
};

export default connect(mapStateToProps)(StatementBrowserDialog);
