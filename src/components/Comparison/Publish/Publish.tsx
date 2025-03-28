import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useState } from 'react';
import { Alert, Button, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import EditMetadataModal from '@/components/Comparison/ComparisonHeader/EditMetadataModal/EditMetadataModel';
import useComparison from '@/components/Comparison/hooks/useComparison';
import usePublish from '@/components/Comparison/hooks/usePublish';
import Tooltip from '@/components/Utils/Tooltip';

type PublishProps = {
    toggle: () => void;
};

const Publish: FC<PublishProps> = ({ toggle }) => {
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const { comparison } = useComparison();
    const { isLoading, handleSubmit, shouldAssignDoi, setShouldAssignDoi, isPublishable } = usePublish();

    return (
        <Modal isOpen toggle={toggle}>
            <ModalHeader toggle={toggle}>Publish comparison</ModalHeader>

            <Form onSubmit={handleSubmit}>
                <ModalBody>
                    {isPublishable ? (
                        <>
                            <Alert color="info">Once a comparison is published, the current state is saved and will be persistent over time.</Alert>
                            <FormGroup>
                                <div>
                                    <Tooltip message="Assign a DOI to the published version of this comparison">
                                        <Label check>
                                            <Input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    setShouldAssignDoi(e.target.checked);
                                                }}
                                                checked={shouldAssignDoi}
                                                id="switchAssignDoi"
                                                inline
                                            />{' '}
                                            Assign DOI to comparison
                                        </Label>
                                    </Tooltip>
                                </div>
                            </FormGroup>
                        </>
                    ) : (
                        <Alert color="danger">
                            Before publishing a comparison, make sure a comparison has a{' '}
                            <em>title, description, research field, authors, and has at least two contributions</em>.<br />
                            <Button color="secondary" size="sm" className="mt-2 me-2" onClick={() => setIsOpenEditModal(true)}>
                                <FontAwesomeIcon icon={faPen} /> Edit metadata
                            </Button>
                        </Alert>
                    )}
                </ModalBody>

                {isPublishable && (
                    <ModalFooter>
                        <div className="text-align-center mt-2">
                            <ButtonWithLoading type="submit" color="primary" isLoading={isLoading}>
                                Publish
                            </ButtonWithLoading>
                        </div>
                    </ModalFooter>
                )}
            </Form>
            {isOpenEditModal && comparison && <EditMetadataModal toggle={() => setIsOpenEditModal((v) => !v)} comparisonId={comparison.id} />}
        </Modal>
    );
};

export default Publish;
