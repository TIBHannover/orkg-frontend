import { getPredicates } from 'services/backend/predicates';
import { ENTITIES } from 'constants/graphSettings';

async function convertExtractData2ContributionsStatements(collectedContribution) {
    const contributions = Promise.all(
        collectedContribution?.map(async (cont, outerIndex) => {
            const values = {};

            const pred = cont?.data?.map(a =>
                getPredicates({
                    q: a?.localName.includes('_') ? a.localName.replace(/_/g, ' ') : a.localName,
                    items: 1,
                }),
            );
            const apiPredicatesCalls = await Promise.all(pred);

            if (cont?.data) {
                for (const [i, v] of cont.data.entries()) {
                    const propertyId = apiPredicatesCalls[i]?.content[0]?.id;

                    if (!(propertyId in values)) {
                        values[propertyId] = [];
                    }
                    values[propertyId].push({
                        '@id': v?.resourceURI[0] != null ? v?.resourceURI[0].split('/').pop() : null,
                        '@type': v?.resourceURI[0] ? ENTITIES.RESOURCE : ENTITIES.LITERAL,
                        label: v?.resourceURI[0] ? v?.label || v?.textContent : undefined,
                        text: !v?.resourceURI[0] ? v?.label || v?.textContent : undefined,
                    });
                }
            }
            return {
                name: `Contribution ${outerIndex + 1}`,
                values,
            };
        }),
    );

    return contributions;
}

export default convertExtractData2ContributionsStatements;
