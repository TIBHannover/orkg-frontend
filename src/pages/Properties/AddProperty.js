import { useState, useEffect } from 'react';
import { Container, Button, FormGroup, Input, Label } from 'reactstrap';
import { createPredicate } from 'services/backend/predicates';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import TitleBar from 'components/TitleBar/TitleBar';

const AddProperty = () => {
    const [label, setLabel] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory();

    useEffect(() => {
        // Set document title
        document.title = 'Add property - ORKG';
    }, []);

    const handleAdd = async () => {
        setIsLoading(true);
        if (label.trim() !== '') {
            try {
                const newProperty = await createPredicate(label);
                toast.success('Property created successfully');
                setIsLoading(false);
                history.push(reverse(ROUTES.PROPERTY, { id: newProperty.id }));
            } catch (error) {
                console.error(error);
                toast.error(`Error creating property ${error.message}`);
                setIsLoading(false);
            }
        } else {
            toast.error('Please enter a property label');
            setIsLoading(false);
        }
    };

    return (
        <>
            <TitleBar>Create property</TitleBar>
            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                <div className="pt-2">
                    <FormGroup>
                        <Label for="propertyLabel">Property Label</Label>
                        <Input
                            onChange={e => setLabel(e.target.value)}
                            onKeyDown={e => (e.keyCode === 13 ? handleAdd : undefined)}
                            type="text"
                            name="value"
                            id="propertyLabel"
                            disabled={isLoading}
                            placeholder="Property label"
                        />
                    </FormGroup>
                    <Button color="primary" onClick={handleAdd} className="mt-3 mb-2" disabled={isLoading}>
                        {!isLoading ? 'Create Property' : <span>Loading</span>}
                    </Button>
                </div>
            </Container>
        </>
    );
};

export default AddProperty;
