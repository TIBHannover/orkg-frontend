import { groupBy, uniqBy } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

const useContributions = ({ paperId, contributionId, contributions, paperStatements }) => {
    const [selectedContribution, setSelectedContribution] = useState(contributionId);
    const [contributionData, setContributionData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingContributionFailed, setLoadingContributionFailed] = useState(false);

    useEffect(() => {
        if (contributions?.length && (selectedContribution !== contributionId || !contributionId)) {
            try {
                // apply selected contribution
                if (contributionId && !contributions.some((el) => el.id === contributionId)) {
                    throw new Error('Contribution not found');
                }
                const selected = contributionId && contributions.some((el) => el.id === contributionId) ? contributionId : contributions[0].id;
                setSelectedContribution(selected);
            } catch (error) {
                console.error(error);
                setLoadingContributionFailed(true);
            }
        }
    }, [contributionId, contributions, selectedContribution]);

    const showResourceStatements = useCallback(
        (id) => {
            const list = paperStatements.filter((st) => st.subject.id === id);
            setContributionData(groupBy(uniqBy(list, 'object.id'), 'predicate.id'));
        },
        [paperStatements],
    );

    const loadContributionData = useCallback(() => {
        setIsLoading(true);
        if (selectedContribution) {
            showResourceStatements(selectedContribution);
        }
        setIsLoading(false);
    }, [selectedContribution, showResourceStatements]);

    useEffect(() => {
        loadContributionData();
    }, [paperId, paperStatements, selectedContribution, loadContributionData]);

    return {
        isLoading,
        isLoadingContributionFailed,
        selectedContribution,
        contributionData,
    };
};

export default useContributions;
