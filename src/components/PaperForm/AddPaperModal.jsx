import ModalWithLoading from 'components/ModalWithLoading/ModalWithLoading';
import AddPaperAdditionalButtons from 'components/PaperForm/AddPaperAdditionalButtons';
import PaperForm from 'components/PaperForm/PaperForm';
import useAddPaper from 'components/PaperForm/hooks/useAddPaper';
import REGEX from 'constants/regex';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Button, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const AddPaperModal = ({ isOpen, toggle, onCreatePaper, initialValue = '' }) => {
    const [isLoadingParsing, setIsLoadingParsing] = useState(false);
    const [isMetadataExpanded, setIsMetadataExpanded] = useState(false);

    const onCreate = ({ paperId, contributionId }) => {
        onCreatePaper({ paperId, contributionId });
    };

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
        ExistingPaperModels,
        handleSave,
        savePaper,
        setExtractedContributionData,
    } = useAddPaper({ onCreate });

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
            <ModalHeader toggle={toggle} tag="div" cssModule={{ 'modal-title': 'w-100' }}>
                <div className="d-flex align-items-center">
                    <h1 className="h5 m-0">Create new paper</h1>
                    <div className="d-flex ms-3 align-items-center ms-auto me-2">
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
                </div>
            </ModalHeader>
            <ModalBody>
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
            </ModalBody>
            <ModalFooter className="d-flex">
                <Button disabled={isLoadingParsing} color="primary" className="float-end" onClick={handleSave}>
                    Create
                </Button>
            </ModalFooter>
            <ExistingPaperModels onContinue={savePaper} />
        </ModalWithLoading>
    );
};

AddPaperModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    onCreatePaper: PropTypes.func.isRequired,
    initialValue: PropTypes.string,
};

export default AddPaperModal;
