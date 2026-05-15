import { toast } from '@heroui/react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import useAuthentication from '@/components/hooks/useAuthentication';
import { Author, PublishedIn, ResearchField } from '@/components/PaperForm/types';
import REGEX from '@/constants/regex';
import { getPaper, updatePaper } from '@/services/backend/papers';
import { Paper, UpdatePaperParams } from '@/services/backend/types';

type UseEditPaperArgs = {
    paperData?: Paper | null;
    afterUpdate?: (updated: Paper) => void;
};

const toIntOrNull = (value: string): number | null => {
    if (value === '' || value === null) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};

const useEditPaper = ({ paperData, afterUpdate }: UseEditPaperArgs) => {
    const [title, setTitle] = useState('');
    const [publicationMonth, setPublicationMonth] = useState<string>('');
    const [publicationYear, setPublicationYear] = useState<string>('');
    const [authors, setAuthors] = useState<Author[]>([]);
    const [doi, setDoi] = useState('');
    const [publishedIn, setPublishedIn] = useState<PublishedIn>(null);
    const [researchField, setResearchField] = useState<ResearchField>(null);
    const [url, setUrl] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const abstract = useSelector((state: { viewPaper: { abstract: string } }) => state.viewPaper.abstract);

    const [isLoadingEdit, setIsLoadingEdit] = useState(false);
    const { user } = useAuthentication();

    useEffect(() => {
        if (!paperData) {
            return;
        }
        setTitle(paperData.title ?? '');
        const pubMonth = paperData.publication_info?.published_month;
        const pubYear = paperData.publication_info?.published_year;
        setPublicationMonth(pubMonth != null ? String(pubMonth) : '');
        setPublicationYear(pubYear != null ? String(pubYear) : '');
        setAuthors(paperData.authors ?? []);
        setDoi(paperData.identifiers?.doi?.[0] ?? '');
        const pubIn = paperData.publication_info?.published_in;
        setPublishedIn(pubIn ? { id: pubIn.id, label: pubIn.label } : null);
        setResearchField(paperData.research_fields?.[0] ?? null);
        setUrl(paperData.publication_info?.url ?? '');
        setIsVerified(!!paperData.verified);
    }, [paperData]);

    const handleSave = async () => {
        if (!paperData) return;
        try {
            if (!title || title.trim().length < 1) {
                toast.danger('Please enter the title of this paper');
                return;
            }

            if (url && !new RegExp(REGEX.URL).test(url.trim())) {
                toast.danger('Please enter a valid paper URL');
                return;
            }

            setIsLoadingEdit(true);
            const data = {
                title,
                identifiers: {
                    doi: doi ? [doi] : [],
                },
                authors,
                research_fields: researchField?.id ? [researchField.id] : [],
                publication_info: {
                    published_month: toIntOrNull(publicationMonth),
                    published_year: toIntOrNull(publicationYear),
                    url: url || null,
                    published_in: publishedIn?.label ?? null,
                },
                ...(!!user && user.isCurationAllowed && { verified: isVerified }),
            };

            await updatePaper(paperData.id, data as unknown as UpdatePaperParams);

            if (afterUpdate) {
                toast.success('Paper updated successfully');
                const updatedData = await getPaper(paperData.id);
                afterUpdate(updatedData);
            }
        } catch (e) {
            console.error(e);
            toast.danger('Something went wrong while saving the paper');
        } finally {
            setIsLoadingEdit(false);
        }
    };

    return {
        doi,
        setDoi,
        title,
        setTitle,
        url,
        setUrl,
        researchField,
        setResearchField,
        publishedIn,
        setPublishedIn,
        authors,
        setAuthors,
        publicationYear,
        setPublicationYear,
        publicationMonth,
        setPublicationMonth,
        handleSave,
        isLoadingEdit,
        isVerified,
        setIsVerified,
        abstract,
    };
};

export default useEditPaper;
