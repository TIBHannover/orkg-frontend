import { useEffect, useState } from 'react';
import { getVisualization } from 'services/similarity';
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
                const selected = contributionId && contributions.some(el => el.id === contributionId) ? contributionId : contributions[0].id;
                setSelectedContribution(selected);
            } catch (error) {
                console.log(error);
                setLoadingContributionFailed(true);
            }
        }
    }, [contributionId, contributions, selectedContribution]);

    useEffect(() => {
        // getVisualization(paperId).then(async r => {
        setIsLoading(true);
        if (selectedContribution) {
            const statement = paperStatements.find(s => s.subject.id === selectedContribution);
            // TODO
            const subjectId = statement.subject.id;
            const list = [];
            // r1.object.id===selectedResource.id
            // if not selected resource then this
            // else code for selected resource
            for (const r1 of paperStatements) {
                if (r1.subject.id === subjectId) {
                    list.push(r1);
                }
            }
            const rr = groupBy(list, 'predicate.label');
            setContributionData(rr);
        }
        setIsLoading(false);
        // });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paperId, selectedContribution]);

    const handleResourceClick = async e => {
        // const statement = paperStatements.find(s => s.subject.id === e);
        // const subjectId = statement.subject.id;
        console.log(e);
        if (resourceHistory.length === 0) {
            setResourceHistory(v => [
                ...v,
                { id: selectedContribution, label: contributions.find(c => c.id === selectedContribution).label, property: null },
            ]);
        }
        const selectedStmt = paperStatements.find(c => c.object.id === e);
        setResourceHistory(v => [...v, { id: selectedStmt.object.id, label: selectedStmt.object.label, property: selectedStmt.predicate.label }]);
        const list = paperStatements.filter(st => st.subject.id === e);
        console.log(paperStatements.find(c => c.object.id === e).object.label);
        const rr = groupBy(list, 'predicate.label');
        setContributionData(rr);
    };

    const handleBackClick = () => {
        const temp = [...resourceHistory];
        temp.pop();
        if (temp.length === 1) {
            temp.pop();
        }
        console.log(temp.length);
        const index = temp[temp.length - 1];
        console.log(index);
        if (temp[temp.length - 1] && temp.length > 1) {
            const list = paperStatements.filter(st => st.subject.id === index.id);
            console.log(list);
            const rr = groupBy(list, 'predicate.label');
            setContributionData(rr);
        } else {
            const list = paperStatements.filter(st => st.subject.id === selectedContribution);
            console.log(list);
            const rr = groupBy(list, 'predicate.label');
            setContributionData(rr);
        }
        // setResourceHistory(temp);
        setResourceHistory(temp);
    };

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
