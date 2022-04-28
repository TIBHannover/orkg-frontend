import { forwardRef } from 'react';
import StatementItem from 'components/StatementBrowser/StatementItem/StatementItem';
import Template from 'components/StatementBrowser/Template/Template';
import { isTemplateContextProperty } from 'slices/statementBrowserSlice';
import PropTypes from 'prop-types';
import { useCookies } from 'react-cookie';
import { useSelector } from 'react-redux';

const StatementItemWrapper = forwardRef((props, ref) => {
    const isTemplate = useSelector(state => isTemplateContextProperty(state, props.propertyId) && props.renderTemplateBox);
    const property = useSelector(state => state.statementBrowser.properties.byId[props.propertyId]);
    const values = useSelector(state => state.statementBrowser.values);
    const [cookies] = useCookies(['showedValueHelp']);

    // If property is not checked an error will be raised because of FlipMove component
    if (!property) {
        return null;
    }
    if (!isTemplate) {
        return (
            <StatementItem
                key={`statement-p${props.propertyId}r${props.resourceId}`}
                id={props.propertyId}
                enableEdit={props.enableEdit}
                syncBackend={props.syncBackend}
                resourceId={props.resourceId}
                showValueHelp={cookies && !cookies.showedValueHelp && props.isFirstItem ? true : false}
                ref={ref}
            />
        );
    } else {
        return (
            <div ref={ref}>
                {property.valueIds.map(valueId => {
                    const value = values.byId[valueId];
                    return (
                        <Template
                            key={`template-v${valueId}`}
                            id={valueId}
                            value={value}
                            propertyId={props.propertyId}
                            selectedResource={props.resourceId}
                            enableEdit={props.enableEdit}
                            syncBackend={props.syncBackend}
                            openExistingResourcesInDialog={props.openExistingResourcesInDialog}
                        />
                    );
                })}
            </div>
        );
    }
});

StatementItemWrapper.propTypes = {
    renderTemplateBox: PropTypes.bool.isRequired,
    propertyId: PropTypes.string.isRequired,
    isLastItem: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    showValueHelp: PropTypes.bool,
    isFirstItem: PropTypes.bool,
    resourceId: PropTypes.string,
    openExistingResourcesInDialog: PropTypes.bool
};

StatementItemWrapper.defaultProps = {
    renderTemplateBox: false
};

export default StatementItemWrapper;
