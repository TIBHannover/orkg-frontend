import { useEffect, useState } from 'react';
import { createResourceStatement, getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { createResource } from 'services/backend/resources';
import { CLASSES, PREDICATES } from 'constants/graphSettings';

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
            const contributionStatements = await getStatementsBySubjectAndPredicate({ subjectId: paperId, predicateId: PREDICATES.HAS_CONTRIBUTION });
            const contributionCount = contributionStatements.length;
            const title = contributionStatements.length ? contributionStatements[0].subject.label : '';
            setContributionCount(contributionCount);
            setPaperTitle(title);
            setIsLoadingPaper(false);
        };

        fetchPaperData();
    }, [isOpen, paperId]);

    const createContribution = async title => {
        setIsLoading(true);
        const { id } = await createResource(title, [CLASSES.CONTRIBUTION]);
        await createResourceStatement(paperId, PREDICATES.HAS_CONTRIBUTION, id);
        setIsLoading(false);
        return id;
    };

    return { isLoading, isLoadingPaper, createContribution, paperTitle, contributionCount };
};

export default useCreateContribution;
