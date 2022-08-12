import useInsertData from 'components/AddPaper/hooks/useInsertData';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { saveFeedback, SERVICE_MAPPING } from 'services/orkgNlp';

const useBioassays = () => {
    const { bioassayRawResponse, bioassayText } = useSelector(state => state.addPaper);
    const { properties, values } = useSelector(state => state.statementBrowser);
    const { getExistingStatement } = useInsertData();

    const handleSaveBioassaysFeedback = () => {
        // create the response object in the require format for the feedback endpoint

        // for resources coming from the NER service, feedback either ACCEPT or REJECT
        const response = cloneDeep(bioassayRawResponse);
        // we need the contribution id so we make that we only send feedback for the current contribution
        let contributionId = null;
        for (const [index, label] of bioassayRawResponse.entries()) {
            let accepted = 0;
            for (const [index2, resource] of label.resources.entries()) {
                const isExistingStatement = getExistingStatement({
                    object: {
                        label: resource.label,
                    },
                    property: {
                        label: label.property.label,
                    },
                });
                response[index].resources.splice(index2, 1, {
                    ...resource,
                    feedback: isExistingStatement ? 'ACCEPT' : 'REJECT',
                });
                if (isExistingStatement) {
                    if (!contributionId) {
                        const pId = properties.allIds.find(p => properties.byId[p].label === label.property.label);
                        contributionId = properties.byId[pId]?.resourceId ?? null;
                    }
                    accepted += 1;
                }
            }
            response[index].property.feedback = accepted === 0 ? 'REJECT' : 'ACCEPT';
        }

        // for properties coming from the statement browser, feedback either ACCEPT or REJECT
        for (const id of properties.allIds) {
            const property = properties.byId[id];
            if (contributionId === property.resourceId) {
                const label = response.find(l => l.property.label === property.label);
                if (!label) {
                    response.push({
                        property: {
                            ...(property.existingPredicateId ? { id: property.existingPredicateId } : {}),
                            label: property.label,
                            feedback: 'ADD',
                        },
                        resources: property.valueIds.map(valueId => {
                            const value = values.byId[valueId];
                            return {
                                ...(value.id ? { id: value.id } : {}),
                                label: value.label,
                                feedback: 'ADD',
                            };
                        }),
                    });
                } else {
                    const propertyIndex = response.findIndex(l => l.property.label === property.label);
                    for (const valueId of property.valueIds) {
                        const resource = values.byId[valueId];
                        const isExistingResource = label.resources.find(r => r.label === resource.label);
                        if (!isExistingResource) {
                            response[propertyIndex].resources.push({
                                ...(resource.id ? { id: resource.id } : {}),
                                label: resource.label,
                                feedback: 'ADD',
                            });
                        }
                    }
                }
            }
        }
        try {
            saveFeedback({
                request: {
                    text: bioassayText,
                },
                response,
                serviceName: SERVICE_MAPPING.BIOASSAYS_SEMANTIFICATION,
            });
        } catch (e) {
            console.log(e);
        }
    };

    return { handleSaveBioassaysFeedback };
};

export default useBioassays;
