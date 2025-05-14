import { useEffect, useState } from 'react';

import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import { createResource } from '@/services/backend/resources';
import { createResourceStatement, getStatements } from '@/services/backend/statements';

const useCreateContribution = ({ paperId, isOpen }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPaper, setIsLoadingPaper] = useState(false);
    const [paperTitle, setPaperTitle] = useState('');
    const [contributionCount, setContributionCount] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            return;
        }
        const fetchPaperData = async () => {
            setIsLoadingPaper(true);
            const contributionStatements = await getStatements({ subjectId: paperId, predicateId: PREDICATES.HAS_CONTRIBUTION });
            const contributionCount = contributionStatements.length;
            const title = contributionStatements.length ? contributionStatements[0].subject.label : '';
            setContributionCount(contributionCount);
            setPaperTitle(title);
            setIsLoadingPaper(false);
        };

        fetchPaperData();
    }, [isOpen, paperId]);

    const createContribution = async (title) => {
        setIsLoading(true);
        const id = await createResource({ label: title, classes: [CLASSES.CONTRIBUTION] });
        await createResourceStatement(paperId, PREDICATES.HAS_CONTRIBUTION, id);
        setIsLoading(false);
        return id;
    };

    return { isLoading, isLoadingPaper, createContribution, paperTitle, contributionCount };
};

export default useCreateContribution;
