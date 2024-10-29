import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { getStatements, statementsUrl } from 'services/backend/statements';
import { saveFeedback, SERVICE_MAPPING } from 'services/orkgNlp';
import useSWR from 'swr';

const useBioassays = ({ selectedResource }) => {
    const { bioassayRawResponse, bioassayText } = useSelector((state) => state.viewPaper);

    const { data: statements } = useSWR(
        selectedResource ? [{ subjectId: selectedResource, returnContent: true, returnFormattedLabels: true }, statementsUrl, 'getStatements'] : null,
        ([params]) => getStatements(params),
        { revalidateIfStale: true, revalidateOnFocus: true },
    );

    const handleSaveBioassaysFeedback = ({ selectedItems }) => {
        // create the response object in the require format for the feedback endpoint

        // for resources coming from the NER service, feedback either ACCEPT or REJECT
        const response = cloneDeep(bioassayRawResponse);
        // we need the contribution id so we make that we only send feedback for the current contribution
        let contributionId = null;
        for (const [index, label] of bioassayRawResponse.entries()) {
            let accepted = 0;
            for (const [index2, resource] of label.resources.entries()) {
                const isExistingStatement = statements?.find(
                    (statement) => statement.object.label === resource.label && statement.predicate.label === label.property.label,
                );
                const isSelected = selectedItems[label.property.id]?.find((resourceId) => resourceId === resource.id);
                response[index].resources.splice(index2, 1, {
                    ...resource,
                    feedback: isExistingStatement || isSelected ? 'ACCEPT' : 'REJECT',
                });
                if (isExistingStatement) {
                    if (!contributionId) {
                        const sId = statements?.find((s) => s.predicate.label === label.property.label);
                        contributionId = sId?.subject.id ?? null;
                    }
                    accepted += 1;
                }
            }
            response[index].property.feedback = accepted === 0 ? 'REJECT' : 'ACCEPT';
        }

        // for properties coming from the statement browser, feedback either ACCEPT or REJECT
        for (const s of statements ?? []) {
            const property = s.predicate;
            if (selectedResource === s.subject.id) {
                const label = response.find((l) => l.property.label === property.label);
                if (!label) {
                    response.push({
                        property: {
                            ...(property.id ? { id: property.id } : {}),
                            label: property.label,
                            feedback: 'ADD',
                        },
                        resources: [
                            {
                                label: s.object.label,
                                feedback: 'ADD',
                            },
                        ],
                    });
                } else {
                    const propertyIndex = response.findIndex((l) => l.property.label === property.label);
                    response[propertyIndex].resources.push({
                        ...(s.object.id ? { id: s.object.id } : {}),
                        label: s.object.label,
                        feedback: 'ADD',
                    });
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
