import { useState, useEffect } from 'react';
import { Container, Button, FormGroup, Input, Label, FormText } from 'reactstrap';
import { createClass } from 'services/backend/classes';
import { useHistory } from 'react-router-dom';
import REGEX from 'constants/regex';
import { toast } from 'react-toastify';
import { reverse } from 'named-urls';
import { get_error_message } from 'utils';
import ROUTES from 'constants/routes';
import TitleBar from 'components/TitleBar/TitleBar';

const AddClass = () => {
    const isURI = new RegExp(REGEX.URL);
    const [uri, setUri] = useState('');
    const [label, setLabel] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory();

    useEffect(() => {
        // Set document title
        document.title = 'Add Class - ORKG';
    }, []);

    const handleAdd = async () => {
        setIsLoading(true);
        if (label.trim() !== '') {
            if (uri && !isURI.test(uri.trim())) {
                toast.error('Please enter a valid URI of the class');
            } else {
                try {
                    const newClass = await createClass(label, uri ? uri : null);
                    toast.success('Class created successfully');
                    setIsLoading(false);
                    history.push(reverse(ROUTES.CLASS, { id: newClass.id }));
                } catch (error) {
                    console.error(error);
                    setIsLoading(false);
                    toast.error(`${get_error_message(error, 'uri')}`);
                }
            }
        } else {
            setIsLoading(false);
            toast.error('Please enter the label of the class');
        }
    };

    return (
        <>
            <TitleBar>Create class</TitleBar>
            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                <div className="pt-2">
                    <FormGroup>
                        <Label for="classLabel">Class label</Label>
                        <Input
                            onChange={e => setLabel(e.target.value)}
                            type="text"
                            name="value"
                            id="classLabel"
                            disabled={isLoading}
                            placeholder="Class label"
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="URIInput">URI</Label>
                        <Input
                            type="uri"
                            name="uri"
                            id="URIInput"
                            value={uri}
                            placeholder="Enter the URI of the class"
                            onChange={e => setUri(e.target.value)}
                        />
                        <FormText color="muted">
                            Please provide the URI of the class if you are using a class defined in an external ontology
                        </FormText>
                    </FormGroup>
                    <Button color="primary" onClick={handleAdd} className="mt-3 mb-2" disabled={isLoading}>
                        {!isLoading ? 'Create Class' : <span>Loading</span>}
                    </Button>
                </div>
            </Container>
        </>
    );
};

export default AddClass;
