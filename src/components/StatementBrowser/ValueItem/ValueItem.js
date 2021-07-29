import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import RDFDataCube from 'components/RDFDataCube/RDFDataCube';
import ValueItemTemplate from './ValueItemTemplate';
import useValueItem from './hooks/useValueItem';
import PropTypes from 'prop-types';
import { PREDICATES, ENTITIES } from 'constants/graphSettings';

export default function ValueItem(props) {
    const {
        resource,
        value,
        modal,
        setModal,
        property,
        commitChangeLabel,
        handleChangeResource,
        handleDeleteValue,
        handleDatasetResourceClick,
        handleDatasetClick,
        modalDataset,
        dialogResourceId,
        dialogResourceLabel,
        setModalDataset,
        openExistingResourcesInDialog,
        handleExistingResourceClick,
        handleResourceClick
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
            <ValueItemTemplate
                isProperty={[PREDICATES.TEMPLATE_COMPONENT_PROPERTY, PREDICATES.TEMPLATE_OF_PREDICATE].includes(property?.existingPredicateId)}
                id={props.id}
                value={value}
                resource={resource}
                predicate={property}
                handleOnClick={handleOnClick}
                handleChangeResource={handleChangeResource}
                commitChangeLabel={commitChangeLabel}
                handleDatasetClick={handleDatasetClick}
                enableEdit={props.enableEdit}
                handleDeleteValue={handleDeleteValue}
                showHelp={props.showHelp}
                components={props.components}
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

            {modalDataset && (
                <RDFDataCube
                    show={modalDataset}
                    handleResourceClick={handleDatasetResourceClick}
                    toggleModal={() => setModalDataset(prev => !prev)}
                    resourceId={dialogResourceId}
                    resourceLabel={dialogResourceLabel}
                />
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
    showHelp: PropTypes.bool,
    components: PropTypes.array.isRequired
};

ValueItem.defaultProps = {
    contextStyle: 'StatementBrowser',
    showHelp: false
};
