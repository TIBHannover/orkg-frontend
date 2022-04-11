import { useEffect, useState } from 'react';
import { PREDICATES, CLASSES } from 'constants/graphSettings';
import { filterSubjectOfStatementsByPredicateAndClass } from 'utils';
import { getVisualization } from 'services/similarity';
import { groupBy } from 'lodash';

const useContributions = ({ paperId, contributionId, contributions }) => {
    const [selectedContribution, setSelectedContribution] = useState(contributionId);
    const [contributionData, setContributionData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingContributionFailed, setLoadingContributionFailed] = useState(false);

    useEffect(() => {
        if (contributions?.length && (selectedContribution !== contributionId || !contributionId)) {
            try {
                console.log(contributions);
                // apply selected contribution
                if (
                    contributionId &&
                    !contributions.some(el => {
                        return el.id === contributionId;
                    })
                ) {
                    throw new Error('Contribution not found');
                }
                const selected =
                    contributionId &&
                    contributions.some(el => {
                        return el.id === contributionId;
                    })
                        ? contributionId
                        : contributions[0].id;
                setSelectedContribution(selected);
            } catch (error) {
                console.log(error);
                setLoadingContributionFailed(true);
            }
        }
    }, [contributionId, contributions, selectedContribution]);

    const getResourceStatements = async (resourceId, data, list) => {
        const statement = data.find(d => d.subject.id === resourceId);
        if (statement) {
            list.push(statement);
        } else {
            return list;
        }
        if (statement.object._class === 'resource') {
            await getResourceStatements(statement.object.id, data, list);
            return list;
        } else {
            return list;
        }
    };

    useEffect(() => {
        getVisualization(paperId).then(async r => {
            setIsLoading(true);
            const contributions = filterSubjectOfStatementsByPredicateAndClass(
                r.data.statements,
                PREDICATES.HAS_CONTRIBUTION,
                false,
                CLASSES.CONTRIBUTION
            );
            const pp = contributions.filter((ele, ind) => ind === contributions.findIndex(elem => elem.id === ele.id));
            //TODO
            const subjectId = pp[0].id;
            const list = [];
            for (const r1 of r.data.statements) {
                if (r1.subject.id === subjectId) {
                    list.push(r1);
                    const response = await getResourceStatements(r1.object.id, r.data.statements, []);
                    list.push(...response);
                }
            }
            const rr = groupBy(list, 'predicate.label');
            setIsLoading(false);
            setContributionData(rr);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paperId, contributionId, contributions]);

    return {
        isLoading,
        isLoadingContributionFailed,
        selectedContribution,
        contributionData
    };
};

export default useContributions;
