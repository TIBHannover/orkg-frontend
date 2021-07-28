import StatementItemTemplate from './StatementItemTemplate';
import useStatementItem from './hooks/useStatementItem';
import PropTypes from 'prop-types';

export default function StatementItem(props) {
    const { property, predicateLabel, handleChange, handleDeleteStatement } = useStatementItem({
        propertyId: props.id,
        resourceId: props.resourceId,
        syncBackend: props.syncBackend
    });

    return (
        <StatementItemTemplate
            property={property}
            id={props.id}
            isLastItem={props.isLastItem}
            enableEdit={props.enableEdit}
            predicateLabel={predicateLabel}
            syncBackend={props.syncBackend}
            handleChange={handleChange}
            inTemplate={props.inTemplate}
            showValueHelp={props.showValueHelp}
            handleDeleteStatement={handleDeleteStatement}
            resourceId={props.resourceId}
        />
    );
}

StatementItem.propTypes = {
    id: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    isLastItem: PropTypes.bool.isRequired,
    showValueHelp: PropTypes.bool,
    resourceId: PropTypes.string,
    inTemplate: PropTypes.bool
};

StatementItem.defaultProps = {
    resourceId: null,
    showValueHelp: false
};
