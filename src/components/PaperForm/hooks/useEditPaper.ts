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
        const pubMonth = paperData.publicationInfo?.publishedMonth;
        const pubYear = paperData.publicationInfo?.publishedYear;
        setPublicationMonth(pubMonth != null ? String(pubMonth) : '');
        setPublicationYear(pubYear != null ? String(pubYear) : '');
        setAuthors(paperData.authors ?? []);
        setDoi(paperData.identifiers?.doi?.[0] ?? '');
        const pubIn = paperData.publicationInfo?.publishedIn;
        setPublishedIn(pubIn ? { id: pubIn.id, label: pubIn.label } : null);
        setResearchField(paperData.researchFields?.[0] ?? null);
        setUrl(paperData.publicationInfo?.url ?? '');
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
            const data: UpdatePaperParams = {
                title,
                identifiers: {
                    doi: doi ? [doi] : [],
                },
                authors,
                researchFields: researchField?.id ? [researchField.id] : [],
                publicationInfo: {
                    publishedMonth: toIntOrNull(publicationMonth),
                    publishedYear: toIntOrNull(publicationYear),
                    url: url || null,
                    publishedIn: publishedIn?.label ?? null,
                },
                ...(!!user && user.isCurationAllowed && { verified: isVerified }),
            };

            await updatePaper(paperData.id, data);

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
