import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import ConfirmClass from 'components/ConfirmationModal/ConfirmationModal';
import TitleBar from 'components/TitleBar/TitleBar';
import { ENTITIES } from 'constants/graphSettings';
import REGEX from 'constants/regex';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Container, FormGroup, FormText, Input, Label } from 'reactstrap';
import requireAuthentication from 'requireAuthentication';
import { createClass, setParentClassByID } from 'services/backend/classes';
import { getErrorMessage } from 'utils';

const AddClass = () => {
    const isURI = new RegExp(REGEX.URL);
    const [uri, setUri] = useState('');
    const [label, setLabel] = useState('');
    const [parentClass, setParentClass] = useState(null);
    const parentClassAutocompleteRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Set document title
        document.title = 'Add Class - ORKG';
    }, []);

    const handleAdd = async () => {
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
                const newClass = await createClass(label, uri || null);
                if (parentClass) {
                    await setParentClassByID(newClass.id, parentClass.id);
                }
                toast.success('Class created successfully');
                setIsLoading(false);
                navigate(reverse(ROUTES.CLASS, { id: newClass.id }));
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
                <p>
                    This form allows you to create a new class. If you want to create a hierarchy of classes, we suggest that you first create the
                    root class, which is the highest-level class in the hierarchy. Alternatively, you can also suggest to include a new ontology to
                    the{' '}
                    <a href="https://service.tib.eu/ts4tib/index" target="_blank" rel="noopener noreferrer">
                        TIB Terminology Service <Icon size="sm" icon={faExternalLinkAlt} />
                    </a>{' '}
                    by creating an issue at the{' '}
                    <a href="https://github.com/TIBHannover/OLS/issues" target="_blank" rel="noopener noreferrer">
                        issue tracker <Icon size="sm" icon={faExternalLinkAlt} />
                    </a>{' '}
                    .
                </p>
                <div className="pt-2">
                    <FormGroup>
                        <Label for="classLabel">Class label</Label>
                        <Input onChange={e => setLabel(e.target.value)} type="text" name="value" id="classLabel" disabled={isLoading} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="URIInput">
                            URI <span className="text-muted fst-italic">(optional)</span>
                        </Label>
                        <Input type="uri" name="uri" id="URIInput" value={uri} onChange={e => setUri(e.target.value)} />
                        <FormText color="muted">
                            Please provide the URI of the class if you are using a class defined in an external ontology
                        </FormText>
                    </FormGroup>
                    <FormGroup>
                        <Label for="URIInput">
                            Subclass of <span className="text-muted fst-italic">(optional)</span>
                        </Label>
                        <AutoComplete
                            entityType={ENTITIES.CLASS}
                            placeholder="Select or type to enter a class"
                            onChange={handleParentClassSelect}
                            value={parentClass}
                            autoLoadOption={true}
                            openMenuOnFocus={true}
                            allowCreate={true}
                            copyValueButton={true}
                            isClearable
                            autoFocus={false}
                            innerRef={parentClassAutocompleteRef}
                            linkButton={parentClass && parentClass.id ? reverse(ROUTES.CLASS, { id: parentClass.id }) : ''}
                            linkButtonTippy="Go to class page"
                            inputId="target-class"
                        />
                        <FormText color="muted">
                            Enter the parent class for this new class. Select an existing class, or create a new one by typing its name.
                        </FormText>
                    </FormGroup>
                    <Button color="primary" onClick={handleAdd} className="mt-3 mb-2" disabled={isLoading}>
                        {!isLoading ? 'Create class' : <span>Loading</span>}
                    </Button>
                </div>
            </Container>
        </>
    );
};

export default requireAuthentication(AddClass);
