import Confirm from 'components/Confirmation/Confirmation';
import TableCell from 'components/ContributionEditor/TableCell';
import TableHeaderColumn from 'components/ContributionEditor/TableHeaderColumn';
import TableHeaderColumnFirst from 'components/ContributionEditor/TableHeaderColumnFirst';
import TableHeaderRow from 'components/ContributionEditor/TableHeaderRow';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import TemplateTooltip from 'components/TemplateTooltip/TemplateTooltip';
import ROUTES from 'constants/routes';
import { difference, intersection, sortBy, uniq, without } from 'lodash';
import { reverse } from 'named-urls';
import { useCallback } from 'react';
import { getResource, updateResourceClasses } from 'services/backend/resources';
import { getTemplates } from 'services/backend/templates';

const useContributionEditor = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const getContributionIds = useCallback(() => {
        const contributions = searchParams.get('contributions')?.split(',') ?? []; // TODO use getAll() and don't split by comma, but provide multiple values for the same key (contribution=R1&contribution=R2)
        const contributionIds = contributions && !Array.isArray(contributions) ? [contributions] : contributions;
        return without(uniq(contributionIds), undefined, null, '') ?? [];
    }, [searchParams]);

    const hasPreviousVersion = searchParams.get('hasPreviousVersion');

    const handleAddContributions = async (ids) => {
        // get the list of current common classes
        const currentContributionIds = getContributionIds();
        const currentContributionObjects = await Promise.all(currentContributionIds.map((id) => getResource(id)));
        const commonClasses = intersection(...currentContributionObjects.map((c) => c.classes));
        // get the list of common classes of newly added contributions
        const newContributionObjects = await Promise.all(ids.map((id) => getResource(id)));
        const newCommonClasses = intersection(...newContributionObjects.map((c) => c.classes));
        // Ask the user if they want to apply the current common classes to the newly added contributions ids
        const classesNeedToApply = difference(commonClasses, newCommonClasses);
        if (classesNeedToApply.length > 0) {
            let templatesNeedToApply = await Promise.all(classesNeedToApply.map((id) => getTemplates({ targetClass: id })));
            templatesNeedToApply = templatesNeedToApply.map((t) => t.content?.[0]);
            if (templatesNeedToApply.length > 0) {
                const isConfirmed = await Confirm({
                    title: 'Apply templates',
                    message: (
                        <>
                            <p>We found that the newly added contributions are not instances of the following templates:</p>
                            <ul>
                                {templatesNeedToApply.map((t) => (
                                    <li key={`c${t.id}`}>
                                        <TemplateTooltip id={t.id}>
                                            <Link target="_blank" href={reverse(ROUTES.TEMPLATE, { id: t.id })}>
                                                {t.label}
                                            </Link>
                                        </TemplateTooltip>
                                    </li>
                                ))}
                            </ul>
                            <p>Would you like to make them instances?</p>
                        </>
                    ),
                    proceedLabel: 'Apply',
                });
                if (isConfirmed) {
                    await Promise.all(
                        newContributionObjects.map((newCont) => updateResourceClasses(newCont.id, uniq([...newCont.classes, ...classesNeedToApply]))),
                    );
                }
            }
        }
        const idsQueryString = [...getContributionIds(), ...ids].join(',');
        router.push(
            `${ROUTES.CONTRIBUTION_EDITOR}?contributions=${idsQueryString}${hasPreviousVersion ? `&hasPreviousVersion=${hasPreviousVersion}` : ''}`,
        );
    };

    const handleRemoveContribution = (id) => {
        const idsQueryString = getContributionIds()
            .filter((_id) => _id !== id)
            .join(',');
        router.push(
            `${ROUTES.CONTRIBUTION_EDITOR}?contributions=${idsQueryString}${hasPreviousVersion ? `&hasPreviousVersion=${hasPreviousVersion}` : ''}`,
        );
    };

    // make an object that supports retrieving statements by propertyId and contributionId
    const getStatementsByPropertyIdAndContributionId = (statements) => {
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
        (cell) => <TableCell values={cell.value} contributionId={cell.column.id} propertyId={cell.row.original.property.id} />,
        [],
    );

    const generateTableMatrix = useCallback(
        ({ contributions, papers, statements, properties, resources, literals }) => {
            const statementsByPropertyIdAndContributionId = getStatementsByPropertyIdAndContributionId(statements);

            let data = [];
            let columns = [];

            data = Object.keys(properties).map((propertyId) => ({
                property: properties[propertyId],
                values: Object.keys(contributions).map(
                    (contributionId) =>
                        sortBy(
                            statementsByPropertyIdAndContributionId?.[propertyId]?.[contributionId]?.map((statementId) => ({
                                ...(statements[statementId].type === 'resource'
                                    ? resources[statements[statementId].objectId]
                                    : literals[statements[statementId].objectId]),
                                statementId,
                            })),
                            (value) => value?.label?.trim().toLowerCase(),
                        ) || [{}],
                ),
            }));

            data = sortBy(data, (date) => date.property.label.trim().toLowerCase());

            columns = [
                {
                    Header: <TableHeaderColumnFirst />,
                    accessor: 'property',
                    sticky: 'left',
                    minWidth: 250,
                    Cell: (cell) => <TableHeaderRow property={cell.value} />,
                },
                ...Object.keys(contributions).map((contributionId, i) => {
                    const contribution = contributions[contributionId];
                    return {
                        id: contributionId,
                        Header: () => <TableHeaderColumn contribution={contribution} paper={papers[contribution.paperId]} key={contributionId} />,
                        accessor: (d) => d.values[i],
                        Cell,
                    };
                }),
            ];

            return { data, columns };
        },
        [Cell],
    );

    return {
        handleAddContributions,
        handleRemoveContribution,
        getContributionIds,
        generateTableMatrix,
    };
};

export default useContributionEditor;
