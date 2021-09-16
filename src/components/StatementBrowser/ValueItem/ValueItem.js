import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import ValueItemView from './ValueItemView';
import useValueItem from './hooks/useValueItem';
import PropTypes from 'prop-types';
import { ENTITIES } from 'constants/graphSettings';

export default function ValueItem(props) {
    const {
        resource,
        value,
        modal,
        setModal,
        dialogResourceId,
        dialogResourceLabel,
        openExistingResourcesInDialog,
        handleExistingResourceClick,
        handleResourceClick,
        getLabel
    } = useValueItem({ valueId: props.id, propertyId: props.propertyId, syncBackend: props.syncBackend, contextStyle: props.contextStyle });

    const existingResourceId = resource ? resource.existingResourceId : false;
    let handleOnClick = null;

    if (
        props.value._class === ENTITIES.RESOURCE &&
        (existingResourceId || props.contextStyle !== 'StatementBrowser') &&
        openExistingResourcesInDialog
    ) {
        handleOnClick = handleExistingResourceClick;
    } else if (props.value._class === ENTITIES.RESOURCE) {
        handleOnClick = handleResourceClick;
    }

    return (
        <>
            <ValueItemView
                id={props.id}
                value={value}
                resource={resource}
                handleOnClick={handleOnClick}
                enableEdit={props.enableEdit}
                showHelp={props.showHelp}
                getLabel={getLabel}
                syncBackend={props.syncBackend}
            />

            {modal ? (
                <StatementBrowserDialog
                    show={modal}
                    toggleModal={() => setModal(prev => !prev)}
                    id={dialogResourceId}
                    label={dialogResourceLabel}
                    newStore={Boolean(props.contextStyle === 'StatementBrowser' || existingResourceId)}
                    enableEdit={props.enableEdit && props.contextStyle !== 'StatementBrowser' && !existingResourceId}
                />
            ) : (
                ''
            )}
        </>
    );
}

ValueItem.propTypes = {
    value: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    contextStyle: PropTypes.string.isRequired,
    showHelp: PropTypes.bool
};

ValueItem.defaultProps = {
    contextStyle: 'StatementBrowser',
    showHelp: false
};
