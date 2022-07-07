import { faPlusCircle, faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { createProperty } from 'slices/contributionEditorSlice';
import TemplatesModal from 'components/ContributionEditor/TemplatesModal/TemplatesModal';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { ENTITIES } from 'constants/graphSettings';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'reactstrap';
import ConfirmCreatePropertyModal from 'components/StatementBrowser/AddProperty/ConfirmCreatePropertyModal';

export const CreateProperty = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
    const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
    const dispatch = useDispatch();

    const handleCreate = ({ id }) => {
        dispatch(
            createProperty({
                id,
                label: inputValue,
                action: 'select-option',
            }),
        );
        setIsCreating(false);
        setInputValue('');
        setIsOpenConfirmModal(false);
    };

    const handleChangeAutocomplete = async (selected, { action }) => {
        if (action === 'create-option') {
            setIsOpenConfirmModal(true);
        } else {
            handleCreate({ id: selected.id });
        }
    };

    return (
        <>
            {isOpenConfirmModal && (
                <ConfirmCreatePropertyModal
                    onCreate={handleCreate}
                    label={inputValue}
                    toggle={() => setIsOpenConfirmModal(v => !v)}
                    shouldPerformCreate
                />
            )}
            {!isCreating ? (
                <>
                    <Button color="secondary" size="sm" onClick={() => setIsCreating(true)}>
                        <Icon icon={faPlusCircle} /> Add property
                    </Button>
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
                <div style={{ maxWidth: 300 }}>
                    <Autocomplete
                        entityType={ENTITIES.PREDICATE}
                        placeholder="Enter a property"
                        onChange={handleChangeAutocomplete}
                        onInput={(e, value) => setInputValue(e ? e.target.value : value)}
                        value={inputValue}
                        onBlur={() => setIsCreating(false)}
                        openMenuOnFocus={true}
                        cssClasses="form-control-sm"
                        menuPortalTarget={document.body} // use a portal to ensure the menu isn't blocked by other elements
                        allowCreate
                    />
                </div>
            )}
        </>
    );
};

export default CreateProperty;
