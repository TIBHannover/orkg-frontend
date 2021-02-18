import ROUTES from 'constants/routes';
import { uniq } from 'lodash';
import queryString from 'query-string';
import { useCallback } from 'react';
import { useHistory, useLocation } from 'react-router';

const useBulkContributionEditor = () => {
    const location = useLocation();
    const history = useHistory();

    const getContributionIds = useCallback(() => {
        const { contributions } = queryString.parse(location.search, { arrayFormat: 'comma' });
        const contributionIds = contributions && !Array.isArray(contributions) ? [contributions] : contributions;
        return uniq(contributionIds) ?? [];
    }, [location.search]);

    const handleAddContributions = ids => {
        const idsQueryString = [...getContributionIds(), ...ids].join(',');
        history.push(`${ROUTES.BULK_CONTRIBUTION_EDITOR}?contributions=${idsQueryString}`);
    };

    const handleRemoveContribution = id => {
        const idsQueryString = getContributionIds()
            .filter(_id => _id !== id)
            .join(',');
        history.push(`${ROUTES.BULK_CONTRIBUTION_EDITOR}?contributions=${idsQueryString}`);
    };

    // make an object that supports retrieving statements by propertyId and contributionId
    const getStatementsByPropertyIdAndContributionId = statements => {
        const statementsObject = {};
        for (const [statementId, statement] of Object.entries(statements)) {
            if (!(statement.propertyId in statementsObject)) {
                statementsObject[statement.propertyId] = {};
            }
            if (!(statement.contributionId in statementsObject[statement.propertyId])) {
                statementsObject[statement.propertyId][statement.contributionId] = [];
            }
            statementsObject[statement.propertyId][statement.contributionId].push(statementId);
        }
        return statementsObject;
    };

    return {
        handleAddContributions,
        handleRemoveContribution,
        getStatementsByPropertyIdAndContributionId,
        getContributionIds
    };
};

export default useBulkContributionEditor;
