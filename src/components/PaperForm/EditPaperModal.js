import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import ModalWithLoading from 'components/ModalWithLoading/ModalWithLoading';
import PaperForm from 'components/PaperForm/PaperForm';
import useEditPaper from 'components/PaperForm/hooks/useEditPaper';
import useAuthentication from 'components/hooks/useAuthentication';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Button, FormGroup, Input, Label, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const EditPaperModal = ({ paperData, toggle, afterUpdate = null, isPaperLinkVisible = false }) => {
    const [isLoadingParsing, setIsLoadingParsing] = useState(false);

    const {
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
    } = useEditPaper({ paperData, afterUpdate });

    const { user } = useAuthentication();

    return (
        <ModalWithLoading isLoading={isLoadingEdit} isOpen toggle={toggle} size="lg">
            <ModalHeader toggle={toggle} cssModule={{ 'modal-title': 'modal-title w-100 d-flex justify-content-between' }}>
                <span>Edit paper</span>
                {isPaperLinkVisible && (
                    <Link href={reverse(ROUTES.VIEW_PAPER, { resourceId: paperData?.id })} target="_blank">
                        <Button color="link" className="p-0">
                            Open paper <FontAwesomeIcon icon={faExternalLinkAlt} className="me-1" />
                        </Button>
                    </Link>
                )}
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
                    abstract={abstract}
                />
            </ModalBody>
            <ModalFooter className="align-items-center">
                {!!user && user.isCurationAllowed && (
                    <FormGroup check className="me-2">
                        <Tippy content="Mark the metadata as verified">
                            <span>
                                <Input
                                    type="checkbox"
                                    id="replaceTitles"
                                    name="verified"
                                    onChange={(e) => setIsVerified(e.target.checked)}
                                    checked={isVerified}
                                />
                                <Label check for="replaceTitles" className="mb-0">
                                    Verified
                                </Label>
                            </span>
                        </Tippy>
                    </FormGroup>
                )}
                <Button disabled={isLoadingParsing} color="primary" onClick={handleSave}>
                    Save
                </Button>
            </ModalFooter>
        </ModalWithLoading>
    );
};

EditPaperModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    paperData: PropTypes.object,
    afterUpdate: PropTypes.func,
    isPaperLinkVisible: PropTypes.bool,
};

export default EditPaperModal;
