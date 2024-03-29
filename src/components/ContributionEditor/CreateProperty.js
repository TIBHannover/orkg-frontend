import { faPlusCircle, faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { createProperty } from 'slices/contributionEditorSlice';
import TemplatesModal from 'components/ContributionEditor/TemplatesModal/TemplatesModal';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { ENTITIES } from 'constants/graphSettings';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, ButtonGroup, InputGroup } from 'reactstrap';
import { isString } from 'lodash';
import { StyledButton } from 'components/StatementBrowser/styled';
import ConfirmCreatePropertyModal from 'components/StatementBrowser/AddProperty/ConfirmCreatePropertyModal';
import SmartPropertySuggestions from 'components/SmartSuggestions/SmartPropertySuggestions';
import SmartPropertyGuidelinesCheck from 'components/SmartSuggestions/SmartPropertyGuidelinesCheck';

export const CreateProperty = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
    const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
    const [propertyLabel, setPropertyLabel] = useState('');

    const dispatch = useDispatch();
    const properties = useSelector(state => state.contributionEditor.properties);
    const propertyLabels = Object.values(properties).map(property => property.label);

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

    const handleChangeAutocomplete = async selected => {
        if (isString(selected)) {
            setPropertyLabel(selected);
            setIsOpenConfirmModal(true);
        } else {
            handleCreate(selected);
        }
    };

    return (
        <>
            {isOpenConfirmModal && (
                <ConfirmCreatePropertyModal
                    onCreate={handleCreate}
                    label={propertyLabel}
                    toggle={() => setIsOpenConfirmModal(v => !v)}
                    shouldPerformCreate
                />
            )}
            {!isCreating ? (
                <>
                    <ButtonGroup>
                        <Button color="secondary" size="sm" onClick={() => setIsCreating(true)}>
                            <Icon icon={faPlusCircle} /> Add property
                        </Button>
                        <SmartPropertySuggestions properties={propertyLabels} handleCreate={handleCreate} />
                    </ButtonGroup>

                    <Button color="secondary" size="sm" onClick={() => setIsTemplatesModalOpen(true)} className="ms-1">
                        <Icon className="me-1" icon={faPuzzlePiece} /> Templates
                    </Button>
                    {isTemplatesModalOpen && (
                        <TemplatesModal
                            syncBackend={true}
                            setIsTemplatesModalOpen={setIsTemplatesModalOpen}
                            isTemplatesModalOpen={isTemplatesModalOpen}
                        />
                    )}
                </>
            ) : (
                <div style={{ maxWidth: 400 }}>
                    <InputGroup size="sm">
                        <Autocomplete
                            entityType={ENTITIES.PREDICATE}
                            placeholder="Enter a property"
                            onItemSelected={handleChangeAutocomplete}
                            onNewItemSelected={handleChangeAutocomplete}
                            onInput={(e, value) => setInputValue(e ? e.target.value : value)}
                            value={inputValue}
                            openMenuOnFocus={true}
                            cssClasses="form-control-sm"
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
