import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import TitleBar from 'components/TitleBar/TitleBar';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Container, FormGroup, Input, Label } from 'reactstrap';
import requireAuthentication from 'requireAuthentication';
import { createPredicate } from 'services/backend/predicates';

const AddProperty = () => {
    const [label, setLabel] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

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
                navigate(`${reverse(ROUTES.PROPERTY, { id: newProperty.id })}?isEditMode=true`);
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
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                <div className="pt-2">
                    <FormGroup>
                        <Label for="propertyLabel">Property label</Label>
                        <Input
                            onChange={e => setLabel(e.target.value)}
                            onKeyDown={e => (e.keyCode === 13 ? handleAdd : undefined)}
                            type="text"
                            name="value"
                            id="propertyLabel"
                            disabled={isLoading}
                        />
                    </FormGroup>
                    <ButtonWithLoading color="primary" onClick={handleAdd} className="mt-3 mb-2" isLoading={isLoading}>
                        Create property
                    </ButtonWithLoading>
                </div>
            </Container>
        </>
    );
};

export default requireAuthentication(AddProperty);
