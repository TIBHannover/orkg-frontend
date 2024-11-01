import { faPlusCircle, faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import TemplatesModal from 'components/ContributionEditor/TemplatesModal/TemplatesModal';
import SmartPropertyGuidelinesCheck from 'components/SmartSuggestions/SmartPropertyGuidelinesCheck';
import SmartPropertySuggestions from 'components/SmartSuggestions/SmartPropertySuggestions';
import ConfirmCreatePropertyModal from 'components/DataBrowser/components/Footer/AddProperty/ConfirmCreatePropertyModal';
import { StyledButton } from 'components/StatementBrowser/styled';
import { ENTITIES } from 'constants/graphSettings';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, ButtonGroup, InputGroup } from 'reactstrap';
import { createProperty } from 'slices/contributionEditorSlice';

export const CreateProperty = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
    const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
    const [propertyLabel, setPropertyLabel] = useState('');

    const dispatch = useDispatch();
    const properties = useSelector((state) => state.contributionEditor.properties);
    const propertyLabels = Object.values(properties).map((property) => property.label);

    const handleCreate = ({ id, label }) => {
        dispatch(
            createProperty({
                id,
                label,
                action: 'select-option',
            }),
        );
        setIsCreating(false);
        setInputValue('');
        setIsOpenConfirmModal(false);
    };

    return (
        <>
            {isOpenConfirmModal && (
                <ConfirmCreatePropertyModal
                    onCreate={handleCreate}
                    label={propertyLabel}
                    toggle={() => setIsOpenConfirmModal((v) => !v)}
                    shouldPerformCreate
                />
            )}
            {!isCreating ? (
                <>
                    <ButtonGroup>
                        <Button color="secondary" size="sm" onClick={() => setIsCreating(true)}>
                            <FontAwesomeIcon icon={faPlusCircle} /> Add property
                        </Button>
                        <SmartPropertySuggestions properties={propertyLabels} handleCreate={handleCreate} />
                    </ButtonGroup>

                    <Button color="secondary" size="sm" onClick={() => setIsTemplatesModalOpen(true)} className="ms-1">
                        <FontAwesomeIcon className="me-1" icon={faPuzzlePiece} /> Templates
                    </Button>
                    {isTemplatesModalOpen && (
                        <TemplatesModal syncBackend setIsTemplatesModalOpen={setIsTemplatesModalOpen} isTemplatesModalOpen={isTemplatesModalOpen} />
                    )}
                </>
            ) : (
                <div style={{ maxWidth: 400 }}>
                    <InputGroup size="sm">
                        <Autocomplete
                            entityType={ENTITIES.PREDICATE}
                            placeholder="Enter a property"
                            onChange={(value, { action }) => {
                                if (action === 'select-option') {
                                    handleCreate(value);
                                } else if (action === 'create-option' && value) {
                                    setPropertyLabel(value.label);
                                    setIsOpenConfirmModal(true);
                                } else if (action === 'clear') {
                                    setPropertyLabel(null);
                                }
                            }}
                            onInputChange={(newValue, actionMeta) => {
                                if (actionMeta.action !== 'menu-close' && actionMeta.action !== 'input-blur') {
                                    setInputValue(newValue);
                                }
                            }}
                            autoFocus
                            openMenuOnFocus
                            size="sm"
                            menuPortalTarget={document.body} // use a portal to ensure the menu isn't blocked by other elements
                            allowCreate
                        />
                        <SmartPropertyGuidelinesCheck label={inputValue} />
                        <StyledButton outline onClick={() => setIsCreating(false)}>
                            Cancel
                        </StyledButton>
                    </InputGroup>
                </div>
            )}
        </>
    );
};

export default CreateProperty;
