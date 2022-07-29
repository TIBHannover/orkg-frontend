import { Button, Input, Modal, ModalBody, ModalHeader, FormGroup, Label } from 'reactstrap';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { updateResource } from 'services/backend/resources';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import useEditResource from './hooks/useEditResource';

const EditResourceDialog = ({ resource, isOpen, toggle, afterUpdate, showResourceLink, fixedClasses }) => {
    const { classes, label, isLoading, setIsLoading, handleChangeClasses, setLabel } = useEditResource(resource);

    const handleSave = async () => {
        setIsLoading(true);
        const updatedResource = await updateResource(resource.id, label, classes.map(c => c.id));
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
                        to={reverse(ROUTES.RESOURCE, { id: resource?.id })}
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
                    <Input id="label" name="label" placeholder="resource label" type="text" value={label} onChange={e => setLabel(e.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Label for="label">Classes</Label>
                    <AutoComplete
                        entityType={ENTITIES.CLASS}
                        onChange={(selected, action) => {
                            if (action.removedValue && action.removedValue.isFixed) {
                                return;
                            }
                            handleChangeClasses(selected, action);
                        }}
                        placeholder="Specify the classes of the resource"
                        value={classes}
                        autoLoadOption={true}
                        openMenuOnFocus={true}
                        allowCreate={true}
                        isMulti
                        autoFocus={false}
                        ols={true}
                        fixedOptions={fixedClasses}
                        inputId="classes-autocomplete"
                    />
                </FormGroup>
                <div className="d-flex" style={{ justifyContent: 'flex-end' }}>
                    <Button disabled={isLoading} color="primary" className=" mt-2 mb-2" onClick={handleSave}>
                        Save
                    </Button>
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

EditResourceDialog.defaultProps = {
    afterUpdate: null,
    showResourceLink: false,
};

export default EditResourceDialog;
