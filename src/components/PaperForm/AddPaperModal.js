import ModalWithLoading from 'components/ModalWithLoading/ModalWithLoading';
import PaperForm from 'components/PaperForm/PaperForm';
import useAddPaper from 'components/PaperForm/hooks/useAddPaper';
import REGEX from 'constants/regex';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Button, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const AddPaperModal = ({ isOpen, toggle, onCreatePaper, initialValue = '' }) => {
    const [isLoadingParsing, setIsLoadingParsing] = useState(false);

    const onCreate = createdIds => {
        onCreatePaper(createdIds);
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
    } = useAddPaper({ onCreate });

    useEffect(() => {
        if (!initialValue) {
            return;
        }

        const doiEntry = initialValue.startsWith('http') ? initialValue.substring(initialValue.indexOf('10.')) : initialValue;

        if (REGEX.DOI_ID.test(doiEntry)) {
            setDoi(doiEntry);
        } else {
            setTitle(initialValue);
        }
    }, [initialValue, setDoi, setTitle]);

    return (
        <ModalWithLoading isLoading={isLoading} isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Create new paper</ModalHeader>
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
