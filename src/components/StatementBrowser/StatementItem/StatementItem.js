import StatementItemTemplate from './StatementItemTemplate';
import useStatementItem from './hooks/useStatementItem';
import PropTypes from 'prop-types';

export default function StatementItem(props) {
    const { predicateLabel, handleChange, handleDeleteStatement } = useStatementItem(props);

    return (
        <StatementItemTemplate
            property={props.property}
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
    property: PropTypes.object.isRequired,
    predicateLabel: PropTypes.string.isRequired,
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
