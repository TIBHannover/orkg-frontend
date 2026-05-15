import { faPen, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Checkbox, Modal, Tooltip } from '@heroui/react';
import { FC, useState } from 'react';

import EditMetadataModal from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/EditMetadataModal/EditMetadataModel';
import usePublish from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/Publish/hooks/usePublish';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useComparison from '@/components/Comparison/hooks/useComparison';

type PublishProps = {
    toggle: () => void;
};

const Publish: FC<PublishProps> = ({ toggle }) => {
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const { comparison } = useComparison();
    const { isLoading, handleSubmit, shouldAssignDoi, setShouldAssignDoi, isPublishable } = usePublish();

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            toggle();
        }
    };

    return (
        <Modal.Backdrop isOpen onOpenChange={handleOpenChange}>
            <Modal.Container>
                <Modal.Dialog>
                    <Modal.Header className="flex-row items-center justify-between gap-3">
                        <Modal.Heading>Publish comparison</Modal.Heading>
                        <Modal.CloseTrigger className="static" />
                    </Modal.Header>
                    <form onSubmit={handleSubmit}>
                        <Modal.Body className="pt-4 pb-2 px-1 flex flex-col gap-4">
                            {isPublishable ? (
                                <>
                                    <Alert status="accent">
                                        Once a comparison is published, the current state is saved and will be persistent over time.
                                    </Alert>
                                    <Checkbox id="switchAssignDoi" isSelected={shouldAssignDoi} onChange={(checked) => setShouldAssignDoi(checked)}>
                                        <Checkbox.Control>
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                        <Checkbox.Content>
                                            <Tooltip delay={0}>
                                                <Tooltip.Trigger>
                                                    <span>
                                                        Assign DOI to comparison <FontAwesomeIcon icon={faQuestionCircle} className="text-accent" />
                                                    </span>
                                                </Tooltip.Trigger>
                                                <Tooltip.Content showArrow>
                                                    <Tooltip.Arrow />
                                                    Assign a DOI to the published version of this comparison
                                                </Tooltip.Content>
                                            </Tooltip>
                                        </Checkbox.Content>
                                    </Checkbox>
                                </>
                            ) : (
                                <Alert status="danger">
                                    <span>
                                        Before publishing a comparison, make sure a comparison has a{' '}
                                        <em>title, description, research field, authors, and has at least two sources</em>.<br />
                                        <Button size="sm" className="mt-2 mr-2" onPress={() => setIsOpenEditModal(true)}>
                                            <FontAwesomeIcon icon={faPen} /> Edit metadata
                                        </Button>
                                    </span>
                                </Alert>
                            )}
                        </Modal.Body>

                        {isPublishable && (
                            <Modal.Footer>
                                <ButtonWithLoading type="submit" isLoading={isLoading}>
                                    Publish
                                </ButtonWithLoading>
                            </Modal.Footer>
                        )}
                    </form>
                </Modal.Dialog>
            </Modal.Container>
            {isOpenEditModal && comparison && <EditMetadataModal toggle={() => setIsOpenEditModal((v) => !v)} comparisonId={comparison.id} />}
        </Modal.Backdrop>
    );
};

export default Publish;
