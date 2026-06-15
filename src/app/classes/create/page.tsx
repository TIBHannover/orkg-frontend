'use client';

import { faClipboard, faExternalLinkAlt, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup, Card, Description, Form, Input, Label, TextField, toast, Tooltip } from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ActionMeta, SelectInstance, SingleValue } from 'react-select';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import TreeSelector from '@/components/Autocomplete/ValueButtons/TreeSelector';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import ConfirmClass from '@/components/ConfirmationModal/ConfirmationModal';
import useAuthentication from '@/components/hooks/useAuthentication';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import { ENTITIES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import REGEX from '@/constants/regex';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import requireAuthentication from '@/requireAuthentication';
import { createClass, setParentClassByID } from '@/services/backend/classes';
import { getErrorMessage, getLinkByEntityType } from '@/utils';

const CreateClassPage = () => {
    const isURI = new RegExp(REGEX.URL);
    const [uri, setUri] = useState('');
    const [label, setLabel] = useState('');
    const [parentClass, setParentClass] = useState<SingleValue<OptionType>>(null);
    const parentClassAutocompleteRef = useRef<SelectInstance<OptionType | null>>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const { isCurationAllowed } = useAuthentication();

    useEffect(() => {
        document.title = 'Add Class - ORKG';
    }, []);

    const submitCreateClass = async () => {
        setIsLoading(true);
        if (label.trim() !== '') {
            if (uri && !isURI.test(uri.trim())) {
                toast.danger('Please enter a valid URI of the class');
                setIsLoading(false);
                return;
            }
            if (parentClass && !parentClass.id) {
                toast.danger('Please enter a valid parent class');
                setIsLoading(false);
                return;
            }
            try {
                const newClassId = await createClass(label, uri || undefined);
                if (parentClass) {
                    await setParentClassByID(newClassId, parentClass.id);
                }
                toast.success('Class created successfully');
                setIsLoading(false);
                router.push(`${reverse(ROUTES.CLASS, { id: newClassId })}?isEditMode=true`);
            } catch (error) {
                console.error(error);
                setIsLoading(false);
                toast.danger(`${getErrorMessage(error as object, 'uri')}`);
            }
        } else {
            setIsLoading(false);
            toast.danger('Please enter the label of the class');
        }
    };

    const handleParentClassSelect = async (selected: SingleValue<OptionType>, { action }: ActionMeta<OptionType>) => {
        if (action === 'select-option') {
            setParentClass(selected);
        } else if (action === 'create-option' && selected) {
            const newClass = await ConfirmClass({
                label: selected.label,
            });
            if (newClass) {
                setParentClass({ ...selected, id: newClass.id });
            }
            parentClassAutocompleteRef.current?.blur();
        } else if (action === 'clear') {
            setParentClass(null);
        }
    };

    const handleCopyParentId = () => {
        if (parentClass?.id && navigator.clipboard) {
            navigator.clipboard.writeText(parentClass.id);
            toast.success('ID copied to clipboard');
        }
    };

    const hasParentClass = !!parentClass?.id;
    const parentClassLink = hasParentClass ? getLinkByEntityType(parentClass._class || 'class', parentClass.id) : '#';

    return (
        <>
            <TitleBar>Create class</TitleBar>
            <Container>
                <Card className="box rounded p-12">
                    <Card.Content className="gap-6 p-0">
                        <p className="text-foreground/90 leading-relaxed">
                            This form allows you to create a new class. If you want to create a hierarchy of classes, we suggest that you first create
                            the root class, which is the highest-level class in the hierarchy. Alternatively, you can also suggest to include a new
                            ontology to the{' '}
                            <a
                                href="https://terminology.tib.eu/ts/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent underline underline-offset-2"
                            >
                                TIB Terminology Service <FontAwesomeIcon size="sm" icon={faExternalLinkAlt} />
                            </a>{' '}
                            by creating an issue at the{' '}
                            <a
                                href="https://github.com/TIBHannover/OLS/issues"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent underline underline-offset-2"
                            >
                                issue tracker <FontAwesomeIcon size="sm" icon={faExternalLinkAlt} />
                            </a>{' '}
                            .
                        </p>
                        <Form
                            className="flex flex-col gap-6 px-4 pt-2"
                            onSubmit={(e) => {
                                e.preventDefault();
                                void submitCreateClass();
                            }}
                        >
                            <TextField fullWidth isDisabled={isLoading} name="value">
                                <Label htmlFor="classLabel">Class label</Label>
                                <Input
                                    id="classLabel"
                                    maxLength={MAX_LENGTH_INPUT}
                                    type="text"
                                    value={label}
                                    onChange={(ev) => setLabel(ev.target.value)}
                                />
                            </TextField>

                            <TextField fullWidth name="uri">
                                <Label htmlFor="URIInput">
                                    URI <span className="text-muted font-normal italic">(optional)</span>
                                </Label>
                                <Input id="URIInput" type="url" value={uri} onChange={(ev) => setUri(ev.target.value)} />
                                <Description>
                                    Please provide the URI of the class if you are using a class defined in an external ontology
                                </Description>
                            </TextField>

                            <div className="flex flex-col gap-1">
                                <Label htmlFor="target-class">
                                    Subclass of <span className="text-muted font-normal italic">(optional)</span>
                                </Label>
                                {/* Autocomplete and action buttons are attached into a single InputGroup-like control */}
                                <div className="flex items-stretch">
                                    <div className="min-w-0 flex-1">
                                        <Autocomplete
                                            entityType={ENTITIES.CLASS}
                                            placeholder={isCurationAllowed ? 'Select or type to enter a class' : 'This field requires a curator role'}
                                            onChange={handleParentClassSelect}
                                            value={parentClass}
                                            openMenuOnFocus
                                            allowCreate
                                            isClearable
                                            // @ts-expect-error innerRef is supported by underlying AsyncPaginate/Creatable
                                            innerRef={parentClassAutocompleteRef}
                                            inputId="target-class"
                                            isDisabled={!isCurationAllowed}
                                            enableExternalSources
                                            noFormControl={hasParentClass}
                                        />
                                    </div>
                                    {hasParentClass && (
                                        <ButtonGroup
                                            variant="tertiary"
                                            size="md"
                                            aria-label="Parent class actions"
                                            className="shrink-0 [&>[data-slot='button']:first-child]:rounded-l-none"
                                        >
                                            <TreeSelector
                                                onChange={handleParentClassSelect}
                                                value={parentClass}
                                                isDisabled={!isCurationAllowed}
                                                renderTrigger={({ open }) => (
                                                    <Tooltip delay={0}>
                                                        <Button isIconOnly aria-label="Show class tree" onPress={open} variant="tertiary">
                                                            <FontAwesomeIcon icon={faSitemap} className="size-3.5" />
                                                        </Button>
                                                        <Tooltip.Content>Show class tree</Tooltip.Content>
                                                    </Tooltip>
                                                )}
                                            />
                                            <Tooltip delay={0}>
                                                <Button isIconOnly aria-label="Copy ID to clipboard" onPress={handleCopyParentId} variant="tertiary">
                                                    <ButtonGroup.Separator />
                                                    <FontAwesomeIcon icon={faClipboard} className="size-3.5" />
                                                </Button>
                                                <Tooltip.Content>Copy ID to clipboard</Tooltip.Content>
                                            </Tooltip>
                                            <Tooltip delay={0}>
                                                <Button
                                                    variant="tertiary"
                                                    isIconOnly
                                                    aria-label="Open class page"
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    render={(props: any) => (
                                                        <Link {...props} href={parentClassLink} target="_blank" rel="noreferrer" />
                                                    )}
                                                >
                                                    <ButtonGroup.Separator />
                                                    <FontAwesomeIcon icon={faExternalLinkAlt} className="size-3.5" />
                                                </Button>
                                                <Tooltip.Content>Open class page</Tooltip.Content>
                                            </Tooltip>
                                        </ButtonGroup>
                                    )}
                                </div>
                                {isCurationAllowed && (
                                    <Description>
                                        Enter the parent class for this new class. Select an existing class, or create a new one by typing its name.
                                    </Description>
                                )}
                            </div>

                            <ButtonWithLoading type="submit" variant="primary" className="mt-2 w-fit" isLoading={isLoading}>
                                Create class
                            </ButtonWithLoading>
                        </Form>
                    </Card.Content>
                </Card>
            </Container>
        </>
    );
};

export default requireAuthentication(CreateClassPage);
