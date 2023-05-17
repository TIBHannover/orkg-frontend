import { getPredicates } from 'services/backend/predicates';
import { ENTITIES } from 'constants/graphSettings';

async function convertExtractData2ContributionsStatements(collectedContribution) {
    const propertiesList = [];
    const valuesList = [];
    const contributions = [];
    await (async () => {
        await Promise.all(
            collectedContribution?.map(async (cont, outerIndex) => {
                const pred = cont?.data?.map(a =>
                    getPredicates({
                        q: a?.localName.includes('_') ? a.localName.replace(/_/g, ' ') : a.localName,
                        items: 1,
                    }),
                );
                const apiPredicatesCalls = await Promise.all(pred);

                propertiesList.push(
                    cont?.data?.map((p, i) => ({
                        existingPredicateId: apiPredicatesCalls[i]?.content[0]?.id,
                        propertyId: `${apiPredicatesCalls[i]?.content[0]?.id}_${i}_${outerIndex}`,
                        label: p?.localName.replace(/_/g, ' '),
                    })),
                );
                valuesList.push(
                    cont?.data?.map((v, i) => ({
                        label: v?.label || v?.textContent,
                        isExistingValue: v?.resourceURI[0] != null,
                        propertyId: `${apiPredicatesCalls[i].content[0]?.id}_${i}_${outerIndex}`,
                        existingResourceId: v?.resourceURI[0] != null ? v?.resourceURI[0].split('/').pop() : null,
                        _class: v?.resourceURI[0] ? ENTITIES.RESOURCE : ENTITIES.LITERAL,
                    })),
                );

                return apiPredicatesCalls;
            }),
        );
        collectedContribution?.map((c, index) => {
            contributions.push({
                statements: {
                    properties: propertiesList[index],
                    values: valuesList[index],
                },
            });
            return null;
        });
    })();
    return contributions;
}

export default convertExtractData2ContributionsStatements;
