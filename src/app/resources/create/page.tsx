'use client';

import { Cite } from '@citation-js/core';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { MouseEvent, useEffect, useState } from 'react';
import { ActionMeta, MultiValue } from 'react-select';
import { toast } from 'react-toastify';
import { Container, Form, FormGroup, Input, Label } from 'reactstrap';
import useSWR from 'swr';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import ConfirmClass from '@/components/ConfirmationModal/ConfirmationModal';
import useAuthentication from '@/components/hooks/useAuthentication';
import TitleBar from '@/components/TitleBar/TitleBar';
import { CLASSES, ENTITIES, PREDICATES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import REGEX from '@/constants/regex';
import ROUTES from '@/constants/routes';
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

    const handleAdd = async (e: MouseEvent) => {
        e.preventDefault();
        setIsSaving(true);
        if (label.trim() !== '') {
            if (!isDOI.test(label)) {
                try {
                    const newResourceId = await createResource({ label: label.trim(), classes: classesData ? classesData.map((c) => c.id) : [] });
                    toast.success('Resource created successfully');
                    router.push(`${reverse(ROUTES.RESOURCE, { id: newResourceId })}?noRedirect&isEditMode=true`);
                } catch (error: unknown) {
                    console.error(error);
                    setIsSaving(false);
                    toast.error(`Error creating resource ${error instanceof Error ? error.message : 'Unknown error'}`);
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
                        toast.error(`Error finding DOI : ${error instanceof Error ? error.message : 'Unknown error'}`);
                        setIsSaving(false);
                    }
                } catch (error: unknown) {
                    console.error(error);
                    setIsSaving(false);
                    toast.error(`Error creating resource : ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
        } else {
            toast.error('Please enter a resource label');
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
                classes[foundIndex] = newClass.id;
                setClasses(classes);
            } else {
                return null;
            }
        } else {
            setClasses(selected.map((x) => x.id));
        }
        return null;
    };

    return (
        <>
            <TitleBar>Create resource</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                <Form>
                    <div className="pt-2">
                        <FormGroup>
                            <Label for="ResourceLabel">Resource label or DOI</Label>
                            <Input
                                onChange={(e) => setLabel(e.target.value)}
                                type="text"
                                maxLength={MAX_LENGTH_INPUT}
                                name="value"
                                id="ResourceLabel"
                                disabled={isSaving}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="select-classes">
                                Classes <span className="text-muted fst-italic">(optional)</span>
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
                        </FormGroup>
                        <ButtonWithLoading type="submit" color="primary" onClick={handleAdd} className="mt-3 mb-2" isLoading={isSaving}>
                            Create resource
                        </ButtonWithLoading>
                    </div>
                </Form>
            </Container>
        </>
    );
};

export default requireAuthentication(CreateResourcePage);
