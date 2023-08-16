import useExistingPaper from 'components/ExistingPaperModal/useExistingPaper';
import { PREDICATES } from 'constants/graphSettings';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { saveFullPaper } from 'services/backend/papers';
import { getStatementsBySubject } from 'services/backend/statements';
import { getErrorMessage } from 'utils';

const useAddPaper = ({ onCreate = null }) => {
    const [doi, setDoi] = useState('');
    const [title, setTitle] = useState('');
    const [researchField, setResearchField] = useState({});
    const [authors, setAuthors] = useState([]);
    const [publicationMonth, setPublicationMonth] = useState('');
    const [publicationYear, setPublicationYear] = useState('');
    const [publishedIn, setPublishedIn] = useState({});
    const [abstract, setAbstract] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [url, setUrl] = useState('');
    const [extractedContributionData, setExtractedContributionData] = useState([]);

    const { checkIfPaperExists, ExistingPaperModels } = useExistingPaper();

    const savePaper = async () => {
        try {
            setIsLoading(true); // it is set to false if the paper already exists

            const paperObject = {
                paper: {
                    title,
                    doi,
                    authors: authors.map(author => ({
                        label: author.label,
                        ...(author.label !== author.id ? { id: author.id } : {}),
                        ...(author.orcid ? { orcid: author.orcid } : {}),
                    })),
                    publicationMonth,
                    publicationYear,
                    publishedIn: publishedIn.label || '', // replace by publishedIn.id when backend supports this
                    url,
                    researchField: researchField.id,
                    contributions:
                        extractedContributionData.length > 0
                            ? extractedContributionData
                            : [
                                  {
                                      name: 'Contribution 1',
                                  },
                              ],
                },
            };
            const paper = await saveFullPaper(paperObject);

            if (onCreate) {
                // get and return the newly created contribution ID
                const paperStatements = await getStatementsBySubject({ id: paper.id });
                const contributionStatement = paperStatements.find(statement => statement.predicate.id === PREDICATES.HAS_CONTRIBUTION);
                onCreate({
                    paperId: paper.id,
                    contributionId: contributionStatement.object.id,
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
        if (!researchField.id) {
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
