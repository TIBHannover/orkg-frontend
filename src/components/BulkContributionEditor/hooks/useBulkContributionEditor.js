import { CLASSES, PREDICATES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { uniq } from 'lodash';
import queryString from 'query-string';
import { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import { getStatementsByObjectAndPredicate, getStatementsBySubjects } from 'services/backend/statements';
import { getComparison } from 'services/similarity';

const useBulkContributionEditor = () => {
    const location = useLocation();
    const history = useHistory();
    const [contributions, setContributions] = useState(null);

    // parse 'contributions' from query string, ensure always an array is returned
    const parseQueryString = () => {
        const { contributions } = queryString.parse(location.search, { arrayFormat: 'comma' });
        const contributionIds = contributions && !Array.isArray(contributions) ? [contributions] : contributions;
        return uniq(contributionIds) ?? [];
    };

    const contributionIds = parseQueryString();

    const fetchContributions = useCallback(async () => {
        // TODO: should be optimized, and fetch all paper data (authors, publication date etc.)
        const contributionStatements = await getStatementsBySubjects({ ids: contributionIds });

        const table = {
            contributions: {},
            data: {},
            properties: {}
        };

        for (const contributionId of contributionIds) {
            const paperStatements = await getStatementsByObjectAndPredicate({ objectId: contributionId, predicateId: PREDICATES.HAS_CONTRIBUTION });
            const { label: paperTitle, id: paperId } = paperStatements.find(statement => statement.subject.classes.includes(CLASSES.PAPER))?.subject;
            const { label: contributionTitle } = paperStatements.find(statement => statement.object.classes.includes(CLASSES.CONTRIBUTION))?.object;
            const { statements } = contributionStatements.find(result => result.id === contributionId) || [];

            /*_contributions.push({
                paper: {
                    title: paperTitle,
                    id: paperId
                },
                contributionStatements: statements
            });*/

            const contributionData = {};
            for (const statement of statements) {
                const property = statement.predicate;
                if (!(property.id in table.properties)) {
                    table.properties[property.id] = property;
                }
                const object = statement.object;
                if (!(object.id in table.data)) {
                    table.data[object.id] = object;
                }
                if (!(property.id in contributionData)) {
                    contributionData[property.id] = [];
                }
                contributionData[property.id].push({ ...object, statementId: statement.id, type: object._class, resourceId: object.id });
                // table.properties[]
            }
            table.contributions[contributionId] = {
                id: contributionId,
                title: paperTitle,
                paperId: paperId,
                contributionLabel: contributionTitle,
                year: '1970',
                contributionData
            };
        }
        setContributions(table);
        /*if (!contributions) {
            const _contributions = await getComparison({ contributionIds, type: 'path', response_hash: null, save_response: false });
            setContributions(_contributions);
        }*/
    }, [contributionIds, contributions]);

    useEffect(() => {
        if (contributionIds.length) {
            fetchContributions();
        }
    }, [contributionIds, fetchContributions]);

    const handleAddContributions = ids => {
        const idsQueryString = [...contributionIds, ...ids].join(',');
        history.push(`${ROUTES.BULK_CONTRIBUTION_EDITOR}?contributions=${idsQueryString}`);
    };

    const handleRemoveContribution = id => {
        const idsQueryString = contributionIds.filter(_id => _id !== id).join(',');
        history.push(`${ROUTES.BULK_CONTRIBUTION_EDITOR}?contributions=${idsQueryString}`);
    };

    return { contributionIds, contributions, handleAddContributions, handleRemoveContribution };
};

export default useBulkContributionEditor;
