import { useRef } from 'react';
import { FormGroup, Label, FormText, Input } from 'reactstrap';
import { updateLabel, updatePredicate, updateClass, updateResearchFields, updateResearchProblems } from 'slices/templateEditorSlice';
import { createPredicate } from 'services/backend/predicates';
import ConfirmClass from 'components/ConfirmationModal/ConfirmationModal';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import { useSelector, useDispatch } from 'react-redux';
import useConfirmPropertyModal from 'components/StatementBrowser/AddProperty/hooks/useConfirmPropertyModal';

const GeneralSettings = () => {
    const inputRef = useRef(null);
    const classAutocompleteRef = useRef(null);
    const predicateAutocompleteRef = useRef(null);
    const { confirmProperty } = useConfirmPropertyModal();
    const dispatch = useDispatch();
    const { templateID, label, predicate, class: clasS, editMode, researchProblems, researchFields } = useSelector(state => state.templateEditor);

    const handleChangeLabel = event => {
        dispatch(updateLabel(event.target.value));
    };

    const handlePropertySelect = async (selected, { action }) => {
        if (action === 'select-option') {
            dispatch(updatePredicate(selected));
        } else if (action === 'create-option') {
            const confirmedProperty = await confirmProperty();
            if (confirmedProperty) {
                const newPredicate = await createPredicate(selected.label);
                selected.id = newPredicate.id;
                dispatch(updatePredicate(selected));
            }
            // blur the field allows to focus and open the menu again
            predicateAutocompleteRef.current && predicateAutocompleteRef.current.blur();
        } else if (action === 'clear') {
            dispatch(updatePredicate(null));
        }
    };

    const handleClassSelect = async (selected, { action }) => {
        if (action === 'select-option') {
            dispatch(updateClass(selected));
        } else if (action === 'create-option') {
            const newClass = await ConfirmClass({
                label: selected.label
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

    /*
    const handleSwitchIsDescription = event => {
        dispatch(setIsClassDescription(event.target.checked));
    };
    */

    return (
        <div className="p-4">
            <FormGroup className="mb-4">
                <Label>Name of template</Label>
                <Input innerRef={inputRef} value={label} onChange={handleChangeLabel} disabled={!editMode} />
            </FormGroup>

            <FormGroup className="mb-4">
                <Label>Target class</Label>
                <AutoComplete
                    entityType={ENTITIES.CLASS}
                    placeholder={editMode ? 'Select or type to enter a class' : 'No Classes'}
                    onChange={handleClassSelect}
                    value={clasS}
                    autoLoadOption={true}
                    openMenuOnFocus={true}
                    allowCreate={true}
                    isDisabled={!editMode || (Boolean(templateID) && Boolean(clasS))}
                    copyValueButton={true}
                    isClearable
                    innerRef={classAutocompleteRef}
                    autoFocus={false}
                    linkButton={clasS && clasS.id ? reverse(ROUTES.CLASS, { id: clasS.id }) : ''}
                    linkButtonTippy="Go to class page"
                />
                {editMode && <FormText>Specify the class of this template. If not specified, a class is generated automatically.</FormText>}
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
                        <Label>Property</Label>
                        <AutoComplete
                            entityType={ENTITIES.PREDICATE}
                            placeholder={editMode ? 'Select or type to enter a property' : 'No Property'}
                            onChange={handlePropertySelect}
                            value={predicate}
                            autoLoadOption={true}
                            openMenuOnFocus={true}
                            allowCreate={true}
                            isDisabled={!editMode}
                            autoFocus={false}
                            isClearable
                            innerRef={predicateAutocompleteRef}
                        />
                        {editMode && (
                            <FormText>
                                Specify the property of this template. This property is used to link the contribution to the template instance.
                            </FormText>
                        )}
                    </FormGroup>
                    <FormGroup className="mb-4">
                        <Label>Research fields</Label>
                        <AutoComplete
                            entityType={ENTITIES.RESOURCE}
                            optionsClass={CLASSES.RESEARCH_FIELD}
                            placeholder={editMode ? 'Select or type to enter a research field' : 'No research fields'}
                            onChange={handleResearchFieldSelect}
                            value={researchFields}
                            autoLoadOption={true}
                            openMenuOnFocus={true}
                            autoFocus={false}
                            allowCreate={false}
                            isDisabled={!editMode}
                            isClearable
                            isMulti
                        />
                        {editMode && <FormText>Specify the research fields that uses this template.</FormText>}
                    </FormGroup>
                    <FormGroup className="mb-4">
                        <Label>Research problems</Label>
                        <AutoComplete
                            entityType={ENTITIES.RESOURCE}
                            optionsClass={CLASSES.PROBLEM}
                            placeholder={editMode ? 'Select or type to enter a research problem' : 'No research problem'}
                            onChange={handleResearchProblemSelect}
                            value={researchProblems}
                            autoLoadOption={true}
                            openMenuOnFocus={true}
                            autoFocus={false}
                            allowCreate={false}
                            isDisabled={!editMode}
                            isClearable
                            isMulti
                        />
                        {editMode && <FormText>Specify the research problems that uses this template.</FormText>}
                    </FormGroup>
                </fieldset>
            </>
        </div>
    );
};

export default GeneralSettings;
