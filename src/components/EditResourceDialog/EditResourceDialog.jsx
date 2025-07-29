import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useEditResource from '@/components/EditResourceDialog/hooks/useEditResource';
import Button from '@/components/Ui/Button/Button';
import { ENTITIES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { getResource, updateResource } from '@/services/backend/resources';

const EditResourceDialog = ({ resource, isOpen, toggle, afterUpdate = null, showResourceLink = false, fixedClasses }) => {
    const { classes, label, isLoading, setIsLoading, handleChangeClasses, setLabel } = useEditResource(resource);

    const handleSave = async () => {
        setIsLoading(true);
        await updateResource(resource.id, { label, classes: classes.map((c) => c.id) });
        const updatedResource = await getResource(resource.id);
        if (updatedResource && afterUpdate) {
            afterUpdate(updatedResource);
        }
        setIsLoading(false);
        toggle(isOpen);
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>
                Edit resource
                {showResourceLink && (
                    <Link
                        style={{ right: 45, position: 'absolute', top: 12 }}
                        className="ms-2"
                        href={`${reverse(ROUTES.RESOURCE, { id: resource?.id })}?noRedirect`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button color="link" className="p-0">
                            Open resource <FontAwesomeIcon icon={faExternalLinkAlt} className="me-1" />
                        </Button>
                    </Link>
                )}
            </ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label for="label">Label</Label>
                    <Input
                        id="label"
                        name="label"
                        placeholder="resource label"
                        type="text"
                        maxLength={MAX_LENGTH_INPUT}
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="label">Classes</Label>
                    <Autocomplete
                        entityType={ENTITIES.CLASS}
                        onChange={(selected, action) => {
                            if (action.removedValue && action.removedValue.isFixed) {
                                return;
                            }
                            handleChangeClasses(selected, action);
                        }}
                        placeholder="Specify the classes of the resource"
                        value={classes}
                        openMenuOnFocus
                        allowCreate
                        isMulti
                        enableExternalSources
                        fixedOptions={fixedClasses}
                        inputId="classes-autocomplete"
                    />
                </FormGroup>
                <div className="d-flex" style={{ justifyContent: 'flex-end' }}>
                    <ButtonWithLoading isLoading={isLoading} color="primary" className=" mt-2 mb-2" onClick={handleSave}>
                        Save
                    </ButtonWithLoading>
                </div>
            </ModalBody>
        </Modal>
    );
};

EditResourceDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    resource: PropTypes.object.isRequired,
    fixedClasses: PropTypes.array,
    afterUpdate: PropTypes.func,
    showResourceLink: PropTypes.bool,
};

export default EditResourceDialog;
