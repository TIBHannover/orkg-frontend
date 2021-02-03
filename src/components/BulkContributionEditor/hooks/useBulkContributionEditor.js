import { CLASSES, PREDICATES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { uniq } from 'lodash';
import queryString from 'query-string';
import { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import { getStatementsByObjectAndPredicate, getStatementsBySubjects } from 'services/backend/statements';

const useBulkContributionEditor = () => {
    const location = useLocation();
    const history = useHistory();
    const [contributions, setContributions] = useState([]);

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

        const _contributions = [];
        for (const contributionId of contributionIds) {
            const paperStatements = await getStatementsByObjectAndPredicate({ objectId: contributionId, predicateId: PREDICATES.HAS_CONTRIBUTION });
            const { label: paperTitle, id: paperId } = paperStatements.find(statement => statement.subject.classes.includes(CLASSES.PAPER))?.subject;
            const { statements } = contributionStatements.find(result => result.id === contributionId) || [];

            _contributions.push({
                paper: {
                    title: paperTitle,
                    id: paperId
                },
                contributionStatements: statements
            });
        }

        setContributions(_contributions);
    }, [contributionIds]);

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
