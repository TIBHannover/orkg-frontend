import { useEffect, useState, useCallback } from 'react';
import { groupBy } from 'lodash';

const useContributions = ({ paperId, contributionId, contributions, paperStatements }) => {
    const [selectedContribution, setSelectedContribution] = useState(contributionId);
    const [contributionData, setContributionData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingContributionFailed, setLoadingContributionFailed] = useState(false);
    const [resourceHistory, setResourceHistory] = useState([]);

    useEffect(() => {
        if (contributions?.length && (selectedContribution !== contributionId || !contributionId)) {
            try {
                // apply selected contribution
                if (contributionId && !contributions.some(el => el.id === contributionId)) {
                    throw new Error('Contribution not found');
                }
                setResourceHistory([]);
                const selected = contributionId && contributions.some(el => el.id === contributionId) ? contributionId : contributions[0].id;
                setSelectedContribution(selected);
            } catch (error) {
                console.log(error);
                setLoadingContributionFailed(true);
            }
        }
    }, [contributionId, contributions, selectedContribution]);

    const updateContributionStatements = useCallback(
        id => {
            const list = paperStatements.filter(st => st.subject.id === id);
            const rr = groupBy(list, 'predicate.label');
            setContributionData(rr);
        },
        [paperStatements],
    );

    const loadContributionData = useCallback(() => {
        setIsLoading(true);
        if (selectedContribution) {
            updateContributionStatements(selectedContribution);
        }
        setIsLoading(false);
    }, [selectedContribution, updateContributionStatements]);

    const handleResourceClick = async e => {
        if (resourceHistory.length === 0) {
            setResourceHistory([{ id: selectedContribution, label: contributions.find(c => c.id === selectedContribution).label, property: null }]);
        }
        setResourceHistory(v => [...v, { id: e.object.id, label: e.object.label, property: e.predicate.label }]);
        updateContributionStatements(e.object.id);
    };

    const handleBackClick = (id = '', index = '') => {
        const temp = [...resourceHistory];
        let element = '';
        if (id !== '' && index !== '') {
            temp.splice(index + 1, temp.length - 1);
        } else {
            temp.pop();
        }
        if (temp.length === 1) {
            temp.pop();
            element = selectedContribution;
        }
        if (temp.length && temp.length > 1) {
            element = temp[temp.length - 1].id;
        }
        updateContributionStatements(element);
        setResourceHistory(temp);
    };

    useEffect(() => {
        loadContributionData();
    }, [paperId, paperStatements, selectedContribution, loadContributionData]);

    return {
        isLoading,
        isLoadingContributionFailed,
        selectedContribution,
        contributionData,
        handleResourceClick,
        resourceHistory,
        handleBackClick,
    };
};

export default useContributions;
