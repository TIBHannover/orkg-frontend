import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Statements from './Statements';
import { Provider } from 'react-redux';
import configureStore from '../../store';
import SameAsStatements from 'pages/SameAsStatements';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';

class StatementBrowserDialog extends Component {
    constructor(props) {
        super(props);
        this.store = configureStore(); //create a new store because the statement browser should be completely independent from the current state
    }

    render() {
        return (
            <Modal isOpen={this.props.show} toggle={this.props.toggleModal} size="lg">
                <ModalHeader toggle={this.props.toggleModal}>
                    <span style={{ marginRight: 170, display: 'inline-block' }}>View existing resource: {this.props.resourceLabel}</span>
                    <Link
                        style={{ right: 45, position: 'absolute', top: 12 }}
                        title={'Go to resource page'}
                        className={'ml-2'}
                        to={reverse(ROUTES.RESOURCE, { id: this.props.resourceId })}
                    >
                        <Button color="link" className="p-0">
                            Open resource <Icon icon={faExternalLinkAlt} className="mr-1" />
                        </Button>
                    </Link>
                </ModalHeader>
                <ModalBody>
                    <Provider store={this.store}>
                        <Statements enableEdit={false} initialResourceId={this.props.resourceId} initialResourceLabel={this.props.resourceLabel} />
                        <SameAsStatements />
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
