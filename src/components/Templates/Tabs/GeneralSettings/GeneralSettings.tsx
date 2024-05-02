import AutoComplete from 'components/Autocomplete/Autocomplete';
import ConfirmClass from 'components/ConfirmationModal/ConfirmationModal';
import ConfirmCreatePropertyModal from 'components/StatementBrowser/AddProperty/ConfirmCreatePropertyModal';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import { ChangeEvent, FC, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionMeta, SelectInstance } from 'react-select';
import { FormGroup, FormText, Input, Label } from 'reactstrap';
import { Class, Predicate, Resource } from 'services/backend/types';
import { updateDescription, updatePredicate, updateResearchFields, updateResearchProblems, updateTargetClass } from 'slices/templateEditorSlice';

export const MAX_DESCRIPTION_LENGTH = 350;

const GeneralSettings: FC<{}> = () => {
    const classAutocompleteRef = useRef<SelectInstance<Class> | null>(null);
    const predicateAutocompleteRef = useRef<SelectInstance<Predicate> | null>(null);
    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
    const [propertyLabel, setPropertyLabel] = useState('');
    const { isEditMode } = useIsEditMode();

    const dispatch = useDispatch();
    // @ts-expect-error
    const { description, target_class: targetClass } = useSelector((state) => state.templateEditor);

    const {
        research_problems: researchProblems,
        research_fields: researchFields,
        predicate,
        // @ts-expect-error
    } = useSelector((state) => state.templateEditor.relations);

    const handleChangeDescription = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch(updateDescription(e.target.value));
    };

    const handlePropertySelect = async (selected: Predicate | null, { action }: ActionMeta<Predicate>) => {
        if (action === 'select-option') {
            dispatch(updatePredicate(selected));
        } else if (action === 'create-option' && selected) {
            setIsOpenConfirmModal(true);
            setPropertyLabel(selected.label);
        } else if (action === 'clear') {
            dispatch(updatePredicate(null));
        }
    };

    const handleCreate = ({ id }: { id: string }) => {
        dispatch(updatePredicate({ label: propertyLabel, id }));
        setIsOpenConfirmModal(false);
    };

    const handleClassSelect = async (selected: Class | null, { action }: ActionMeta<Class>) => {
        if (action === 'select-option') {
            dispatch(updateTargetClass(selected));
        } else if (action === 'create-option' && selected) {
            const newClass = await ConfirmClass({
                label: selected.label,
            });
            if (newClass) {
                selected.id = newClass.id;
                dispatch(updateTargetClass(selected));
            }
            // blur the field allows to focus and open the menu again
            classAutocompleteRef.current && classAutocompleteRef.current.blur();
        } else if (action === 'clear') {
            dispatch(updateTargetClass(null));
        }
    };

    const handleResearchFieldSelect = (selected: Resource[] | null) => {
        dispatch(updateResearchFields(!selected ? [] : selected));
    };

    const handleResearchProblemSelect = (selected: Resource[] | null) => {
        dispatch(updateResearchProblems(!selected ? [] : selected));
    };
    return (
        <div className="p-4">
            {isOpenConfirmModal && (
                <ConfirmCreatePropertyModal
                    onCreate={handleCreate}
                    label={propertyLabel}
                    toggle={() => setIsOpenConfirmModal((v) => !v)}
                    shouldPerformCreate
                />
            )}

            <FormGroup className="mb-4">
                <Label for="target-class">Target class</Label>
                <AutoComplete
                    entityType={ENTITIES.CLASS}
                    placeholder={isEditMode ? 'Select or type to enter a class' : 'No Classes'}
                    onChange={handleClassSelect}
                    value={targetClass}
                    autoLoadOption
                    openMenuOnFocus
                    allowCreate
                    isDisabled={!isEditMode}
                    copyValueButton
                    isClearable={false}
                    innerRef={classAutocompleteRef}
                    autoFocus={false}
                    linkButton={targetClass && targetClass.id ? reverse(ROUTES.CLASS, { id: targetClass.id }) : ''}
                    linkButtonTippy="Go to class page"
                    inputId="target-class"
                />
            </FormGroup>
            <FormGroup className="mb-4">
                <Label for="template-description">Description</Label>
                <Input
                    type="textarea"
                    value={description || ''}
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
                        autoLoadOption
                        openMenuOnFocus
                        allowCreate
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
                        autoLoadOption
                        openMenuOnFocus
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
                        autoLoadOption
                        openMenuOnFocus
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
        </div>
    );
};

export default GeneralSettings;
