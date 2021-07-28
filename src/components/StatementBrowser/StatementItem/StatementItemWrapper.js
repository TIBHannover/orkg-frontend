import StatementItem from 'components/StatementBrowser/StatementItem/StatementItem';
import Template from 'components/StatementBrowser/Template/Template';
import { isTemplateContextProperty } from 'actions/statementBrowser';
import PropTypes from 'prop-types';
import { useCookies } from 'react-cookie';
import { useSelector } from 'react-redux';

export default function StatementItemWrapper(props) {
    const isTemplate = useSelector(state => isTemplateContextProperty(state, props.propertyId) && props.renderTemplateBox);
    const property = useSelector(state => state.statementBrowser.properties.byId[props.propertyId]);
    const values = useSelector(state => state.statementBrowser.values);
    const [cookies] = useCookies(['showedValueHelp']);

    if (!isTemplate) {
        return (
            <StatementItem
                key={`statement-p${props.propertyId}r${props.resourceId}`}
                id={props.propertyId}
                enableEdit={props.shared <= 1 ? props.enableEdit : false}
                syncBackend={props.syncBackend}
                resourceId={props.resourceId}
                isLastItem={props.isLastItem}
                showValueHelp={cookies && !cookies.showedValueHelp && props.isFirstItem ? true : false}
            />
        );
    } else {
        return property.valueIds.map(valueId => {
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
        });
    }
}

StatementItem.propTypes = {
    renderTemplateBox: PropTypes.bool.isRequired
};

StatementItem.defaultProps = {
    renderTemplateBox: false
};
