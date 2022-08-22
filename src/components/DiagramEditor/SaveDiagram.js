import { useEffect, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import { CLASSES, MISC, PREDICATES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { createResource } from 'services/backend/resources';
import { createResourceData } from 'services/similarity/index';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { asyncLocalStorage } from 'utils';
import { createResourceStatement } from 'services/backend/statements';

function SaveDiagram({ isSaveDiagramModalOpen, setIsSaveDiagramModalOpen, diagram, diagramResource }) {
    const [value, setValue] = useState(diagramResource?.label ?? '');
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();
    const save = async () => {
        setIsSaving(true);
        const sResource = await createResource(value, [CLASSES.DIAGRAM]);
        createResourceData({
            resourceId: sResource.id,
            data: diagram,
        })
            .then(async () => {
                if (diagramResource?.id) {
                    await createResourceStatement(sResource.id, PREDICATES.HAS_PREVIOUS_VERSION, diagramResource?.id);
                }
                navigate(reverse(ROUTES.DIAGRAM, { id: sResource.id }));
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
                        <Link target="_blank" to={reverse(ROUTES.DIAGRAM, { id: diagramResource?.id })}>
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
                        <Input type="text" value={value} onChange={e => setValue(e.target.value)} />
                    </div>
                </>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={save} disabled={isSaving}>
                    {!isSaving ? 'Save' : 'Saving'}
                </Button>
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
