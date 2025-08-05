'use client';

import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import CopyIdButton from '@/components/Autocomplete/ValueButtons/CopyIdButton';
import LinkButton from '@/components/Autocomplete/ValueButtons/LinkButton';
import TreeSelector from '@/components/Autocomplete/ValueButtons/TreeSelector';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import ConfirmClass from '@/components/ConfirmationModal/ConfirmationModal';
import useAuthentication from '@/components/hooks/useAuthentication';
import TitleBar from '@/components/TitleBar/TitleBar';
import Form from '@/components/Ui/Form/Form';
import FormGroup from '@/components/Ui/Form/FormGroup';
import FormText from '@/components/Ui/Form/FormText';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import Label from '@/components/Ui/Label/Label';
import Container from '@/components/Ui/Structure/Container';
import { ENTITIES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import REGEX from '@/constants/regex';
import ROUTES from '@/constants/routes';
import requireAuthentication from '@/requireAuthentication';
import { createClass, setParentClassByID } from '@/services/backend/classes';
import { getErrorMessage } from '@/utils';

const CreateClassPage = () => {
    const isURI = new RegExp(REGEX.URL);
    const [uri, setUri] = useState('');
    const [label, setLabel] = useState('');
    const [parentClass, setParentClass] = useState(null);
    const parentClassAutocompleteRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const { isCurationAllowed } = useAuthentication();

    useEffect(() => {
        // Set document title
        document.title = 'Add Class - ORKG';
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (label.trim() !== '') {
            if (uri && !isURI.test(uri.trim())) {
                toast.error('Please enter a valid URI of the class');
                setIsLoading(false);
                return;
            }
            if (parentClass && !parentClass.id) {
                toast.error('Please enter a valid parent class');
                setIsLoading(false);
                return;
            }
            try {
                const newClassId = await createClass(label, uri || null);
                if (parentClass) {
                    await setParentClassByID(newClassId, parentClass.id);
                }
                toast.success('Class created successfully');
                setIsLoading(false);
                router.push(`${reverse(ROUTES.CLASS, { id: newClassId })}?isEditMode=true`);
            } catch (error) {
                console.error(error);
                setIsLoading(false);
                toast.error(`${getErrorMessage(error, 'uri')}`);
            }
        } else {
            setIsLoading(false);
            toast.error('Please enter the label of the class');
        }
    };

    const handleParentClassSelect = async (selected, { action }) => {
        if (action === 'select-option') {
            setParentClass(selected);
        } else if (action === 'create-option') {
            const newClass = await ConfirmClass({
                label: selected.label,
            });
            if (newClass) {
                selected.id = newClass.id;
                setParentClass(selected);
            }
            // blur the field allows to focus and open the menu again
            parentClassAutocompleteRef.current && parentClassAutocompleteRef.current.blur();
        } else if (action === 'clear') {
            setParentClass(null);
        }
    };

    return (
        <>
            <TitleBar>Create class</TitleBar>
            <Container className="box rounded p-5">
                <Form className="ps-3 pe-3 pt-2" onSubmit={handleAdd}>
                    <p>
                        This form allows you to create a new class. If you want to create a hierarchy of classes, we suggest that you first create the
                        root class, which is the highest-level class in the hierarchy. Alternatively, you can also suggest to include a new ontology
                        to the{' '}
                        <a href="https://terminology.tib.eu/ts/" target="_blank" rel="noopener noreferrer">
                            TIB Terminology Service <FontAwesomeIcon size="sm" icon={faExternalLinkAlt} />
                        </a>{' '}
                        by creating an issue at the{' '}
                        <a href="https://github.com/TIBHannover/OLS/issues" target="_blank" rel="noopener noreferrer">
                            issue tracker <FontAwesomeIcon size="sm" icon={faExternalLinkAlt} />
                        </a>{' '}
                        .
                    </p>
                    <div className="pt-2">
                        <FormGroup>
                            <Label for="classLabel">Class label</Label>
                            <Input
                                onChange={(e) => setLabel(e.target.value)}
                                type="text"
                                name="value"
                                maxLength={MAX_LENGTH_INPUT}
                                id="classLabel"
                                disabled={isLoading}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="URIInput">
                                URI <span className="text-muted fst-italic">(optional)</span>
                            </Label>
                            <Input type="uri" name="uri" id="URIInput" value={uri} onChange={(e) => setUri(e.target.value)} />
                            <FormText color="muted">
                                Please provide the URI of the class if you are using a class defined in an external ontology
                            </FormText>
                        </FormGroup>
                        <FormGroup>
                            <Label for="URIInput">
                                Subclass of <span className="text-muted fst-italic">(optional)</span>
                            </Label>
                            <InputGroup>
                                <Autocomplete
                                    entityType={ENTITIES.CLASS}
                                    placeholder={isCurationAllowed ? 'Select or type to enter a class' : 'This field requires a curator role'}
                                    onChange={handleParentClassSelect}
                                    value={parentClass}
                                    openMenuOnFocus
                                    allowCreate
                                    isClearable
                                    innerRef={parentClassAutocompleteRef}
                                    inputId="target-class"
                                    isDisabled={!isCurationAllowed}
                                    enableExternalSources
                                />
                                <TreeSelector onChange={handleParentClassSelect} value={parentClass} isDisabled={!isCurationAllowed} />
                                <CopyIdButton value={parentClass} />
                                <LinkButton value={parentClass} />
                            </InputGroup>
                            {isCurationAllowed && (
                                <FormText color="muted">
                                    Enter the parent class for this new class. Select an existing class, or create a new one by typing its name.
                                </FormText>
                            )}
                        </FormGroup>
                        <ButtonWithLoading type="submit" color="primary" onClick={handleAdd} className="mt-3 mb-2" isLoading={isLoading}>
                            Create class
                        </ButtonWithLoading>
                    </div>
                </Form>
            </Container>
        </>
    );
};

export default requireAuthentication(CreateClassPage);
