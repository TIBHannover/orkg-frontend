import { SmartDescriptiveProperty } from 'components/SmartSuggestions/DescriptivePropertySuggestions';
import { PREDICATES } from 'constants/graphSettings';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Button, FormGroup, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { createLiteral } from 'services/backend/literals';
import { createPredicate } from 'services/backend/predicates';
import { createLiteralStatement } from 'services/backend/statements';

const ConfirmCreatePropertyModal = ({ toggle, onCreate, shouldPerformCreate = false, shouldHideDescriptionInput = false, label }) => {
    const [description, setDescription] = useState('');

    const isContributionEditor = true;

    const paperTitles = useSelector((state) =>
        isContributionEditor ? Object.values(state.contributionEditor.papers).map((p) => p.label) : [state.viewPaper.title],
    );

    const handleCreate = async () => {
        let id = null;
        if (shouldPerformCreate) {
            try {
                const property = await createPredicate(label);
                if (description && description.trim() !== '') {
                    const descriptionLiteral = await createLiteral(description);
                    createLiteralStatement(property.id, PREDICATES.DESCRIPTION, descriptionLiteral.id);
                }
                id = property.id;
            } catch (e) {
                toast.error('An error occurred while creating the property. Please reload the page and try again');
            }
        }
        onCreate({ description, label, id });
    };

    return (
        <Modal isOpen toggle={toggle}>
            <ModalHeader toggle={toggle}>Are you sure you need a new property?</ModalHeader>
            <ModalBody>
                Often there are existing properties that you can use as well. It is better to use existing properties than new ones.
                {!shouldHideDescriptionInput && (
                    <FormGroup>
                        <div className="position-relative">
                            <Input
                                type="textarea"
                                name="description"
                                value={description}
                                id="property-description"
                                placeholder="E.g. date of acceptance of the resource"
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={MAX_LENGTH_INPUT}
                                rows={5}
                                className="mt-2"
                            />
                            <SmartDescriptiveProperty propertyLabel={label} setDescription={setDescription} />
                        </div>
                    </FormGroup>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="light" onClick={toggle}>
                    Cancel
                </Button>
                <Button color="primary" onClick={handleCreate}>
                    Create
                </Button>
            </ModalFooter>
        </Modal>
    );
};

ConfirmCreatePropertyModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired,
    shouldPerformCreate: PropTypes.bool,
    label: PropTypes.string.isRequired,
    shouldHideDescriptionInput: PropTypes.bool,
};

export default ConfirmCreatePropertyModal;
