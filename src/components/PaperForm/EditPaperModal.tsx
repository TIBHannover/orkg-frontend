import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Checkbox, Label, Modal } from '@heroui/react';
import Link from 'next/link';
import { useState } from 'react';

import Tooltip from '@/components/FloatingUI/Tooltip';
import useAuthentication from '@/components/hooks/useAuthentication';
import ModalWithLoading from '@/components/ModalWithLoading/ModalWithLoading';
import useEditPaper from '@/components/PaperForm/hooks/useEditPaper';
import PaperForm from '@/components/PaperForm/PaperForm';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Paper } from '@/services/backend/types';

type EditPaperModalProps = {
    paperData?: Paper | null;
    toggle: () => void;
    afterUpdate?: (updated: Paper) => void;
    isPaperLinkVisible?: boolean;
};

const EditPaperModal = ({ paperData, toggle, afterUpdate, isPaperLinkVisible = false }: EditPaperModalProps) => {
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
        <ModalWithLoading isLoading={isLoadingEdit} isOpen toggle={toggle} size="lg" className="mt-10">
            <Modal.CloseTrigger className="!top-3 !right-3" />
            <Modal.Header>
                <div className="flex w-full items-center justify-between gap-3 pr-10">
                    <Modal.Heading>Edit paper</Modal.Heading>
                    {isPaperLinkVisible && paperData?.id && (
                        <Link
                            href={reverse(ROUTES.VIEW_PAPER, { resourceId: paperData.id })}
                            target="_blank"
                            className="text-sm text-primary hover:underline"
                        >
                            Open paper <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-1" />
                        </Link>
                    )}
                </div>
            </Modal.Header>
            <Modal.Body className="max-h-[70vh] overflow-y-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
            </Modal.Body>
            <Modal.Footer className="items-center">
                {!!user && user.isCurationAllowed && (
                    <Tooltip content="Mark the metadata as verified">
                        <div className="mr-auto">
                            <Checkbox id="edit-paper-verified" isSelected={isVerified} onChange={setIsVerified}>
                                <Checkbox.Control>
                                    <Checkbox.Indicator />
                                </Checkbox.Control>
                                <Checkbox.Content>
                                    <Label htmlFor="edit-paper-verified">Verified</Label>
                                </Checkbox.Content>
                            </Checkbox>
                        </div>
                    </Tooltip>
                )}
                <Button isDisabled={isLoadingParsing} variant="primary" onPress={handleSave}>
                    Save
                </Button>
            </Modal.Footer>
        </ModalWithLoading>
    );
};

export default EditPaperModal;
