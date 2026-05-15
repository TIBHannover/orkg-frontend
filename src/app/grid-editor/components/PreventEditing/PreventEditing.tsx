import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button } from '@heroui/react';

import getPreventEditCase from '@/app/grid-editor/components/PreventEditing/PreventConditions';
import useEntities from '@/app/grid-editor/hooks/useEntities';
import Container from '@/components/Ui/Structure/Container';

const PreventEditing = () => {
    const { entities, entityIds, setEntityIds } = useEntities();
    const nonEditableEntities = entities && entities.length > 0 ? entities.filter((entity) => getPreventEditCase(entity) !== null) : [];

    const handleRemoveNonEditableEntities = () => {
        const editableEntityIds =
            entityIds?.filter((id) => {
                const entity = entities?.find((e) => e.id === id);
                return !entity || getPreventEditCase(entity) === null;
            }) || [];
        setEntityIds(editableEntityIds);
    };

    return (
        <Container>
            <Alert status="warning" className="my-2">
                <Alert.Indicator />
                <Alert.Content>
                    <Alert.Title>Some selected resources are not editable</Alert.Title>
                    <Alert.Description>
                        <ul className="mb-2 mt-2 list-inside list-disc">
                            {nonEditableEntities.map((entity, index) => (
                                <li key={index}>
                                    {entity.label} ({entity.id}) - {getPreventEditCase(entity)?.message(entity)}
                                </li>
                            ))}
                        </ul>
                        <p className="mb-0">Please remove these resources to continue with the grid editor.</p>
                    </Alert.Description>
                    <Button className="mt-3 sm:hidden" variant="danger" size="sm" onPress={handleRemoveNonEditableEntities}>
                        <FontAwesomeIcon icon={faXmark} /> Remove non-editable resources
                    </Button>
                </Alert.Content>
                <Button className="hidden sm:inline-flex" variant="danger" size="sm" onPress={handleRemoveNonEditableEntities}>
                    <FontAwesomeIcon icon={faXmark} /> Remove non-editable resources
                </Button>
            </Alert>
        </Container>
    );
};

export default PreventEditing;
