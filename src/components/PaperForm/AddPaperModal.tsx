import { Button, Modal } from '@heroui/react';
import { useEffect, useState } from 'react';

import ModalWithLoading from '@/components/ModalWithLoading/ModalWithLoading';
import AddPaperAdditionalButtons from '@/components/PaperForm/AddPaperAdditionalButtons';
import useAddPaper from '@/components/PaperForm/hooks/useAddPaper';
import PaperForm from '@/components/PaperForm/PaperForm';
import REGEX from '@/constants/regex';

type AddPaperModalProps = {
    isOpen: boolean;
    toggle: () => void;
    onCreatePaper: (args: { paperId: string; contributionId: string }) => void;
    initialValue?: string;
};

const AddPaperModal = ({ isOpen, toggle, onCreatePaper, initialValue = '' }: AddPaperModalProps) => {
    const [isLoadingParsing, setIsLoadingParsing] = useState(false);
    const [isMetadataExpanded, setIsMetadataExpanded] = useState(false);

    const {
        doi,
        title,
        researchField,
        authors,
        publicationMonth,
        publicationYear,
        publishedIn,
        isLoading,
        url,
        setDoi,
        setTitle,
        setResearchField,
        setAuthors,
        setPublicationMonth,
        setPublicationYear,
        setPublishedIn,
        setUrl,
        ExistingPaperModals,
        handleSave,
        setExtractedContributionData,
    } = useAddPaper({ onCreate: (args) => onCreatePaper(args) });

    useEffect(() => {
        if (!initialValue) {
            return;
        }

        const doiEntry =
            typeof initialValue === 'string' && initialValue.startsWith('http') ? initialValue.substring(initialValue.indexOf('10.')) : initialValue;

        if (REGEX.DOI_ID.test(doiEntry)) {
            setDoi(doiEntry);
        } else {
            setTitle(initialValue);
        }
    }, [initialValue, setDoi, setTitle]);

    return (
        <ModalWithLoading isLoading={isLoading} isOpen={isOpen} toggle={toggle} size="lg">
            <Modal.CloseTrigger className="!top-3 !right-3" />
            <Modal.Header className="flex flex-col items-start gap-3">
                <div className="w-full pr-10">
                    <Modal.Heading>Create new paper</Modal.Heading>
                    <p className="text-sm text-default-500 mt-1">Enter a DOI to auto-fill the metadata, or prefill the form from a PDF or BibTeX.</p>
                </div>
                <div className="flex w-full">
                    <AddPaperAdditionalButtons
                        doi={doi}
                        title={title}
                        authors={authors}
                        publicationMonth={publicationMonth}
                        publicationYear={publicationYear}
                        publishedIn={publishedIn}
                        url={url}
                        setDoi={setDoi}
                        setTitle={setTitle}
                        setResearchField={setResearchField}
                        setAuthors={setAuthors}
                        setPublicationMonth={setPublicationMonth}
                        setPublicationYear={setPublicationYear}
                        setPublishedIn={setPublishedIn}
                        setUrl={setUrl}
                        setIsMetadataExpanded={setIsMetadataExpanded}
                        setExtractedContributionData={setExtractedContributionData}
                    />
                </div>
            </Modal.Header>
            <Modal.Body className="p-1">
                <PaperForm
                    isLoadingParsing={isLoadingParsing}
                    setIsLoadingParsing={setIsLoadingParsing}
                    doi={doi}
                    setDoi={setDoi}
                    title={title}
                    setTitle={setTitle}
                    researchField={researchField}
                    setResearchField={setResearchField}
                    authors={authors}
                    setAuthors={setAuthors}
                    publicationMonth={publicationMonth}
                    setPublicationMonth={setPublicationMonth}
                    publicationYear={publicationYear}
                    setPublicationYear={setPublicationYear}
                    publishedIn={publishedIn}
                    setPublishedIn={setPublishedIn}
                    url={url}
                    setUrl={setUrl}
                    isNewPaper
                    isMetadataExpanded={isMetadataExpanded}
                    setIsMetadataExpanded={setIsMetadataExpanded}
                />
            </Modal.Body>
            <Modal.Footer className="justify-end">
                <Button isDisabled={isLoadingParsing} variant="primary" onPress={handleSave}>
                    Create
                </Button>
            </Modal.Footer>
            <ExistingPaperModals />
        </ModalWithLoading>
    );
};

export default AddPaperModal;
