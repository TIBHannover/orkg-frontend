'use client';

import { reverse } from 'named-urls';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SingleValue } from 'react-select';
import { toast } from 'react-toastify';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import CopyId from '@/components/CopyId/CopyId';
import DataBrowser from '@/components/DataBrowser/DataBrowser';
import TitleBar from '@/components/TitleBar/TitleBar';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import Container from '@/components/Ui/Structure/Container';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import requireAuthentication from '@/requireAuthentication';
import { createClass } from '@/services/backend/classes';
import { createPredicate } from '@/services/backend/predicates';
import { createResource } from '@/services/backend/resources';
import { getThing } from '@/services/backend/things';
import { EntityType } from '@/services/backend/types';

const AutocompletePage = () => {
    const [entity, setEntity] = useState<SingleValue<OptionType>>(null);
    const [entityType, setEntityType] = useState<EntityType>(ENTITIES.RESOURCE);
    const [inputValue, setInputValue] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        document.title = `Entity lookup tool - ${entityType}`;
    }, [entityType]);

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
                toast.error('Error creating entity');
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
            <Container className="box rounded p-4">
                <div className="mb-4">
                    This page helps you look up and import entities for use with the{' '}
                    <Link href={reverse(ROUTES.CSV_IMPORT)} target="_blank">
                        ORKG CSV import tool
                    </Link>
                    . You can:{' '}
                    <ul className="list-disc list-inside">
                        <li>Search for entities in ORKG and copy their IDs to include in your CSV file.</li>
                        <li>Create new entities if the resource you need does not yet exist.</li>
                        <li>
                            You can search for existing entities by ID by using <code>#</code> as a prefix (e.g., <code>#R12</code>)
                        </li>
                    </ul>
                    If you don't find a result for your desired resource, simply click the 'Create' button to generate a new entity and obtain its ID.
                </div>
                <InputGroup className="d-flex justify-content-center">
                    <Input
                        className="tw:!bg-secondary tw:!text-white tw:!w-auto tw:!flex-grow-0"
                        name="entityType"
                        type="select"
                        value={entityType}
                        onChange={(e) => setEntityType(e.target.value as EntityType)}
                    >
                        <option value={ENTITIES.RESOURCE}>Resource</option>
                        <option value={ENTITIES.CLASS}>Class</option>
                        <option value={ENTITIES.PREDICATE}>Predicate</option>
                    </Input>
                    <Autocomplete
                        key={entityType}
                        entityType={entityType}
                        placeholder={`Select or type to enter a ${entityType}`}
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
                        className="tw:flex-grow-1"
                        noOptionsMessage={() => 'No results found, use the create button to create a new entity'}
                    />
                    <ButtonWithLoading
                        disabled={!entity?.__isNew__}
                        onClick={() => handleCreate()}
                        isLoading={isCreating}
                        loadingMessage="Creating entity..."
                    >
                        Create
                    </ButtonWithLoading>
                </InputGroup>
            </Container>
            {entity && exists && (
                <Container className="box rounded p-4 mt-4">
                    {isCreating && <div className="mt-2">Creating entity...</div>}
                    <div>
                        <p>You can use the following ID to import this entity into the CSV import tool.</p>

                        <div className="mt-2">
                            <div className="d-flex align-items-center mb-4">
                                <CopyId id={entity.id} size="lg" />
                            </div>
                            <div className="d-flex align-items-center mb-4">
                                <CopyId id={`orkg:${entity.id}`} size="lg" text="CSV import ID" />
                            </div>
                            <DataBrowser id={entity.id} isEditMode={false} key={entity.id} />
                        </div>
                    </div>
                </Container>
            )}
        </>
    );
};

export default requireAuthentication(AutocompletePage);
