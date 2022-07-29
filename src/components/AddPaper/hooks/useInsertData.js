import { fillStatements, goToResourceHistory } from 'slices/statementBrowserSlice';
import { ENTITIES } from 'constants/graphSettings';
import { useDispatch, useSelector } from 'react-redux';
import { guid } from 'utils';

/**
 *  Hook used insert data in the statement browser, prevents inserting duplicate statements
 * */

// TODO: also use this hook for the abstract annotator (needs refactoring to functional component)

const useInsertData = () => {
    const { contributions, selectedContribution } = useSelector(state => state.addPaper);
    const { properties, values } = useSelector(state => state.statementBrowser);
    const dispatch = useDispatch();

    const getExistingPropertyId = property => {
        if (properties.allIds.length > 0) {
            return properties.allIds.find(pId => properties.byId[pId].label === property.label);
        }
        return false;
    };

    const getExistingStatement = statement => {
        if (properties.allIds.length > 0) {
            const existingProperty = properties.allIds.find(pId => properties.byId[pId].label === statement.property.label);
            if (existingProperty) {
                return properties.byId[existingProperty].valueIds.find(id => (values.byId[id].label === statement.object.label ? id : false));
            }
        }
        return false;
    };

    const handleInsertData = statements => {
        const classesID = {};
        const createdProperties = {};
        const insertStatements = { properties: [], values: [] };

        if (statements.length > 0) {
            statements.map(statement => {
                let propertyId;
                if (!getExistingStatement(statement) && statement.property.id) {
                    if (classesID[statement.property.id]) {
                        propertyId = classesID[statement.property.id];
                    } else {
                        const pID = guid();
                        classesID[statement.property.id] = pID;
                        propertyId = pID;
                    }
                    if (!createdProperties[propertyId]) {
                        const existingPredicateId = getExistingPropertyId(statement.property);
                        if (!existingPredicateId) {
                            insertStatements.properties.push({
                                propertyId,
                                existingPredicateId:
                                    statement.property.id.toLowerCase() !== statement.property.label.toLowerCase() ? statement.property.id : null,
                                label: statement.property.label,
                            });
                        } else {
                            propertyId = existingPredicateId;
                        }
                        createdProperties[propertyId] = propertyId;
                    }
                    insertStatements.values.push({
                        label: statement.object.label,
                        _class: ENTITIES.RESOURCE,
                        propertyId,
                        isExistingValue: statement.object.isExistingValue,
                        existingResourceId: statement.object.id || undefined,
                    });
                }
                return null;
            });
        }

        dispatch(fillStatements({ statements: insertStatements, resourceId: contributions.byId[selectedContribution].resourceId }));
        // open the root contribution resource, that's where the statements are added
        dispatch(
            goToResourceHistory({
                id: contributions.byId[selectedContribution].resourceId,
                historyIndex: 0,
            }),
        );
    };

    return { handleInsertData, getExistingStatement };
};

export default useInsertData;
