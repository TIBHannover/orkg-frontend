import { useState } from 'react';
import {
    getComponentsByResourceIDAndPredicateID,
    canAddValue as canAddValueAction,
    canDeleteProperty as canDeletePropertyAction
} from 'actions/statementBrowser';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

function useStatementItem(props) {
    const dispatch = useDispatch();
    const components = useSelector(state =>
        getComponentsByResourceIDAndPredicateID(
            state,
            props.resourceId ? props.resourceId : state.statementBrowser.selectedResource,
            props.property.existingPredicateId
        )
    );
    const canAddValue = useSelector(state =>
        canAddValueAction(state, props.resourceId ? props.resourceId : state.statementBrowser.selectedResource, props.id)
    );
    const canDeleteProperty = useSelector(state =>
        canDeletePropertyAction(state, props.resourceId ? props.resourceId : state.statementBrowser.selectedResource, props.id)
    );
    const propertiesAsLinks = useSelector(state => state.statementBrowser.propertiesAsLinks);
    const [disableHover, setDisableHover] = useState(false);
    const values = useSelector(state => state.statementBrowser.values);
    const propertyOptionsClasses = classNames({
        propertyOptions: true,
        disableHover: disableHover
    });

    return {
        propertiesAsLinks,
        propertyOptionsClasses,
        canDeleteProperty,
        dispatch,
        setDisableHover,
        values,
        components,
        canAddValue
    };
}
export default useStatementItem;
