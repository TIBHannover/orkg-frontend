'use client';

import { Label, Separator, toast, ToggleButton, ToggleButtonGroup } from '@heroui/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SingleValue } from 'react-select';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import CopyId from '@/components/CopyId/CopyId';
import DataBrowser from '@/components/DataBrowser/DataBrowser';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import requireAuthentication from '@/requireAuthentication';
import { createClass } from '@/services/backend/classes';
import { createPredicate } from '@/services/backend/predicates';
import { createResource } from '@/services/backend/resources';
import { getThing } from '@/services/backend/things';
import { EntityType } from '@/services/backend/types';

const ENTITY_TYPE_OPTIONS: { id: EntityType; label: string }[] = [
    { id: ENTITIES.RESOURCE, label: 'Resource' },
    { id: ENTITIES.CLASS, label: 'Class' },
    { id: ENTITIES.PREDICATE, label: 'Property' },
];

const AutocompletePage = () => {
    const [entity, setEntity] = useState<SingleValue<OptionType>>(null);
    const [entityType, setEntityType] = useState<EntityType>(ENTITIES.RESOURCE);
    const [inputValue, setInputValue] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const entityTypeLabel = entityType === ENTITIES.PREDICATE ? 'property' : entityType;

    useEffect(() => {
        document.title = `Entity lookup tool - ${entityTypeLabel}`;
    }, [entityTypeLabel]);

    const handleParentClassSelect = (selected: SingleValue<OptionType>) => {
        setEntity(selected);
    };

    const handleCreate = async () => {
        if (entity?.__isNew__ && entity.label) {
            setIsCreating(true);
            let newEntityId = '';
            try {
                if (entityType === ENTITIES.RESOURCE) {
                    newEntityId = await createResource({ label: entity.label, classes: [] });
                } else if (entityType === ENTITIES.CLASS) {
                    newEntityId = await createClass(entity.label);
                } else if (entityType === ENTITIES.PREDICATE) {
                    newEntityId = await createPredicate(entity.label);
                }
            } catch (error) {
                console.error(error);
                toast.danger('Error creating entity');
            } finally {
                const newEntity = await getThing(newEntityId);
                setEntity(newEntity as OptionType);
                setIsCreating(false);
            }
        }
    };

    const exists = entity && !entity.__isNew__;
    return (
        <>
            <TitleBar>Entity lookup tool</TitleBar>
            <Container>
                <div className="box rounded p-6">
                    <div className="mb-6 text-sm leading-relaxed">
                        This page helps you look up and import entities for use with the{' '}
                        <Link href={reverse(ROUTES.CSV_IMPORT)} target="_blank" className="font-medium text-primary underline underline-offset-2">
                            ORKG CSV import tool
                        </Link>
                        . An entity represents a type of item in the system — a <i>Resource</i>, <i>Class</i>, or <i>Property</i>.
                        <ul className="mt-2 list-disc list-inside space-y-1">
                            <li>Search for entities in ORKG and copy their IDs to include in your CSV file.</li>
                            <li>Create new entities if the one you need does not yet exist.</li>
                            <li>
                                Search for existing entities by ID using <code>#</code> as a prefix (e.g., <code>#R12</code>).
                            </li>
                        </ul>
                        <p className="mt-2 mb-0">
                            If you don't find the entity you're looking for, enter your label, close the options menu, and click the <b>Create</b>{' '}
                            button to generate a new entity and obtain its ID.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-sm font-medium">Entity type</Label>
                            <ToggleButtonGroup
                                aria-label="Entity type"
                                selectionMode="single"
                                disallowEmptySelection
                                selectedKeys={new Set([entityType])}
                                onSelectionChange={(keys) => {
                                    const next = [...keys][0] as EntityType | undefined;
                                    if (next) setEntityType(next);
                                }}
                            >
                                {ENTITY_TYPE_OPTIONS.map((option, i) => (
                                    <ToggleButton key={option.id} id={option.id}>
                                        {i > 0 && <ToggleButtonGroup.Separator />}
                                        {option.label}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </div>
                        <div className="flex items-stretch min-h-9">
                            <div className="flex-1 min-w-0 [&_.react-select__control]:!rounded-e-none">
                                <Autocomplete
                                    key={entityType}
                                    entityType={entityType}
                                    placeholder={`Select or type to enter a ${entityTypeLabel}`}
                                    onChange={handleParentClassSelect}
                                    value={entity}
                                    openMenuOnFocus
                                    allowCreate={false}
                                    isClearable
                                    enableExternalSources
                                    onInputChange={(value, action) => {
                                        if (action?.action !== 'input-blur' && action?.action !== 'menu-close') {
                                            setInputValue(value);
                                        }
                                        if ((action?.action === 'input-blur' || action?.action === 'menu-close') && inputValue) {
                                            setEntity({ label: inputValue, id: inputValue, __isNew__: true });
                                            setInputValue('');
                                        }
                                    }}
                                    noOptionsMessage={() => 'No results found, use the create button to create a new entity'}
                                />
                            </div>
                            <ButtonWithLoading
                                isDisabled={!entity?.__isNew__}
                                onPress={() => handleCreate()}
                                isLoading={isCreating}
                                loadingMessage="Creating entity..."
                                className="!h-9 !rounded-s-none -ms-px"
                            >
                                Create
                            </ButtonWithLoading>
                        </div>
                    </div>
                </div>
            </Container>
            {entity && exists && (
                <Container className="mt-6">
                    <div className="box rounded p-6">
                        <div className="flex flex-col gap-6">
                            {isCreating && <div>Creating entity...</div>}
                            <p className="m-0">You can use the following ID to import this entity into the CSV import tool.</p>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label className="text-sm font-medium text-muted">Entity ID</Label>
                                    <CopyId id={entity.id} size="lg" fullWidth />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label className="text-sm font-medium text-muted">CSV import ID</Label>
                                    <CopyId id={`orkg:${entity.id}`} size="lg" text="CSV import ID" fullWidth />
                                </div>
                            </div>
                            <Separator />
                            <DataBrowser id={entity.id} isEditMode={false} key={entity.id} />
                        </div>
                    </div>
                </Container>
            )}
        </>
    );
};

export default requireAuthentication(AutocompletePage);
