import { faCode, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup, toast } from '@heroui/react';
import { Dispatch, SetStateAction, useState } from 'react';

import useOverwriteValuesModal from '@/components/PaperForm/hooks/useOverwriteValuesModal';
import { Author, PublishedIn, ResearchField } from '@/components/PaperForm/types';
import BibTexModal, { BibTexUpdateData } from '@/components/ViewPaper/BibTexModal/BibTexModal';
import UploadPdfModal from '@/components/ViewPaper/UploadPdfModal/UploadPdfModal';

type PdfUpdateData = {
    title?: string;
    doi?: string;
    authors?: Author[];
    researchField?: ResearchField;
    extractedContributionData?: unknown;
};

type Props = {
    doi: string;
    title: string;
    authors: Author[];
    publicationMonth: string;
    publicationYear: string;
    publishedIn: PublishedIn;
    url: string;
    setDoi: Dispatch<SetStateAction<string>>;
    setTitle: Dispatch<SetStateAction<string>>;
    setResearchField: Dispatch<SetStateAction<ResearchField>>;
    setAuthors: Dispatch<SetStateAction<Author[]>>;
    setPublicationMonth: Dispatch<SetStateAction<string>>;
    setPublicationYear: Dispatch<SetStateAction<string>>;
    setPublishedIn: Dispatch<SetStateAction<PublishedIn>>;
    setUrl: Dispatch<SetStateAction<string>>;
    setIsMetadataExpanded: Dispatch<SetStateAction<boolean>>;
    setExtractedContributionData: Dispatch<SetStateAction<unknown>>;
};

const AddPaperAdditionalButtons = ({
    doi,
    title,
    authors,
    publicationMonth,
    publicationYear,
    publishedIn,
    url,
    setDoi,
    setTitle,
    setResearchField,
    setAuthors,
    setPublicationMonth,
    setPublicationYear,
    setPublishedIn,
    setUrl,
    setIsMetadataExpanded,
    setExtractedContributionData,
}: Props) => {
    const [isOpenPdfModal, setIsOpenPdfModal] = useState(false);
    const [isOpenBibTexModal, setIsOpenBibTexModal] = useState(false);
    const { shouldUpdateValues, OverwriteValuesModal } = useOverwriteValuesModal();

    const handleUpdateDataFromPdf = async (newData: PdfUpdateData) => {
        if (
            await shouldUpdateValues({
                currentData: {
                    title,
                    doi,
                    authors,
                },
                newData: {
                    title: newData.title,
                    doi: newData.doi,
                    authors: newData.authors,
                },
            })
        ) {
            setDoi(newData.doi ?? '');
            setTitle(newData.title ?? '');
            setAuthors(newData.authors ?? []);
            setResearchField(newData.researchField ?? null);
            toast.success('Data successfully extracted');

            if (newData?.extractedContributionData) {
                setExtractedContributionData(newData.extractedContributionData);
                toast.success('SciKGTeX contribution data is extracted and will be added to the paper');
            }
            setIsMetadataExpanded(true);
        }
    };

    const handleUpdateDataFromBibTex = async (newData: BibTexUpdateData) => {
        if (
            await shouldUpdateValues({
                currentData: {
                    doi,
                    title,
                    authors: authors.map((author) => ({ label: author.name, orcid: author.identifiers?.orcid?.[0] })),
                    publicationMonth,
                    publicationYear,
                    publishedIn: publishedIn?.label ?? '',
                    url,
                },
                newData: {
                    doi: newData.doi,
                    title: newData.title,
                    authors: newData.authors,
                    publicationMonth: newData.publicationMonth,
                    publicationYear: newData.publicationYear,
                    publishedIn: newData.publishedIn?.label ?? '',
                    url: newData.url,
                },
            })
        ) {
            setDoi(newData.doi);
            setTitle(newData.title);
            setAuthors(newData.authors);
            setPublicationMonth(newData.publicationMonth);
            setPublicationYear(newData.publicationYear);
            setPublishedIn(newData.publishedIn);
            setUrl(newData.url);
            setIsOpenBibTexModal(false);
            setIsMetadataExpanded(true);
            toast.success('Data successfully extracted');
        }
    };

    return (
        <>
            <ButtonGroup size="sm" variant="secondary">
                <Button onPress={() => setIsOpenPdfModal(true)}>
                    <FontAwesomeIcon icon={faUpload} />
                    Upload PDF
                </Button>
                <Button onPress={() => setIsOpenBibTexModal(true)}>
                    <ButtonGroup.Separator />
                    <FontAwesomeIcon icon={faCode} />
                    Enter BibTeX
                </Button>
            </ButtonGroup>
            {isOpenPdfModal && <UploadPdfModal toggle={() => setIsOpenPdfModal((v) => !v)} onUpdateData={handleUpdateDataFromPdf} />}
            {isOpenBibTexModal && <BibTexModal toggle={() => setIsOpenBibTexModal((v) => !v)} onUpdateData={handleUpdateDataFromBibTex} />}
            <OverwriteValuesModal />
        </>
    );
};

export default AddPaperAdditionalButtons;
