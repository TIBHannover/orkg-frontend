import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { createResource } from 'services/backend/resources';
import { createResourceData } from 'services/similarity/index';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';

function SaveDiagram({ isSaveDiagramModalOpen, setIsSaveDiagramModalOpen, diagram }) {
    const [resource, setResource] = useState(null);
    const [value, setValue] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const save = async () => {
        setIsSaving(true);
        const sResource = await createResource(value, [CLASSES.DIAGRAM]);
        createResourceData({
            resourceId: sResource.id,
            data: diagram,
        })
            .then(() => {
                setResource(sResource);
                setIsSaving(false);
                // setIsSaveDiagramModalOpen(false);
            })
            .catch(() => {
                setIsSaving(false);
                toast.error('Error saving diagram');
            });
    };

    return (
        <Modal isOpen={isSaveDiagramModalOpen} toggle={setIsSaveDiagramModalOpen}>
            <ModalHeader toggle={setIsSaveDiagramModalOpen}>Save diagram</ModalHeader>
            <ModalBody>
                {!resource ? (
                    <>
                        Enter a diagram label
                        <div className="mt-2">
                            <Input type="text" onChange={e => setValue(e.target.value)} />
                        </div>
                    </>
                ) : (
                    <>
                        <FormGroup>
                            <Label for="doi_link">Diagram</Label>
                            <InputGroup>
                                <Input id="doi_link" value="Diagram" disabled />
                                <CopyToClipboard
                                    text="Diagram"
                                    onCopy={() => {
                                        toast.dismiss();
                                        toast.success('Diagram link copied!');
                                    }}
                                >
                                    <Button color="primary" className="pl-3 pr-3" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                                        <Icon icon={faClipboard} />
                                    </Button>
                                </CopyToClipboard>
                            </InputGroup>
                        </FormGroup>
                    </>
                )}
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
};

export default SaveDiagram;
