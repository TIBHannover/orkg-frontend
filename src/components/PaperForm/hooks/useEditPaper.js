import REGEX from 'constants/regex';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getPaper, markAsUnverified, markAsVerified, updatePaper } from 'services/backend/papers';

const useEditPaper = ({ paperData, afterUpdate }) => {
    const [title, setTitle] = useState('');
    const [publicationMonth, setPublicationMonth] = useState(0);
    const [publicationYear, setPublicationYear] = useState(0);
    const [authors, setAuthors] = useState([]);
    const [doi, setDoi] = useState('');
    const [publishedIn, setPublishedIn] = useState('');
    const [researchField, setResearchField] = useState('');
    const [url, setUrl] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const abstract = useSelector(state => state.viewPaper.abstract);

    const [isLoadingEdit, setIsLoadingEdit] = useState(false);
    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        if (!paperData) {
            return;
        }
        setTitle(paperData.title ?? '');
        setPublicationMonth(paperData.publication_info?.published_month ?? '');
        setPublicationYear(paperData.publication_info?.published_year ?? '');
        setAuthors(paperData.authors ?? []);
        setDoi(paperData.identifiers?.doi?.[0] ?? '');
        setPublishedIn(paperData.publication_info?.published_in ?? '');
        setResearchField(paperData.research_fields?.[0] ?? '');
        setUrl(paperData.publication_info?.url ?? '');
        setIsVerified(!!paperData.verified);
    }, [paperData]);

    const handleSave = async () => {
        try {
            // Validate title
            if (!title || title.trim().length < 1) {
                toast.error('Please enter the title of this paper');
                return;
            }

            // Validate URL
            if (url && !new RegExp(REGEX.URL).test(url.trim())) {
                toast.error('Please enter a valid paper URL');
                return;
            }

            setIsLoadingEdit(true);

            const data = {
                title,
                identifiers: doi
                    ? {
                          doi: [doi],
                      }
                    : null,
                authors,
                research_fields: researchField?.id ? [researchField?.id] : null,
                publication_info: {
                    published_month: publicationMonth ?? null,
                    published_year: publicationYear ?? null,
                    url: url ?? null,
                    published_in: publishedIn.label,
                },
            };

            await updatePaper(paperData.id, data);

            if (!!user && user.isCurationAllowed) {
                if (isVerified) {
                    await markAsVerified(paperData.id, isVerified).catch(() => {});
                } else {
                    await markAsUnverified(paperData.id, isVerified).catch(() => {});
                }
            }

            if (afterUpdate) {
                toast.success('Paper updated successfully');
                // refetch data
                const updatedData = await getPaper(paperData.id);
                afterUpdate(updatedData);
            }
        } catch (e) {
            console.error(e);
            toast.error('Something went wrong while saving the paper');
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
