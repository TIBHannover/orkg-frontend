import { Alert, Button, Input, Label, Modal, TextField, toast } from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { CLASSES, MISC, PREDICATES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import THING_TYPES from '@/constants/thingTypes';
import { reverse } from '@/lib/namedRoute';
import { createResource } from '@/services/backend/resources';
import { createResourceStatement } from '@/services/backend/statements';
import { Resource } from '@/services/backend/types';
import { createThing } from '@/services/simcomp';
import { asyncLocalStorage } from '@/utils';

type SaveDiagramProps = {
    isSaveDiagramModalOpen: boolean;
    setIsSaveDiagramModalOpen: () => void;
    diagram: Resource;
    diagramResource?: Resource;
};

const SaveDiagram: FC<SaveDiagramProps> = ({ isSaveDiagramModalOpen, setIsSaveDiagramModalOpen, diagram, diagramResource }) => {
    const [value, setValue] = useState(diagramResource?.label ?? '');
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const save = async () => {
        setIsSaving(true);
        const sResourceId = await createResource({ label: value, classes: [CLASSES.DIAGRAM] });
        // @ts-expect-error awaiting migration simcomp
        createThing({ thingType: THING_TYPES.DIAGRAM, thingKey: sResourceId, data: diagram })
            .then(async () => {
                if (diagramResource?.id) {
                    await createResourceStatement(sResourceId, PREDICATES.HAS_PREVIOUS_VERSION, diagramResource.id);
                }
                router.push(reverse(ROUTES.DIAGRAM, { id: sResourceId }));
                toast.success('Diagram published successfully');
                setIsSaving(false);
                setIsSaveDiagramModalOpen();
                asyncLocalStorage.removeItem('diagram');
            })
            .catch(() => {
                setIsSaving(false);
                toast.danger('Error saving diagram');
            });
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValue(diagramResource?.label ?? '');
    }, [diagramResource]);

    return (
        <Modal.Backdrop
            isOpen={isSaveDiagramModalOpen}
            onOpenChange={(open) => {
                if (!open) setIsSaveDiagramModalOpen();
            }}
        >
            <Modal.Container size="md">
                <Modal.Dialog className="sm:max-w-lg">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>Save diagram</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="p-1">
                            {diagramResource?.id && (
                                <Alert status="accent" className="mb-3">
                                    <Alert.Indicator />
                                    <Alert.Content>
                                        <Alert.Description>
                                            You are publishing a new version of the diagram. The diagram you are about to save will be marked as a new
                                            version of the{' '}
                                            <Link target="_blank" href={reverse(ROUTES.DIAGRAM, { id: diagramResource.id })}>
                                                original diagram
                                            </Link>
                                            {diagramResource.created_by !== MISC.UNKNOWN_ID && (
                                                <>
                                                    {' created by '}
                                                    <UserAvatar showDisplayName userId={diagramResource.created_by} />
                                                </>
                                            )}
                                        </Alert.Description>
                                    </Alert.Content>
                                </Alert>
                            )}
                            <TextField value={value} onChange={setValue} className="w-full">
                                <Label>Enter a diagram label</Label>
                                <Input maxLength={MAX_LENGTH_INPUT} autoFocus />
                            </TextField>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <ButtonWithLoading variant="primary" onPress={save} isLoading={isSaving}>
                            Save
                        </ButtonWithLoading>
                        <Button variant="secondary" onPress={setIsSaveDiagramModalOpen}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default SaveDiagram;
