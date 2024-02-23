import AutoComplete from 'components/Autocomplete/Autocomplete';
import ConfirmClass from 'components/ConfirmationModal/ConfirmationModal';
import ConfirmCreatePropertyModal from 'components/StatementBrowser/AddProperty/ConfirmCreatePropertyModal';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormGroup, FormText, Input, Label } from 'reactstrap';
import {
    updateClass,
    updateDescription,
    updateLabel,
    updatePredicate,
    updateResearchFields,
    updateResearchProblems,
} from 'slices/templateEditorSlice';

export const MAX_DESCRIPTION_LENGTH = 350;

const GeneralSettings = () => {
    const inputRef = useRef(null);
    const classAutocompleteRef = useRef(null);
    const predicateAutocompleteRef = useRef(null);
    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
    const [propertyLabel, setPropertyLabel] = useState('');
    const { isEditMode } = useIsEditMode();

    const dispatch = useDispatch();
    const { label, description, predicate, class: clasS, researchProblems, researchFields } = useSelector(state => state.templateEditor);

    const handleChangeLabel = event => {
        dispatch(updateLabel(event.target.value));
    };

    const handleChangeDescription = event => {
        dispatch(updateDescription(event.target.value));
    };

    const handlePropertySelect = async (selected, { action }) => {
        if (action === 'select-option') {
            dispatch(updatePredicate(selected));
        } else if (action === 'create-option') {
            setIsOpenConfirmModal(true);
            setPropertyLabel(selected.label);
        } else if (action === 'clear') {
            dispatch(updatePredicate(null));
        }
    };

    const handleCreate = ({ id }) => {
        dispatch(updatePredicate({ label: propertyLabel, id }));
        setIsOpenConfirmModal(false);
    };

    const handleClassSelect = async (selected, { action }) => {
        if (action === 'select-option') {
            dispatch(updateClass(selected));
        } else if (action === 'create-option') {
            const newClass = await ConfirmClass({
                label: selected.label,
            });
            if (newClass) {
                selected.id = newClass.id;
                dispatch(updateClass(selected));
            }
            // blur the field allows to focus and open the menu again
            classAutocompleteRef.current && classAutocompleteRef.current.blur();
        } else if (action === 'clear') {
            dispatch(updateClass(null));
        }
    };

    const handleResearchFieldSelect = selected => {
        dispatch(updateResearchFields(!selected ? [] : selected));
    };

    const handleResearchProblemSelect = selected => {
        dispatch(updateResearchProblems(!selected ? [] : selected));
    };
    return (
        <div className="p-4">
            {isOpenConfirmModal && (
                <ConfirmCreatePropertyModal
                    onCreate={handleCreate}
                    label={propertyLabel}
                    toggle={() => setIsOpenConfirmModal(v => !v)}
                    shouldPerformCreate
                />
            )}
            <FormGroup className="mb-4">
                <Label for="template-name">Name of template</Label>
                <Input innerRef={inputRef} value={label} onChange={handleChangeLabel} disabled={!isEditMode} id="template-name" />
            </FormGroup>

            <FormGroup className="mb-4">
                <Label for="target-class">
                    Target class <span className="text-muted fst-italic">(optional)</span>
                </Label>
                <AutoComplete
                    entityType={ENTITIES.CLASS}
                    placeholder={isEditMode ? 'Select or type to enter a class' : 'No Classes'}
                    onChange={handleClassSelect}
                    value={clasS}
                    autoLoadOption={true}
                    openMenuOnFocus={true}
                    allowCreate={true}
                    isDisabled={!isEditMode}
                    copyValueButton={true}
                    isClearable
                    innerRef={classAutocompleteRef}
                    autoFocus={false}
                    linkButton={clasS && clasS.id ? reverse(ROUTES.CLASS, { id: clasS.id }) : ''}
                    linkButtonTippy="Go to class page"
                    inputId="target-class"
                />
                {isEditMode && <FormText>Specify the class of this template. If not specified, a class is generated automatically.</FormText>}
            </FormGroup>
            <FormGroup className="mb-4">
                <Label for="template-description">Description</Label>
                <Input
                    type="textarea"
                    value={description}
                    onChange={handleChangeDescription}
                    disabled={!isEditMode}
                    id="template-description"
                    placeholder="Give a brief description of the template. E.g. what are the intended use cases?"
                    maxLength={MAX_DESCRIPTION_LENGTH}
                />
                <div className="text-muted text-end">
                    {description?.length}/{MAX_DESCRIPTION_LENGTH}
                </div>
            </FormGroup>
            <>
                <fieldset className="scheduler-border p-3">
                    <legend className="mt-3">Template use cases</legend>
                    <p>
                        <small className="text-muted">
                            These fields are optional, the property is used to link the contribution resource to the template instance. The research
                            fields/problems are used to suggest this template in the relevant papers.
                        </small>
                    </p>
                    <FormGroup className="mb-4">
                        <Label for="template-property">
                            Property <span className="text-muted fst-italic">(optional)</span>
                        </Label>
                        <AutoComplete
                            entityType={ENTITIES.PREDICATE}
                            placeholder={isEditMode ? 'Select or type to enter a property' : 'No Property'}
                            onChange={handlePropertySelect}
                            value={predicate}
                            autoLoadOption={true}
                            openMenuOnFocus={true}
                            allowCreate={true}
                            isDisabled={!isEditMode}
                            autoFocus={false}
                            isClearable
                            innerRef={predicateAutocompleteRef}
                            inputId="template-property"
                        />
                        {isEditMode && (
                            <FormText>
                                Specify the property of this template. This property is used to link the contribution to the template instance.
                            </FormText>
                        )}
                    </FormGroup>
                    <FormGroup className="mb-4">
                        <Label for="template-field">
                            Research fields <span className="text-muted fst-italic">(optional)</span>
                        </Label>
                        <AutoComplete
                            entityType={ENTITIES.RESOURCE}
                            optionsClass={CLASSES.RESEARCH_FIELD}
                            placeholder={isEditMode ? 'Select or type to enter a research field' : 'No research fields'}
                            onChange={handleResearchFieldSelect}
                            value={researchFields}
                            autoLoadOption={true}
                            openMenuOnFocus={true}
                            autoFocus={false}
                            allowCreate={false}
                            isDisabled={!isEditMode}
                            isClearable
                            isMulti
                            inputId="template-field"
                            ols={false}
                        />
                        {isEditMode && <FormText>Specify the research fields that uses this template.</FormText>}
                    </FormGroup>
                    <FormGroup className="mb-4">
                        <Label for="template-problems">
                            Research problems <span className="text-muted fst-italic">(optional)</span>
                        </Label>
                        <AutoComplete
                            entityType={ENTITIES.RESOURCE}
                            optionsClass={CLASSES.PROBLEM}
                            placeholder={isEditMode ? 'Select or type to enter a research problem' : 'No research problem'}
                            onChange={handleResearchProblemSelect}
                            value={researchProblems}
                            autoLoadOption={true}
                            openMenuOnFocus={true}
                            autoFocus={false}
                            allowCreate={false}
                            isDisabled={!isEditMode}
                            isClearable
                            isMulti
                            inputId="template-problems"
                            ols={false}
                        />
                        {isEditMode && <FormText>Specify the research problems that uses this template.</FormText>}
                    </FormGroup>
                </fieldset>
            </>
        </div>
    );
};

export default GeneralSettings;
