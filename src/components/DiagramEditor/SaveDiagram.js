import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import Link from 'components/NextJsMigration/Link';
import useRouter from 'components/NextJsMigration/useRouter';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { CLASSES, MISC, PREDICATES } from 'constants/graphSettings';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import ROUTES from 'constants/routes.js';
import THING_TYPES from 'constants/thingTypes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Alert, Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { createResource } from 'services/backend/resources';
import { createResourceStatement } from 'services/backend/statements';
import { createThing } from 'services/similarity';
import { asyncLocalStorage } from 'utils';

function SaveDiagram({ isSaveDiagramModalOpen, setIsSaveDiagramModalOpen, diagram, diagramResource }) {
    const [value, setValue] = useState(diagramResource?.label ?? '');
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();
    const save = async () => {
        setIsSaving(true);
        const sResource = await createResource(value, [CLASSES.DIAGRAM]);
        createThing({ thingType: THING_TYPES.DIAGRAM, thingKey: sResource.id, data: diagram })
            .then(async () => {
                if (diagramResource?.id) {
                    await createResourceStatement(sResource.id, PREDICATES.HAS_PREVIOUS_VERSION, diagramResource?.id);
                }
                router.push(reverse(ROUTES.DIAGRAM, { id: sResource.id }));
                toast.success('Diagram published successfully');
                setIsSaving(false);
                setIsSaveDiagramModalOpen(false);
                asyncLocalStorage.removeItem('diagram');
            })
            .catch(() => {
                setIsSaving(false);
                toast.error('Error saving diagram');
            });
    };

    useEffect(() => {
        setValue(diagramResource?.label ?? '');
    }, [diagramResource]);

    return (
        <Modal isOpen={isSaveDiagramModalOpen} toggle={setIsSaveDiagramModalOpen}>
            <ModalHeader toggle={setIsSaveDiagramModalOpen}>Save diagram</ModalHeader>
            <ModalBody>
                {diagramResource?.id && (
                    <Alert color="info">
                        You are publishing a new version of the diagram. The diagram you are about to save will be marked as a new version of the{' '}
                        <Link target="_blank" href={reverse(ROUTES.DIAGRAM, { id: diagramResource?.id })}>
                            original diagram
                        </Link>
                        {diagramResource?.created_by !== MISC.UNKNOWN_ID && (
                            <>
                                {' created by '}
                                <UserAvatar showDisplayName={true} userId={diagramResource?.created_by} />
                            </>
                        )}
                    </Alert>
                )}
                <>
                    Enter a diagram label
                    <div className="mt-2">
                        <Input type="text" maxLength={MAX_LENGTH_INPUT} value={value} onChange={e => setValue(e.target.value)} />
                    </div>
                </>
            </ModalBody>
            <ModalFooter>
                <ButtonWithLoading color="primary" onClick={save} isLoading={isSaving}>
                    Save
                </ButtonWithLoading>
                <Button color="secondary" onClick={setIsSaveDiagramModalOpen}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
}

SaveDiagram.propTypes = {
    isSaveDiagramModalOpen: PropTypes.bool.isRequired,
    setIsSaveDiagramModalOpen: PropTypes.func.isRequired,
    diagram: PropTypes.object.isRequired,
    diagramResource: PropTypes.object,
};

export default SaveDiagram;
