import { reverse } from 'named-urls';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Alert } from 'reactstrap';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import Button from '@/components/Ui/Button/Button';
import Input from '@/components/Ui/Input/Input';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { CLASSES, MISC, PREDICATES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import THING_TYPES from '@/constants/thingTypes';
import { createResource } from '@/services/backend/resources';
import { createResourceStatement } from '@/services/backend/statements';
import { createThing } from '@/services/simcomp';
import { asyncLocalStorage } from '@/utils';

function SaveDiagram({ isSaveDiagramModalOpen, setIsSaveDiagramModalOpen, diagram, diagramResource }) {
    const [value, setValue] = useState(diagramResource?.label ?? '');
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();
    const save = async () => {
        setIsSaving(true);
        const sResourceId = await createResource({ label: value, classes: [CLASSES.DIAGRAM] });
        createThing({ thingType: THING_TYPES.DIAGRAM, thingKey: sResourceId, data: diagram })
            .then(async () => {
                if (diagramResource?.id) {
                    await createResourceStatement(sResourceId, PREDICATES.HAS_PREVIOUS_VERSION, diagramResource?.id);
                }
                router.push(reverse(ROUTES.DIAGRAM, { id: sResourceId }));
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
                                <UserAvatar showDisplayName userId={diagramResource?.created_by} />
                            </>
                        )}
                    </Alert>
                )}
                <>
                    Enter a diagram label
                    <div className="mt-2">
                        <Input type="text" maxLength={MAX_LENGTH_INPUT} value={value} onChange={(e) => setValue(e.target.value)} />
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
