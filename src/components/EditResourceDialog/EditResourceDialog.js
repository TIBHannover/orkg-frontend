import Link from 'next/link';
import { Button, Input, Modal, ModalBody, ModalHeader, FormGroup, Label } from 'reactstrap';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { updateResource } from 'services/backend/resources';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import useEditResource from 'components/EditResourceDialog/hooks/useEditResource';
import { MAX_LENGTH_INPUT } from 'constants/misc';

const EditResourceDialog = ({ resource, isOpen, toggle, afterUpdate = null, showResourceLink = false, fixedClasses }) => {
    const { classes, label, isLoading, setIsLoading, handleChangeClasses, setLabel } = useEditResource(resource);

    const handleSave = async () => {
        setIsLoading(true);
        const updatedResource = await updateResource(
            resource.id,
            label,
            classes.map((c) => c.id),
        );
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
                            Open resource <Icon icon={faExternalLinkAlt} className="me-1" />
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
