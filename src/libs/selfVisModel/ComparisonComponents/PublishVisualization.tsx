import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Input, Label, Modal, TextArea, toast, Tooltip } from '@heroui/react';
import { FC, ReactNode, useState } from 'react';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useComparison from '@/components/Comparison/hooks/useComparison';
import useMembership from '@/components/hooks/useMembership';
import AuthorsInput from '@/components/Input/AuthorsInput/AuthorsInput';
import ModalWithLoading from '@/components/ModalWithLoading/ModalWithLoading';
import { PREDICATES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import THING_TYPES from '@/constants/thingTypes';
import SelfVisDataModel from '@/libs/selfVisModel/SelfVisDataModel';
import { createResourceStatement } from '@/services/backend/statements';
import { Author } from '@/services/backend/types';
import { createVisualization } from '@/services/backend/visualizations';
import { createThing } from '@/services/simcomp';

type PublishVisualizationProps = {
    showDialog: boolean;
    toggle: () => void;
    closeAllAndReloadVisualizations: () => void;
    comparisonId?: string;
};

type FieldLabelProps = {
    htmlFor: string;
    text: ReactNode;
    tooltip: ReactNode;
};

const FieldLabel: FC<FieldLabelProps> = ({ htmlFor, text, tooltip }) => (
    <Label htmlFor={htmlFor} className="inline-flex items-center gap-1">
        {text}
        <Tooltip>
            <Tooltip.Trigger className="inline-flex">
                <FontAwesomeIcon icon={faQuestionCircle} className="text-secondary" />
            </Tooltip.Trigger>
            <Tooltip.Content showArrow className="max-w-xs">
                <Tooltip.Arrow />
                {tooltip}
            </Tooltip.Content>
        </Tooltip>
    </Label>
);

const PublishVisualization: FC<PublishVisualizationProps> = ({ showDialog, toggle, closeAllAndReloadVisualizations, comparisonId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const { mutate } = useComparison();
    const { displayName, organizationId, observatoryId } = useMembership();

    const [authors, setAuthors] = useState<Author[]>([
        {
            id: null,
            name: displayName ?? '',
            identifiers: {
                orcid: [],
            },
        },
    ]);

    const modelExists = () => {
        const currModel = new SelfVisDataModel();
        return currModel.getReconstructionModel() !== undefined;
    };

    const createReconstructionModel = (resourceId: string) => {
        const currModel = new SelfVisDataModel();
        const reconstructionData = currModel.getReconstructionModel();
        if (reconstructionData === undefined) {
            return undefined;
        }
        return {
            orkgOrigin: resourceId,
            renderingEngine: currModel._renderingEngine,
            visMethod: currModel._renderingMethod,
            googleChartsData: currModel.getGoogleChartsData(),
            reconstructionData,
        };
    };

    const createReconstructionModelInBackend = async (resourceId: string, model: unknown) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (createThing as any)({ thingType: THING_TYPES.VISUALIZATION, thingKey: resourceId, data: model });
        } catch (error) {
            toast.danger(`Error publishing a visualization : ${(error as Error).message}`);
        }
    };

    const handleSubmit = async (e?: { preventDefault?: () => void }) => {
        e?.preventDefault?.();

        if (!comparisonId) {
            console.error('ERROR, No contribution id provided');
            return;
        }

        if (!modelExists()) {
            toast.danger('Error in publishing a visualization: Model is empty, select data');
            return;
        }

        if (!title || !description) {
            toast.danger('Please enter a title and description');
            return;
        }

        try {
            setIsLoading(true);
            const backendReferenceResource = await createVisualization({
                title,
                description,
                authors,
                observatories: observatoryId ? [observatoryId] : [],
                organizations: organizationId ? [organizationId] : [],
                extraction_method: 'MANUAL',
            });
            await createResourceStatement(comparisonId, PREDICATES.HAS_VISUALIZATION, backendReferenceResource);
            const reconstructionModel = createReconstructionModel(backendReferenceResource);
            await createReconstructionModelInBackend(backendReferenceResource, reconstructionModel);
            mutate();
            closeAllAndReloadVisualizations();
        } catch (error) {
            toast.danger(`Error publishing a visualization : ${(error as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ModalWithLoading isOpen={showDialog} toggle={toggle} isLoading={isLoading} size="lg">
            <Modal.Header>
                <Modal.CloseTrigger />
                <Modal.Heading>Publish visualization</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="p-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <Alert status="accent">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Description>Your visualization will be added to the comparison</Alert.Description>
                        </Alert.Content>
                    </Alert>

                    <div className="flex flex-col gap-1.5">
                        <FieldLabel htmlFor="title" text="Title" tooltip="Enter the title of the visualization" />
                        <Input
                            fullWidth
                            type="text"
                            id="title"
                            name="title"
                            value={title}
                            maxLength={MAX_LENGTH_INPUT}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <FieldLabel htmlFor="description" text="Description" tooltip="Describe the goal and what is being visualized" />
                        <TextArea
                            fullWidth
                            id="description"
                            name="description"
                            rows={4}
                            value={description}
                            maxLength={MAX_LENGTH_INPUT}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <FieldLabel
                            htmlFor="Creator"
                            text={
                                <>
                                    Creators <span className="text-muted italic font-normal">(optional)</span>
                                </>
                            }
                            tooltip="The creator(s) of the visualization. Enter both the first and last name"
                        />
                        <AuthorsInput itemLabel="creator" handler={setAuthors} value={authors} />
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer className="justify-end">
                <ButtonWithLoading isLoading={isLoading} variant="primary" onPress={() => handleSubmit()}>
                    Publish
                </ButtonWithLoading>
            </Modal.Footer>
        </ModalWithLoading>
    );
};

export default PublishVisualization;
