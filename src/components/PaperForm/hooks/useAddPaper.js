import useExistingPaper from 'components/ExistingPaperModal/useExistingPaper';
import useMembership from 'components/hooks/useMembership';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { createPaper } from 'services/backend/papers';
import { createResource } from 'services/backend/resources';
import { createResourceStatement, getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { getErrorMessage } from 'utils';

const useAddPaper = ({ onCreate = null }) => {
    const [doi, setDoi] = useState('');
    const [title, setTitle] = useState('');
    const [researchField, setResearchField] = useState(null);
    const [authors, setAuthors] = useState([]);
    const [publicationMonth, setPublicationMonth] = useState('');
    const [publicationYear, setPublicationYear] = useState('');
    const [publishedIn, setPublishedIn] = useState(null);
    const [abstract, setAbstract] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [url, setUrl] = useState('');
    const [extractedContributionData, setExtractedContributionData] = useState(null);
    const { organizationId, observatoryId } = useMembership();

    const { checkIfPaperExists, ExistingPaperModels } = useExistingPaper();

    const savePaper = async () => {
        try {
            setIsLoading(true); // it is set to false if the paper already exists

            const paperId = await createPaper({
                title,
                research_fields: [researchField.id],
                identifiers: doi
                    ? {
                          doi: [doi],
                      }
                    : null,
                publication_info: {
                    published_month: publicationMonth,
                    published_year: publicationYear,
                    published_in: publishedIn?.label || null,
                    url,
                },
                authors,
                observatories: observatoryId ? [observatoryId] : [],
                organizations: organizationId ? [organizationId] : [],
                ...(extractedContributionData && { contents: extractedContributionData }),
            });

            let contributionId = null;
            // if there are no contributions created yet, create a new one
            if (!extractedContributionData) {
                const contribution = await createResource('Contribution 1', [CLASSES.CONTRIBUTION]);
                await createResourceStatement(paperId, PREDICATES.HAS_CONTRIBUTION, contribution.id);
                contributionId = contribution.id;
            } else {
                const statements = getStatementsBySubjectAndPredicate({ subjectId: paperId, predicateId: PREDICATES.HAS_CONTRIBUTION });
                if (statements.length > 0) {
                    contributionId = statements[0].object.id;
                }
            }

            if (onCreate) {
                onCreate({
                    paperId,
                    contributionId,
                });
            }
        } catch (e) {
            console.error(e);
            toast.error(`Something went wrong while saving this paper: ${getErrorMessage(e)}`);
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!title || title.trim().length < 1) {
            toast.error('Please enter the title of your paper or click on "Lookup" if you entered the DOI');
            return;
        }
        if (!researchField?.id) {
            toast.error('Please select a research field');
            return;
        }

        setIsLoading(true);

        if (await checkIfPaperExists({ doi, title, continueNext: true })) {
            setIsLoading(false);
            return;
        }
        savePaper();
    };

    return {
        doi,
        title,
        researchField,
        authors,
        publicationMonth,
        publicationYear,
        publishedIn,
        isLoading,
        url,
        abstract,
        setDoi,
        setTitle,
        setResearchField,
        setAuthors,
        setPublicationMonth,
        setPublicationYear,
        setPublishedIn,
        setUrl,
        setAbstract,
        extractedContributionData,
        setExtractedContributionData,
        ExistingPaperModels,
        handleSave,
        savePaper,
    };
};

export default useAddPaper;
