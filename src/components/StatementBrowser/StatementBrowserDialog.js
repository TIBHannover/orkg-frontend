import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Statements from 'components/StatementBrowser/Statements/StatementsContainer';
import { Provider } from 'react-redux';
import configureStore from 'store';
import SameAsStatements from 'pages/SameAsStatements';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { updateSettings } from 'actions/statementBrowser';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';

class StatementBrowserDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // clone the original value of openExistingResourcesInDialog
            previousOpenExistingResourcesInDialog: Boolean(JSON.stringify(props.openExistingResourcesInDialog))
        };
        this.store = configureStore(); //create a new store because the statement browser should be completely independent from the current state
    }

    render() {
        return (
            <Modal
                isOpen={this.props.show}
                toggle={this.props.toggleModal}
                size="lg"
                onExit={() => {
                    // return the original value of openExistingResourcesInDialog
                    this.props.updateSettings({
                        openExistingResourcesInDialog: this.state.previousOpenExistingResourcesInDialog
                    });
                }}
            >
                <ModalHeader toggle={this.props.toggleModal}>
                    <span style={{ marginRight: 170, display: 'inline-block' }}>
                        {this.props.newStore ? (
                            <>View existing resource: {this.props.resourceLabel}</>
                        ) : (
                            <>View resource: {this.props.resourceLabel}</>
                        )}
                    </span>
                    {this.props.newStore && (
                        <Link
                            style={{ right: 45, position: 'absolute', top: 12 }}
                            title="Go to resource page"
                            className="ml-2"
                            to={reverse(ROUTES.RESOURCE, { id: this.props.resourceId })}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button color="link" className="p-0">
                                Open resource <Icon icon={faExternalLinkAlt} className="mr-1" />
                            </Button>
                        </Link>
                    )}
                </ModalHeader>
                <ModalBody>
                    {this.props.newStore ? (
                        <Provider store={this.store}>
                            <Statements
                                enableEdit={this.props.enableEdit}
                                syncBackend={this.props.syncBackend}
                                initialResourceId={this.props.resourceId}
                                initialResourceLabel={this.props.resourceLabel}
                                newStore={this.props.newStore}
                                openExistingResourcesInDialog={false}
                            />
                        </Provider>
                    ) : (
                        <Statements
                            enableEdit={this.props.enableEdit}
                            initialResourceId={this.props.resourceId}
                            initialResourceLabel={this.props.resourceLabel}
                            openExistingResourcesInDialog={false}
                            newStore={this.props.newStore}
                        />
                    )}
                    <SameAsStatements />
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
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    openExistingResourcesInDialog: PropTypes.bool.isRequired,
    updateSettings: PropTypes.func.isRequired
};

StatementBrowserDialog.defaultProps = {
    newStore: true,
    enableEdit: false,
    syncBackend: false
};

const mapStateToProps = state => {
    return { openExistingResourcesInDialog: state.statementBrowser.openExistingResourcesInDialog };
};

const mapDispatchToProps = dispatch => ({
    updateSettings: data => dispatch(updateSettings(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StatementBrowserDialog);
