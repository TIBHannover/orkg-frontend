import { useEffect, useState, useCallback } from 'react';
import { groupBy, uniqBy } from 'lodash';
import { CLASSES } from 'constants/graphSettings';

const useContributions = ({ paperId, contributionId, contributions, paperStatements }) => {
    const [selectedContribution, setSelectedContribution] = useState(contributionId);
    const [contributionData, setContributionData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingContributionFailed, setLoadingContributionFailed] = useState(false);
    const [resourceHistory, setResourceHistory] = useState([]);
    const [activeTableId, setActiveTableId] = useState(null);

    useEffect(() => {
        if (contributions?.length && (selectedContribution !== contributionId || !contributionId)) {
            try {
                // apply selected contribution
                if (contributionId && !contributions.some((el) => el.id === contributionId)) {
                    throw new Error('Contribution not found');
                }
                setResourceHistory([]);
                setActiveTableId(null);
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

    const handleResourceClick = (s) => {
        if (s.object.classes && s.object.classes.includes(CLASSES.CSVW_TABLE)) {
            setActiveTableId((prevId) => (prevId === s.object.id ? null : s.object.id));
        } else {
            showResourceStatements(s.object.id);
        }
        if (resourceHistory.length === 0) {
            setResourceHistory([{ id: selectedContribution, label: contributions.find((c) => c.id === selectedContribution).label, property: null }]);
        }
        setResourceHistory((v) => [...v, { id: s.object.id, label: s.object.label, property: s.predicate.label }]);
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
        setActiveTableId(null);
        showResourceStatements(element);
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
        activeTableId,
    };
};

export default useContributions;
