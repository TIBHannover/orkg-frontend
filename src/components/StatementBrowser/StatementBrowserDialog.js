import { Component } from 'react';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Statements from 'components/StatementBrowser/StatementBrowser';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { updateSettings } from 'actions/statementBrowser';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import { ENTITIES } from 'constants/graphSettings';

class StatementBrowserDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // clone the original value of openExistingResourcesInDialog
            previousOpenExistingResourcesInDialog: Boolean(JSON.stringify(props.openExistingResourcesInDialog))
        };
    }

    render() {
        let route = ROUTES.RESOURCE;
        switch (this.props.type) {
            case ENTITIES.PREDICATE:
                route = ROUTES.PROPERTY;
                break;
            case 'property':
                route = ROUTES.PROPERTY;
                break;
            case ENTITIES.CLASS:
                route = ROUTES.CLASS;
                break;
            default:
                route = ROUTES.RESOURCE;
                break;
        }
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
                        {this.props.newStore
                            ? `View existing ${this.props.type}: ${this.props.label}`
                            : `View ${this.props.type}: ${this.props.label}`}
                    </span>
                    {this.props.newStore && (
                        <Link
                            style={{ right: 45, position: 'absolute', top: 12 }}
                            title={`Go to ${this.props.type} page`}
                            className="ml-2"
                            to={reverse(route, { id: this.props.id })}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button color="link" className="p-0">
                                Open {this.props.type} <Icon icon={faExternalLinkAlt} className="mr-1" />
                            </Button>
                        </Link>
                    )}
                </ModalHeader>
                <ModalBody>
                    <Statements
                        rootNodeType={this.props.type === ENTITIES.RESOURCE ? ENTITIES.RESOURCE : ENTITIES.PREDICATE}
                        enableEdit={this.props.enableEdit}
                        syncBackend={this.props.syncBackend}
                        initialSubjectId={this.props.id}
                        initialSubjectLabel={this.props.label}
                        initialPath={this.props.initialPath}
                        openExistingResourcesInDialog={false}
                        newStore={this.props.newStore}
                        showExternalDescriptions={this.props.showExternalDescriptions}
                    />
                </ModalBody>
            </Modal>
        );
    }
}

StatementBrowserDialog.propTypes = {
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    toggleModal: PropTypes.func.isRequired,
    newStore: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    openExistingResourcesInDialog: PropTypes.bool.isRequired,
    showExternalDescriptions: PropTypes.bool.isRequired,
    updateSettings: PropTypes.func.isRequired,
    type: PropTypes.string,
    initialPath: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired
        })
    )
};

StatementBrowserDialog.defaultProps = {
    newStore: true,
    enableEdit: false,
    syncBackend: false,
    type: ENTITIES.RESOURCE,
    initialPath: [],
    showExternalDescriptions: true
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
