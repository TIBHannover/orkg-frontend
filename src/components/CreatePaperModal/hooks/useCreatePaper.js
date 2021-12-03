import { MISC, PREDICATES } from 'constants/graphSettings';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { saveFullPaper } from 'services/backend/papers';
import { getStatementsBySubject } from 'services/backend/statements';

const useCreatePaper = () => {
    const [isLoading, setIsLoading] = useState(false);

    const createPaper = async ({ title, month, year, authors, doi, publishedIn, researchField, url, setOpenItem }) => {
        if (!title) {
            toast.error('Enter a paper title');
            setOpenItem('title');
            return;
        }
        if (!researchField) {
            toast.error("Enter the paper's research field");
            setOpenItem('researchField');
            return;
        }
        setIsLoading(true);

        const paper = {
            title,
            doi,
            authors: authors.map(author => ({
                label: author.label,
                id: author.id !== author.label ? author.id : undefined,
                orcid: author.orcid || undefined
            })),
            publicationMonth: month,
            publicationYear: year,
            researchField: researchField?.id || MISC.RESEARCH_FIELD_MAIN,
            url,
            publishedIn,
            contributions: [
                {
                    name: 'Contribution 1'
                }
            ]
        };

        const createdPaper = await saveFullPaper({ paper });

        // get and return the newly created contribution ID
        const paperStatements = await getStatementsBySubject({ id: createdPaper.id });
        const contributionStatement = paperStatements.find(statement => statement.predicate.id === PREDICATES.HAS_CONTRIBUTION);
        setIsLoading(false);
        toast.success('Paper successfully created');

        return {
            paperId: createdPaper.id,
            contributionId: contributionStatement.object.id
        };
    };

    return { isLoading, createPaper };
};

export default useCreatePaper;
