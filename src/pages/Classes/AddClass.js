import { useState, useEffect } from 'react';
import { Container, Button, FormGroup, Input, Label, FormText } from 'reactstrap';
import { createClass } from 'services/backend/classes';
import { useNavigate } from 'react-router-dom';
import REGEX from 'constants/regex';
import { toast } from 'react-toastify';
import { reverse } from 'named-urls';
import { getErrorMessage } from 'utils';
import ROUTES from 'constants/routes';
import TitleBar from 'components/TitleBar/TitleBar';
import requireAuthentication from 'requireAuthentication';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';

const AddClass = () => {
    const isURI = new RegExp(REGEX.URL);
    const [uri, setUri] = useState('');
    const [label, setLabel] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Set document title
        document.title = 'Add Class - ORKG';
    }, []);

    const handleAdd = async () => {
        if (label.trim() !== '') {
            if (uri && !isURI.test(uri.trim())) {
                toast.error('Please enter a valid URI of the class');
            } else {
                try {
                    setIsLoading(true);
                    const newClass = await createClass(label, uri || null);
                    toast.success('Class created successfully');
                    setIsLoading(false);
                    navigate(reverse(ROUTES.CLASS, { id: newClass.id }));
                } catch (error) {
                    console.error(error);
                    setIsLoading(false);
                    toast.error(`${getErrorMessage(error, 'uri')}`);
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
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
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
                    <ButtonWithLoading color="primary" onClick={handleAdd} className="mt-3 mb-2" isLoading={isLoading}>
                        Create class
                    </ButtonWithLoading>
                </div>
            </Container>
        </>
    );
};

export default requireAuthentication(AddClass);
