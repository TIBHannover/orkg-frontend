'use client';

import { Cite } from '@citation-js/core';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import ConfirmClass from 'components/ConfirmationModal/ConfirmationModal';
import useAuthentication from 'components/hooks/useAuthentication';
import TitleBar from 'components/TitleBar/TitleBar';
import { CLASSES, ENTITIES, PREDICATES } from 'constants/graphSettings';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import REGEX from 'constants/regex';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Container, Form, FormGroup, Input, Label } from 'reactstrap';
import requireAuthentication from 'requireAuthentication';
import { getClassById } from 'services/backend/classes';
import { createLiteral } from 'services/backend/literals';
import { createResource } from 'services/backend/resources';
import { createLiteralStatement } from 'services/backend/statements';

const AddResource = () => {
    const isDOI = new RegExp(REGEX.DOI_ID);
    const classesAutocompleteRef = useRef(null);
    const [label, setLabel] = useState('');
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { isCurationAllowed } = useAuthentication();
    const [isLoadingDefaultClasses, setIsLoadingDefaultClasses] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Set document title
        document.title = 'Add resource - ORKG';
        const getDefaultClass = async () => {
            let _classes = searchParams.get('classes')?.split(',');
            if (!isCurationAllowed && _classes && _classes.length > 0) {
                _classes = _classes.filter((c) => c !== CLASSES.RESEARCH_FIELD); // only admins can add research field resources
            }
            if (_classes && _classes.length > 0) {
                setIsLoadingDefaultClasses(true);
                const fetchDefaultClasses = _classes.map((c) => getClassById(c));
                Promise.all(fetchDefaultClasses)
                    .then((classesData) => {
                        setIsLoadingDefaultClasses(false);
                        setClasses(classesData);
                    })
                    .catch(() => {
                        setIsLoadingDefaultClasses(false);
                    });
            }
        };
        getDefaultClass();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (label.trim() !== '') {
            if (!isDOI.test(label)) {
                try {
                    const newResource = await createResource(label.trim(), classes ? classes.map((c) => c.id) : []);
                    toast.success('Resource created successfully');
                    setIsLoading(false);
                    router.push(`${reverse(ROUTES.RESOURCE, { id: newResource.id })}?noRedirect&isEditMode=true`);
                } catch (error) {
                    console.error(error);
                    setIsLoading(false);
                    toast.error(`Error creating resource ${error.message}`);
                }
            } else {
                const doi = label.trim();
                try {
                    try {
                        const responseJson = await Cite.async(doi);
                        setLabel(responseJson.data[0].title);
                        const newResource = await createResource(responseJson.data[0].title, classes ? classes.map((c) => c.id) : []);
                        const responseJsonDoi = await createLiteral(doi);
                        await createLiteralStatement(newResource.id, PREDICATES.HAS_DOI, responseJsonDoi.id);
                        toast.success('Resource created successfully');
                        setIsLoading(false);
                        router.push(`${reverse(ROUTES.RESOURCE, { id: newResource.id })}?noRedirect&isEditMode=true`);
                    } catch (error) {
                        console.error(error);
                        toast.error(`Error finding DOI : ${error.message}`);
                        setIsLoading(false);
                    }
                } catch (error) {
                    console.error(error);
                    setIsLoading(false);
                    toast.error(`Error creating resource : ${error.message}`);
                }
            }
        } else {
            toast.error('Please enter a resource label');
            setIsLoading(false);
        }
    };

    const handleClassSelect = async (selected, { action }) => {
        if (action === 'create-option') {
            const foundIndex = selected.findIndex((x) => x.__isNew__);
            const newClass = await ConfirmClass({
                label: selected[foundIndex].label,
            });
            if (newClass) {
                const foundIndex = selected.findIndex((x) => x.__isNew__);
                selected[foundIndex] = newClass;
                setClasses(selected);
            } else {
                return null;
            }
        } else {
            setClasses(selected);
        }
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
                                disabled={isLoading}
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
                                        // blur the field allows to focus and open the menu again
                                        classesAutocompleteRef.current && classesAutocompleteRef.current.blur();
                                        handleClassSelect(selected, action);
                                    }}
                                    placeholder="Select or type to enter a class"
                                    value={classes}
                                    openMenuOnFocus
                                    allowCreate
                                    isClearable
                                    innerRef={classesAutocompleteRef}
                                    isMulti
                                    enableExternalSources
                                    inputId="select-classes"
                                />
                            )}
                            {isLoadingDefaultClasses && <div>Loading default classes</div>}
                        </FormGroup>
                        <ButtonWithLoading type="submit" color="primary" onClick={handleAdd} className="mt-3 mb-2" isLoading={isLoading}>
                            Create Resource
                        </ButtonWithLoading>
                    </div>
                </Form>
            </Container>
        </>
    );
};

export default requireAuthentication(AddResource);
