import { ChangeEvent, FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionMeta, MultiValue, SingleValue } from 'react-select';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import CopyIdButton from '@/components/Autocomplete/ValueButtons/CopyIdButton';
import LinkButton from '@/components/Autocomplete/ValueButtons/LinkButton';
import ConfirmClass from '@/components/ConfirmationModal/ConfirmationModal';
import FormGroup from '@/components/Ui/Form/FormGroup';
import FormText from '@/components/Ui/Form/FormText';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import Label from '@/components/Ui/Label/Label';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { updateDescription, updateResearchFields, updateResearchProblems, updateTargetClass } from '@/slices/templateEditorSlice';

export const MAX_DESCRIPTION_LENGTH = 350;

const GeneralSettings = () => {
    const { isEditMode } = useIsEditMode();

    const dispatch = useDispatch();
    // @ts-expect-error
    const { description, target_class: targetClass } = useSelector((state) => state.templateEditor);

    const {
        research_problems: researchProblems,
        research_fields: researchFields,
        // @ts-expect-error
    } = useSelector((state) => state.templateEditor.relations);

    const handleChangeDescription = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch(updateDescription(e.target.value));
    };

    const handleClassSelect = async (selected: SingleValue<OptionType>, { action }: ActionMeta<OptionType>) => {
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
        } else if (action === 'clear') {
            dispatch(updateTargetClass(null));
        }
    };

    const handleResearchFieldSelect = (selected: MultiValue<OptionType>) => {
        dispatch(updateResearchFields(!selected ? [] : selected));
    };

    const handleResearchProblemSelect = (selected: MultiValue<OptionType>) => {
        dispatch(updateResearchProblems(!selected ? [] : selected));
    };

    return (
        <div className="p-4">
            <FormGroup className="mb-4">
                <Label for="target-class">Target class</Label>
                <InputGroup>
                    <Autocomplete
                        entityType={ENTITIES.CLASS}
                        placeholder={isEditMode ? 'Select or type to enter a class' : 'No Classes'}
                        onChange={handleClassSelect}
                        value={targetClass}
                        openMenuOnFocus
                        allowCreate
                        isDisabled={!isEditMode}
                        isClearable={false}
                        inputId="target-class"
                    />
                    <CopyIdButton value={targetClass} />
                    <LinkButton value={targetClass} />
                </InputGroup>
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
                        These fields are optional. The research fields/problems are used to suggest this template in the relevant papers.
                    </small>
                </p>
                <FormGroup className="mb-4">
                    <Label for="template-field">
                        Research fields <span className="text-muted fst-italic">(optional)</span>
                    </Label>
                    <Autocomplete
                        entityType={ENTITIES.RESOURCE}
                        includeClasses={[CLASSES.RESEARCH_FIELD]}
                        placeholder={isEditMode ? 'Select or type to enter a research field' : 'No research fields'}
                        onChange={handleResearchFieldSelect}
                        value={researchFields}
                        openMenuOnFocus
                        allowCreate={false}
                        isDisabled={!isEditMode}
                        isClearable
                        isMulti
                        inputId="template-field"
                        enableExternalSources={false}
                    />
                    {isEditMode && <FormText>Specify the research fields that uses this template.</FormText>}
                </FormGroup>
                <FormGroup className="mb-4">
                    <Label for="template-problems">
                        Research problems <span className="text-muted fst-italic">(optional)</span>
                    </Label>
                    <Autocomplete
                        entityType={ENTITIES.RESOURCE}
                        includeClasses={[CLASSES.PROBLEM]}
                        placeholder={isEditMode ? 'Select or type to enter a research problem' : 'No research problem'}
                        onChange={handleResearchProblemSelect}
                        value={researchProblems}
                        openMenuOnFocus
                        allowCreate={false}
                        isDisabled={!isEditMode}
                        isClearable
                        isMulti
                        inputId="template-problems"
                        enableExternalSources={false}
                    />
                    {isEditMode && <FormText>Specify the research problems that uses this template.</FormText>}
                </FormGroup>
            </fieldset>
        </div>
    );
};

export default GeneralSettings;
