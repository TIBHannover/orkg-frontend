import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import getPreventEditCase from '@/app/grid-editor/components/PreventEditing/PreventConditions';
import useEntities from '@/app/grid-editor/hooks/useEntities';
import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
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
            <Alert color="warning" className="tw:my-2 tw:px-4">
                <div>
                    <strong>Some selected resources are not editable</strong>
                    <ul className="tw:mb-2 tw:mt-2">
                        {nonEditableEntities.map((entity, index) => (
                            <li key={index}>
                                {entity.label} ({entity.id}) - {getPreventEditCase(entity)?.message(entity)}
                            </li>
                        ))}
                    </ul>
                    <p className="tw:mb-3">Please remove these resources to continue with the grid editor.</p>
                </div>
                <div className="tw:flex tw:justify-center">
                    <Button color="danger" size="sm" onClick={handleRemoveNonEditableEntities}>
                        <FontAwesomeIcon icon={faXmark} className="tw:mr-1" /> Remove non-editable resources
                    </Button>
                </div>
            </Alert>
        </Container>
    );
};

export default PreventEditing;
