import { forwardRef } from 'react';
import StatementItem from 'components/StatementBrowser/StatementItem/StatementItem';
import Template from 'components/StatementBrowser/Template/Template';
import { isTemplateContextProperty } from 'slices/statementBrowserSlice';
import PropTypes from 'prop-types';
import { useCookies } from 'react-cookie';
import { useSelector } from 'react-redux';

const StatementItemWrapper = forwardRef(
    ({ propertyId, resourceId, syncBackend, enableEdit, isFirstItem, openExistingResourcesInDialog, renderTemplateBox = false }, ref) => {
        const isTemplate = useSelector((state) => isTemplateContextProperty(state, propertyId) && renderTemplateBox);
        const property = useSelector((state) => state.statementBrowser.properties.byId[propertyId]);
        const values = useSelector((state) => state.statementBrowser.values);
        const [cookies] = useCookies(['showedValueHelp']);

        // If property is not checked an error will be raised because of FlipMove component
        if (!property) {
            return null;
        }
        if (!isTemplate) {
            return (
                <StatementItem
                    key={`statement-p${propertyId}r${resourceId}`}
                    id={propertyId}
                    enableEdit={enableEdit}
                    syncBackend={syncBackend}
                    resourceId={resourceId}
                    showValueHelp={!!(cookies && !cookies.showedValueHelp && isFirstItem)}
                    ref={ref}
                />
            );
        }
        return (
            <div ref={ref}>
                {property.valueIds.map((valueId) => {
                    const value = values.byId[valueId];
                    return (
                        <Template
                            key={`template-v${valueId}`}
                            id={valueId}
                            value={value}
                            propertyId={propertyId}
                            selectedResource={resourceId}
                            enableEdit={enableEdit}
                            syncBackend={syncBackend}
                            openExistingResourcesInDialog={openExistingResourcesInDialog}
                        />
                    );
                })}
            </div>
        );
    },
);

StatementItemWrapper.propTypes = {
    renderTemplateBox: PropTypes.bool.isRequired,
    propertyId: PropTypes.string.isRequired,
    isLastItem: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    showValueHelp: PropTypes.bool,
    isFirstItem: PropTypes.bool,
    resourceId: PropTypes.string,
    openExistingResourcesInDialog: PropTypes.bool,
};
StatementItemWrapper.displayName = 'StatementItemWrapper';
export default StatementItemWrapper;
