import { faCheck, faClose, faPen, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ActionButton from 'components/ActionButton/ActionButton';
import { useDataBrowserState } from 'components/DataBrowser/context/DataBrowserContext';
import useCanEdit from 'components/DataBrowser/hooks/useCanEdit';
import useEntity from 'components/DataBrowser/hooks/useEntity';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Button, Input, InputGroup } from 'reactstrap';
import { updateResource } from 'services/backend/resources';
import { updatePaperContributionLabel } from 'slices/viewPaperSlice';
import { useDispatch } from 'react-redux';
import { usePathname } from 'next/navigation';
import { match } from 'path-to-regexp';

const Label = () => {
    const [isEditing, setIsEditing] = useState(false);
    const { isValidating, entity, mutateEntity } = useEntity();
    const [value, setValue] = useState(entity?.label ?? '');
    const { config } = useDataBrowserState();
    const { isEditMode } = config;
    const pathname = usePathname();
    const { canEdit } = useCanEdit();

    useEffect(() => {
        setValue(entity?.label ?? '');
    }, [entity?.label]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const dispatch = useDispatch();

    const handleUpdateLabel = async () => {
        if (entity) {
            await updateResource(entity?.id, value);
            mutateEntity();
            // update the label in the redux store (if we are in paper view)
            const isPaperView = !!match(ROUTES.VIEW_PAPER)(pathname) || !!match(ROUTES.VIEW_PAPER_CONTRIBUTION)(pathname);
            if (isPaperView) {
                dispatch(updatePaperContributionLabel({ label: value, id: entity.id }));
            }
            setIsEditing(false);
        }
    };

    return (
        <div className="mb-2 d-flex align-items-center">
            {!isEditing && (
                <>
                    <Link className="h6 text-primary me-1 mb-0" href={`${reverse(ROUTES.RESOURCE, { id: entity?.id })}?noRedirect`}>
                        {entity?.label || (!entity ? <Skeleton width={100} /> : <i>No label</i>)}
                    </Link>
                    {canEdit && isEditMode && <ActionButton title="Edit" icon={faPen} action={handleEditClick} />}
                    {isValidating && <FontAwesomeIcon spin className="ms-2 text-primary" icon={faSpinner} />}
                </>
            )}
            {isEditing && (
                <InputGroup size="sm">
                    <Input type="text" value={value} onChange={(e) => setValue(e.target.value)} />
                    <Button type="submit" color="secondary" onClick={() => setIsEditing(false)}>
                        <FontAwesomeIcon icon={faClose} />
                    </Button>
                    <Button type="submit" color="primary" onClick={handleUpdateLabel}>
                        <FontAwesomeIcon icon={faCheck} />
                    </Button>
                </InputGroup>
            )}
        </div>
    );
};

export default Label;
