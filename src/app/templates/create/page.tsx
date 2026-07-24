'use client';

import { faClipboard, faExternalLinkAlt, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup, Description, Input, Label, Separator, TextField, toast, Tooltip as HeroTooltip } from '@heroui/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ActionMeta, SelectInstance, SingleValue } from 'react-select';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import ConfirmClass from '@/components/ConfirmationModal/ConfirmationModal';
import Tooltip from '@/components/FloatingUI/Tooltip';
import useAuthentication from '@/components/hooks/useAuthentication';
import useMembership from '@/components/hooks/useMembership';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import Unauthorized from '@/components/Unauthorized/Unauthorized';
import { ENTITIES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { createClass, getClassById } from '@/services/backend/classes';
import { createTemplate } from '@/services/backend/templates';
import { getLinkByEntityType } from '@/utils';

const TemplateNew = () => {
    const [label, setLabel] = useState('');
    const [targetClass, setTargetClass] = useState<SingleValue<OptionType> | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuthentication();
    const { organizationId, observatoryId } = useMembership();

    const classAutocompleteRef = useRef<SelectInstance<OptionType | null>>(null);

    useEffect(() => {
        document.title = 'Create new template - ORKG';
    });

    useEffect(() => {
        const getDefaultClass = () => {
            const targetClassID = searchParams.get('classID');
            if (targetClassID) {
                getClassById(targetClassID).then((classesData) => {
                    setTargetClass(classesData);
                });
            }
        };
        getDefaultClass();
    }, [searchParams]);

    const handleCreate = async () => {
        if (!label) {
            toast.danger('Enter a template name');
            return;
        }
        setIsSaving(true);
        try {
            let targetClassId = targetClass?.id;
            if (!targetClassId) {
                try {
                    const newClassId = await createClass(`${label} [C]`);
                    targetClassId = newClassId;
                } catch (e: any) {
                    toast.danger(e.message);
                    setIsSaving(false);
                    return;
                }
            }
            const data = {
                label,
                target_class: targetClassId,
                relations: { research_fields: [], research_problems: [] },
                properties: [],
                observatories: observatoryId ? [observatoryId] : [],
                organizations: organizationId ? [organizationId] : [],
                is_closed: false,
            };
            const templateResource = await createTemplate(data);
            if (templateResource) {
                router.push(`${reverse(ROUTES.TEMPLATE, { id: templateResource })}?isEditMode=true`);
            } else {
                throw new Error('Failed to create template');
            }
        } catch (e: any) {
            toast.danger(e.message || 'Failed to create template');
            setIsSaving(false);
        }
    };

    const handleClassSelect = async (selected: SingleValue<OptionType>, { action }: ActionMeta<OptionType>) => {
        if (action === 'select-option') {
            setTargetClass(selected);
        } else if (action === 'create-option' && selected) {
            const newClass = await ConfirmClass({
                label: selected.label,
            });
            if (newClass) {
                selected.id = newClass.id;
                setTargetClass(selected);
            }
            // blur the field allows to focus and open the menu again
            if (classAutocompleteRef.current) {
                classAutocompleteRef.current.blur();
            }
        } else if (action === 'clear') {
            setTargetClass(null);
        }
    };

    const handleCopyTargetId = () => {
        if (targetClass?.id && navigator.clipboard) {
            navigator.clipboard.writeText(targetClass.id);
            toast.success('ID copied to clipboard');
        }
    };

    const targetClassLink = targetClass?.id ? getLinkByEntityType(targetClass._class || 'class', targetClass.id) : '#';
    const hasTargetClass = Boolean(targetClass?.id);

    if (!user) {
        return <Unauthorized />;
    }

    return (
        <>
            <TitleBar>Create template</TitleBar>
            <Container>
                <div className="box rounded py-6 px-12">
                    <p>
                        Templates allows to specify the structure of content types, and they can be used when describing research contributions.{' '}
                        <a href="https://orkg.org/about/19/Templates" rel="noreferrer" target="_blank">
                            Learn more in the help center
                        </a>
                        .
                    </p>
                    <Separator className="my-4" />
                    {searchParams.get('classID') && targetClass?.id && (
                        <div className="rounded mb-4 p-4 bg-default text-default-foreground">
                            You are creating a template for the class{' '}
                            <Link target="_blank" href={reverse(ROUTES.CLASS, { id: targetClass.id })}>
                                {targetClass.label}
                            </Link>
                        </div>
                    )}
                    <TextField className="mb-3 flex flex-col gap-1" value={label} onChange={setLabel} maxLength={MAX_LENGTH_INPUT}>
                        <Tooltip content="Choose the name of your template. You can always update this name later">
                            <span className="inline-flex items-center gap-1">
                                <Label>Name</Label> <FontAwesomeIcon icon={faQuestionCircle} className="text-muted" />
                            </span>
                        </Tooltip>
                        <Input id="templateName" />
                    </TextField>
                    {!searchParams.get('classID') && (
                        <div className="mb-6 flex flex-col gap-1">
                            <Label htmlFor="target-class">
                                Target class <span className="text-muted font-normal italic">(optional)</span>
                            </Label>
                            {/* Autocomplete and action buttons are attached into a single InputGroup-like control */}
                            <div className="flex items-stretch">
                                <div className="min-w-0 flex-1">
                                    <Autocomplete
                                        entityType={ENTITIES.CLASS}
                                        placeholder="Select or type to enter a class"
                                        onChange={handleClassSelect}
                                        value={targetClass}
                                        openMenuOnFocus
                                        allowCreate
                                        isClearable
                                        // @ts-expect-error innerRef is supported by underlying AsyncPaginate/Creatable
                                        innerRef={classAutocompleteRef}
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
                                        <HeroTooltip delay={0}>
                                            <Button isIconOnly aria-label="Copy ID to clipboard" onPress={handleCopyTargetId} variant="tertiary">
                                                <FontAwesomeIcon icon={faClipboard} className="size-3.5 text-muted" />
                                            </Button>
                                            <HeroTooltip.Content>Copy ID to clipboard</HeroTooltip.Content>
                                        </HeroTooltip>
                                        <HeroTooltip delay={0}>
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
                                            <HeroTooltip.Content>Open class page</HeroTooltip.Content>
                                        </HeroTooltip>
                                    </ButtonGroup>
                                )}
                            </div>
                            <Description className="text-muted text-sm">
                                Specify the class of this template. If not specified, a class is generated automatically.
                            </Description>
                        </div>
                    )}

                    <div className="text-right">
                        <ButtonWithLoading variant="primary" onClick={handleCreate} isLoading={isSaving}>
                            Create
                        </ButtonWithLoading>
                    </div>
                </div>
            </Container>
        </>
    );
};

export default TemplateNew;
