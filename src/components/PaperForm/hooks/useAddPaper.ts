import { toast } from '@heroui/react';
import { useState } from 'react';

import useExistingPaper from '@/components/ExistingPaperModal/useExistingPaper';
import useMembership from '@/components/hooks/useMembership';
import { Author, PublishedIn, ResearchField } from '@/components/PaperForm/types';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import { createPaper } from '@/services/backend/papers';
import { createResource } from '@/services/backend/resources';
import { createResourceStatement, getStatements } from '@/services/backend/statements';
import { CreatePaperContents } from '@/services/backend/types';
import { getErrorMessage } from '@/utils';

type UseAddPaperArgs = {
    onCreate?: (args: { paperId: string; contributionId: string }) => void;
};

const toIntOrNull = (value: string): number | null => {
    if (value === '' || value === null) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};

const useAddPaper = ({ onCreate }: UseAddPaperArgs = {}) => {
    const [doi, setDoi] = useState('');
    const [title, setTitle] = useState('');
    const [researchField, setResearchField] = useState<ResearchField>(null);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [publicationMonth, setPublicationMonth] = useState<string>('');
    const [publicationYear, setPublicationYear] = useState<string>('');
    const [publishedIn, setPublishedIn] = useState<PublishedIn>(null);
    const [abstract, setAbstract] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [url, setUrl] = useState('');
    const [extractedContributionData, setExtractedContributionData] = useState<unknown>(null);
    const { organizationId, observatoryId } = useMembership();

    const { checkIfPaperExists, ExistingPaperModals } = useExistingPaper();

    const savePaper = async () => {
        try {
            setIsLoading(true);

            const paperId = await createPaper({
                title,
                research_fields: researchField ? [researchField.id] : [],
                identifiers: doi ? { doi: [doi] } : undefined,
                publication_info: {
                    published_month: toIntOrNull(publicationMonth),
                    published_year: toIntOrNull(publicationYear),
                    published_in: publishedIn?.label || null,
                    url,
                },
                authors,
                observatories: observatoryId ? [observatoryId] : [],
                organizations: organizationId ? [organizationId] : [],
                ...(extractedContributionData ? { contents: extractedContributionData as CreatePaperContents } : {}),
            });

            let contributionId: string | null = null;
            if (!extractedContributionData) {
                contributionId = await createResource({ label: 'Contribution 1', classes: [CLASSES.CONTRIBUTION] });
                await createResourceStatement(paperId, PREDICATES.HAS_CONTRIBUTION, contributionId);
            } else {
                const statements = await getStatements({ subjectId: paperId, predicateId: PREDICATES.HAS_CONTRIBUTION });
                if (statements.length > 0) {
                    contributionId = statements[0].object.id;
                }
            }

            onCreate?.({ paperId, contributionId: contributionId as string });
        } catch (e) {
            console.error(e);
            toast.danger(`Something went wrong while saving this paper: ${getErrorMessage(e as object) ?? ''}`);
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!title || title.trim().length < 1) {
            toast.danger('Please enter the title of your paper or click on "Lookup" if you entered the DOI');
            return;
        }
        if (!researchField?.id) {
            toast.danger('Please select a research field');
            return;
        }

        setIsLoading(true);

        if (await checkIfPaperExists({ doi, title })) {
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
        ExistingPaperModals,
        handleSave,
        savePaper,
    };
};

export default useAddPaper;
