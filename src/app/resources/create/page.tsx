'use client';

import { Cite } from '@citation-js/core';
import { Form, Input, Label, TextField, toast } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { FormEvent, useEffect, useState } from 'react';
import { ActionMeta, MultiValue } from 'react-select';
import useSWR from 'swr';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import ConfirmClass from '@/components/ConfirmationModal/ConfirmationModal';
import useAuthentication from '@/components/hooks/useAuthentication';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import { CONTENT_TYPES_WITH_SPECIAL_SCHEMA } from '@/constants/contentTypes';
import { CLASSES, ENTITIES, PREDICATES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import REGEX from '@/constants/regex';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import requireAuthentication from '@/requireAuthentication';
import { classesUrl, getClassById } from '@/services/backend/classes';
import { createLiteral } from '@/services/backend/literals';
import { createResource } from '@/services/backend/resources';
import { createLiteralStatement } from '@/services/backend/statements';

const CreateResourcePage = () => {
    const isDOI = new RegExp(REGEX.DOI_ID);
    const [label, setLabel] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { isCurationAllowed } = useAuthentication();

    const router = useRouter();

    const [classes, setClasses] = useQueryState<string[]>('classes', {
        defaultValue: [],
        parse: (value) => value.split(','),
    });

    const { data: classesData, isLoading: isLoadingDefaultClasses } = useSWR(
        // only admins can add research field resources
        classes && classes.length > 0 ? [classes.filter((c) => isCurationAllowed || c !== CLASSES.RESEARCH_FIELD), classesUrl, 'getClassById'] : null,
        ([params]) => Promise.all(params.map((p) => getClassById(p))),
    );

    useEffect(() => {
        document.title = 'Create resource - ORKG';
    }, []);

    const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        if (!isCurationAllowed && classes && classes.some((x) => CONTENT_TYPES_WITH_SPECIAL_SCHEMA.includes(x))) {
            toast.danger(
                `The selected option ${classes
                    .filter((x) => CONTENT_TYPES_WITH_SPECIAL_SCHEMA.includes(x))
                    .join(', ')} cannot be set manually; it is reserved for managing content types in the system`,
            );
            setIsSaving(false);
            return;
        }
        if (label.trim() !== '') {
            if (!isDOI.test(label)) {
                try {
                    const newResourceId = await createResource({ label: label.trim(), classes: classesData ? classesData.map((c) => c.id) : [] });
                    toast.success('Resource created successfully');
                    router.push(`${reverse(ROUTES.RESOURCE, { id: newResourceId })}?noRedirect&isEditMode=true`);
                } catch (error: unknown) {
                    console.error(error);
                    setIsSaving(false);
                    toast.danger(`Error creating resource ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            } else {
                const doi = label.trim();
                try {
                    try {
                        const responseJson = await Cite.async(doi);
                        setLabel(responseJson.data[0].title);
                        const newResourceId = await createResource({
                            label: responseJson.data[0].title,
                            classes: classesData ? classesData.map((c) => c.id) : [],
                        });
                        const literalDoiId = await createLiteral(doi);
                        await createLiteralStatement(newResourceId, PREDICATES.HAS_DOI, literalDoiId);
                        toast.success('Resource created successfully');
                        router.push(`${reverse(ROUTES.RESOURCE, { id: newResourceId })}?noRedirect&isEditMode=true`);
                    } catch (error) {
                        console.error(error);
                        toast.danger(`Error finding DOI : ${error instanceof Error ? error.message : 'Unknown error'}`);
                        setIsSaving(false);
                    }
                } catch (error: unknown) {
                    console.error(error);
                    setIsSaving(false);
                    toast.danger(`Error creating resource : ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
        } else {
            toast.danger('Please enter a resource label');
            setIsSaving(false);
        }
    };

    const handleClassSelect = async (selected: MultiValue<OptionType>, { action }: ActionMeta<OptionType>) => {
        if (action === 'create-option') {
            const foundIndex = selected.findIndex((x) => x.__isNew__);
            const newClass = await ConfirmClass({
                label: selected[foundIndex].label,
            });
            if (newClass) {
                const newClasses = [...classes];
                newClasses[foundIndex] = newClass.id;
                setClasses(newClasses);
            } else {
                return null;
            }
        } else {
            if (!isCurationAllowed && selected && selected.some((x) => CONTENT_TYPES_WITH_SPECIAL_SCHEMA.includes(x.id))) {
                toast.danger(
                    `The selected option ${selected
                        .filter((x) => CONTENT_TYPES_WITH_SPECIAL_SCHEMA.includes(x.id))
                        .map((x) => x.label)
                        .join(', ')} cannot be set manually; it is reserved for managing content types in the system`,
                );
                return null;
            }
            setClasses(selected.map((x) => x.id));
        }
        return null;
    };

    return (
        <>
            <TitleBar>Create resource</TitleBar>
            <Container>
                <div className="box rounded pt-6 pb-6 pl-12 pr-12">
                    <Form className="flex flex-col gap-6 pt-2" onSubmit={handleAdd}>
                        <TextField fullWidth isDisabled={isSaving} name="value">
                            <Label htmlFor="ResourceLabel">Resource label or DOI</Label>
                            <Input
                                id="ResourceLabel"
                                type="text"
                                maxLength={MAX_LENGTH_INPUT}
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                            />
                        </TextField>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="select-classes">
                                Classes <span className="text-muted font-normal italic">(optional)</span>
                            </Label>
                            {!isLoadingDefaultClasses && (
                                <Autocomplete
                                    entityType={ENTITIES.CLASS}
                                    onChange={(selected, action) => {
                                        handleClassSelect(selected, action);
                                    }}
                                    placeholder="Select or type to enter a class"
                                    value={classesData}
                                    openMenuOnFocus
                                    allowCreate
                                    isClearable
                                    isMulti
                                    enableExternalSources
                                    inputId="select-classes"
                                />
                            )}
                            {isLoadingDefaultClasses && <div>Loading default classes</div>}
                        </div>

                        <ButtonWithLoading type="submit" variant="primary" className="mt-2 w-fit" isLoading={isSaving}>
                            Create resource
                        </ButtonWithLoading>
                    </Form>
                </div>
            </Container>
        </>
    );
};

export default requireAuthentication(CreateResourcePage);
