import { createProperty } from 'actions/contributionEditor';
import TableCell from 'components/ContributionEditor/TableCell';
import TableHeaderColumn from 'components/ContributionEditor/TableHeaderColumn';
import TableHeaderColumnFirst from 'components/ContributionEditor/TableHeaderColumnFirst';
import TableHeaderRow from 'components/ContributionEditor/TableHeaderRow';
import { PREDICATES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { sortBy, uniq, without } from 'lodash';
import queryString from 'query-string';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router';

const useContributionEditor = () => {
    const location = useLocation();
    const history = useHistory();
    const dispatch = useDispatch();

    const getContributionIds = useCallback(() => {
        const { contributions } = queryString.parse(location.search, { arrayFormat: 'comma' });
        const contributionIds = contributions && !Array.isArray(contributions) ? [contributions] : contributions;
        return without(uniq(contributionIds), undefined, null, '') ?? [];
    }, [location.search]);

    const handleAddContributions = ids => {
        const idsQueryString = [...getContributionIds(), ...ids].join(',');
        history.push(`${ROUTES.CONTRIBUTION_EDITOR}?contributions=${idsQueryString}`);
    };

    const handleRemoveContribution = id => {
        const idsQueryString = getContributionIds()
            .filter(_id => _id !== id)
            .join(',');
        history.push(`${ROUTES.CONTRIBUTION_EDITOR}?contributions=${idsQueryString}`);
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

    const Cell = useCallback(
        cell => <TableCell values={cell.value} contributionId={cell.column.id} propertyId={cell.row.original.property.id} />,
        []
    );

    const generateTableMatrix = useCallback(
        ({ contributions, papers, statements, properties, resources, literals }) => {
            const statementsByPropertyIdAndContributionId = getStatementsByPropertyIdAndContributionId(statements);

            // ensure there is always a research problem row
            if (Object.keys(contributions).length && !(PREDICATES.HAS_RESEARCH_PROBLEM in properties)) {
                dispatch(createProperty({ action: 'select-option', id: PREDICATES.HAS_RESEARCH_PROBLEM }));
            }

            let data = [];
            let columns = [];

            data = Object.keys(properties).map(propertyId => ({
                property: properties[propertyId],
                values: Object.keys(contributions).map(
                    contributionId =>
                        sortBy(
                            statementsByPropertyIdAndContributionId?.[propertyId]?.[contributionId]?.map(statementId => ({
                                ...(statements[statementId].type === 'resource'
                                    ? resources[statements[statementId].objectId]
                                    : literals[statements[statementId].objectId]),
                                statementId
                            })),
                            value => value?.label?.trim().toLowerCase()
                        ) || [{}]
                )
            }));

            data = sortBy(data, date => date.property.label.trim().toLowerCase());

            columns = [
                {
                    Header: <TableHeaderColumnFirst />,
                    accessor: 'property',
                    sticky: 'left',
                    minWidth: 250,
                    Cell: cell => <TableHeaderRow property={cell.value} />
                },
                ...Object.keys(contributions).map((contributionId, i) => {
                    const contribution = contributions[contributionId];
                    return {
                        id: contributionId,
                        Header: () => <TableHeaderColumn contribution={contribution} paper={papers[contribution.paperId]} key={contributionId} />,
                        accessor: d => d.values[i],
                        Cell: Cell
                    };
                })
            ];

            return { data, columns };
        },
        [Cell, dispatch]
    );

    return {
        handleAddContributions,
        handleRemoveContribution,
        getContributionIds,
        generateTableMatrix
    };
};

export default useContributionEditor;
