import Link from 'components/NextJsMigration/Link';
import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Statements from 'components/StatementBrowser/StatementBrowser';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { updateSettings } from 'slices/statementBrowserSlice';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import { ENTITIES } from 'constants/graphSettings';

const StatementBrowserDialog = ({
    openExistingResourcesInDialog,
    show,
    toggleModal,
    label,
    id,
    newStore = true,
    enableEdit = false,
    syncBackend = false,
    type = ENTITIES.RESOURCE,
    initialPath = [],
    showExternalDescriptions = true,
    canEditSharedRootLevel = true,
    onCloseModal = () => {},
}) => {
    // clone the original value of openExistingResourcesInDialog
    const [previousOpenExistingResourcesInDialog] = useState(Boolean(JSON.stringify(openExistingResourcesInDialog)));

    let route = ROUTES.RESOURCE;
    switch (type) {
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
            isOpen={show}
            toggle={toggleModal}
            size="lg"
            onExit={() => {
                onCloseModal();
                // return the original value of openExistingResourcesInDialog
                updateSettings({
                    openExistingResourcesInDialog: previousOpenExistingResourcesInDialog,
                });
            }}
        >
            <ModalHeader toggle={toggleModal}>
                <span style={{ marginRight: 170, display: 'inline-block' }}>
                    {newStore ? `View existing ${type}: ${label}` : `View ${type}: ${label}`}
                </span>
                {newStore && (
                    <Link
                        style={{ right: 45, position: 'absolute', top: 12 }}
                        title={`Go to ${type} page`}
                        className="ms-2"
                        href={`${reverse(route, { id })}?noRedirect`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button color="link" className="p-0">
                            Open {type} <Icon icon={faExternalLinkAlt} className="me-1" />
                        </Button>
                    </Link>
                )}
            </ModalHeader>
            <ModalBody>
                <Statements
                    rootNodeType={type === ENTITIES.RESOURCE ? ENTITIES.RESOURCE : ENTITIES.PREDICATE}
                    enableEdit={enableEdit}
                    syncBackend={syncBackend}
                    initialSubjectId={id}
                    initialSubjectLabel={label}
                    initialPath={initialPath}
                    openExistingResourcesInDialog={false}
                    newStore={newStore}
                    showExternalDescriptions={showExternalDescriptions}
                    canEditSharedRootLevel={canEditSharedRootLevel}
                />
            </ModalBody>
        </Modal>
    );
};

StatementBrowserDialog.propTypes = {
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    toggleModal: PropTypes.func.isRequired,
    onCloseModal: PropTypes.func,
    newStore: PropTypes.bool,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    openExistingResourcesInDialog: PropTypes.bool.isRequired,
    showExternalDescriptions: PropTypes.bool,
    updateSettings: PropTypes.func.isRequired,
    type: PropTypes.string,
    initialPath: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        }),
    ),
    canEditSharedRootLevel: PropTypes.bool,
};

const mapStateToProps = (state) => ({ openExistingResourcesInDialog: state.statementBrowser.openExistingResourcesInDialog });

const mapDispatchToProps = (dispatch) => ({
    updateSettings: (data) => dispatch(updateSettings(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(StatementBrowserDialog);
