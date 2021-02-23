import TableCell from 'components/BulkContributionEditor/TableCell';
import TableHeaderColumn from 'components/BulkContributionEditor/TableHeaderColumn';
import TableHeaderRow from 'components/BulkContributionEditor/TableHeaderRow';
import { Properties, PropertiesInner } from 'components/Comparison/styled';
import ROUTES from 'constants/routes';
import { sortBy, uniq } from 'lodash';
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

    const Cell = useCallback(cell => <TableCell values={cell.value} contributionId={cell.column.id} propertyId={cell.row.property.id} />, []);

    const generateTableMatrix = useCallback(({ contributions, papers, statements, properties, resources, literals }) => {
        const statementsByPropertyIdAndContributionId = getStatementsByPropertyIdAndContributionId(statements);

        let data = [];
        let columns = [];

        if (Object.keys(statements).length) {
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
                    Header: (
                        <Properties>
                            <PropertiesInner transpose={false} className="first">
                                Properties
                            </PropertiesInner>
                        </Properties>
                    ),
                    accessor: 'property',
                    fixed: 'left',
                    Cell: cell => <TableHeaderRow property={cell.value} />,
                    width: 250
                },
                ...Object.keys(contributions).map((contributionId, i) => {
                    const contribution = contributions[contributionId];
                    return {
                        id: contributionId,
                        Header: () => <TableHeaderColumn contribution={contribution} paper={papers[contribution.paperId]} key={contributionId} />,
                        accessor: d => d.values[i],
                        Cell: Cell,
                        width: 250
                    };
                })
            ];
        }

        return { data, columns };
    }, []);

    return {
        handleAddContributions,
        handleRemoveContribution,
        getContributionIds,
        generateTableMatrix
    };
};

export default useBulkContributionEditor;
