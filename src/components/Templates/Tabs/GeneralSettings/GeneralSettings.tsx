import { faClipboard, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup, Label, TextArea, TextField, toast, Tooltip } from '@heroui/react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { ActionMeta, MultiValue, SingleValue } from 'react-select';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import ConfirmClass from '@/components/ConfirmationModal/ConfirmationModal';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { updateDescription, updateResearchFields, updateResearchProblems, updateTargetClass } from '@/slices/templateEditorSlice';
import { RootStore } from '@/slices/types';
import { getLinkByEntityType } from '@/utils';

export const MAX_DESCRIPTION_LENGTH = 350;

const GeneralSettings = () => {
    const { isEditMode } = useIsEditMode();

    const dispatch = useDispatch();
    const description = useSelector((state: RootStore) => state.templateEditor.description);
    const targetClass = useSelector((state: RootStore) => state.templateEditor.target_class);
    const researchFields = useSelector((state: RootStore) => state.templateEditor.relations.research_fields);
    const researchProblems = useSelector((state: RootStore) => state.templateEditor.relations.research_problems);

    const handleChangeDescription = (value: string) => {
        dispatch(updateDescription(value));
    };

    const handleClassSelect = async (selected: SingleValue<OptionType>, { action }: ActionMeta<OptionType>) => {
        if (action === 'select-option') {
            dispatch(updateTargetClass(selected));
        } else if (action === 'create-option' && selected) {
            const newClass = await ConfirmClass({
                label: selected.label,
            });
            if (newClass) {
                dispatch(updateTargetClass({ ...selected, id: newClass.id }));
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

    const hasTargetClass = !!targetClass?.id;
    const targetClassLink = hasTargetClass ? getLinkByEntityType(targetClass?._class || 'class', targetClass!.id) : '#';

    const handleCopyTargetClassId = () => {
        if (targetClass?.id && navigator.clipboard) {
            navigator.clipboard.writeText(targetClass.id);
            toast.success('ID copied to clipboard');
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Label htmlFor="target-class" className="mb-1 inline-block">
                    Target class
                </Label>
                <div className="flex items-stretch">
                    <div className="min-w-0 flex-1">
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
                            groupPosition={hasTargetClass ? 'start' : undefined}
                        />
                    </div>
                    {hasTargetClass && (
                        <ButtonGroup
                            variant="tertiary"
                            size="md"
                            aria-label="Target class actions"
                            className="shrink-0 [&>[data-slot='button']:first-child]:rounded-l-none"
                        >
                            <Tooltip delay={0}>
                                <Button isIconOnly aria-label="Copy ID to clipboard" onPress={handleCopyTargetClassId} variant="tertiary">
                                    <FontAwesomeIcon icon={faClipboard} className="size-3.5 text-muted" />
                                </Button>
                                <Tooltip.Content>Copy ID to clipboard</Tooltip.Content>
                            </Tooltip>
                            <Tooltip delay={0}>
                                <Button
                                    variant="tertiary"
                                    isIconOnly
                                    aria-label="Open class page"
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    render={(props: any) => <Link {...props} href={targetClassLink} target="_blank" rel="noreferrer" />}
                                >
                                    <ButtonGroup.Separator />
                                    <FontAwesomeIcon icon={faExternalLinkAlt} className="size-3.5 text-muted" />
                                </Button>
                                <Tooltip.Content>Open class page</Tooltip.Content>
                            </Tooltip>
                        </ButtonGroup>
                    )}
                </div>
            </div>
            <div className="mb-6">
                <Label htmlFor="template-description" className="mb-1 inline-block">
                    Description
                </Label>
                <TextField
                    fullWidth
                    value={description || ''}
                    onChange={handleChangeDescription}
                    isDisabled={!isEditMode}
                    aria-label="Template description"
                >
                    <TextArea
                        id="template-description"
                        placeholder="Give a brief description of the template. E.g. what are the intended use cases?"
                        maxLength={MAX_DESCRIPTION_LENGTH}
                        rows={4}
                        className="!border !border-border focus:!border-accent"
                    />
                </TextField>
                <div className="text-muted text-right text-sm">
                    {description?.length ?? 0}/{MAX_DESCRIPTION_LENGTH}
                </div>
            </div>
            <fieldset className="mt-6 rounded border border-border p-4">
                <legend className="px-2 text-sm font-semibold">Template use cases</legend>
                <p className="text-muted text-sm mb-4">
                    These fields are optional. The research fields/problems are used to suggest this template in the relevant papers.
                </p>
                <div className="mb-6">
                    <Label htmlFor="template-field" className="mb-1 inline-block">
                        Research fields <span className="text-muted italic">(optional)</span>
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
                    {isEditMode && <p className="text-muted text-sm mt-1">Specify the research fields that uses this template.</p>}
                </div>
                <div className="mb-2">
                    <Label htmlFor="template-problems" className="mb-1 inline-block">
                        Research problems <span className="text-muted italic">(optional)</span>
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
                    {isEditMode && <p className="text-muted text-sm mt-1">Specify the research problems that uses this template.</p>}
                </div>
            </fieldset>
        </div>
    );
};

export default GeneralSettings;
