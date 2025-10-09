import { faCheck, faClose, faPen, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { match } from 'path-to-regexp';
import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { mutate } from 'swr';

import ActionButton from '@/components/ActionButton/ActionButton';
import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useCanEdit from '@/components/DataBrowser/hooks/useCanEdit';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import useHistory from '@/components/DataBrowser/hooks/useHistory';
import Button from '@/components/Ui/Button/Button';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import { ENTITIES, PREDICATES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { updateResource } from '@/services/backend/resources';
import { statementsUrl } from '@/services/backend/statements';
import { getLinkByEntityType } from '@/utils';

const Label = () => {
    const [isEditing, setIsEditing] = useState(false);
    const { isValidating, entity, mutateEntity } = useEntity();
    const { history } = useHistory();
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

    const handleUpdateLabel = async () => {
        if (entity) {
            await updateResource(entity?.id, { label: value });
            mutateEntity();
            // reload contributions if we are in paper view
            const paperMatch = match(ROUTES.VIEW_PAPER_CONTRIBUTION)(pathname);
            const isPaperView = !!match(ROUTES.VIEW_PAPER)(pathname) || !!paperMatch;
            if (isPaperView && history.length === 0) {
                // @ts-expect-error not typed
                const paperid = paperMatch?.params?.resourceId;
                mutate([{ subjectId: paperid, predicateId: PREDICATES.HAS_CONTRIBUTION }, statementsUrl, 'getStatements'], undefined, {
                    revalidate: true,
                });
            }
            setIsEditing(false);
        }
    };

    return (
        <div className="mb-2 d-flex align-items-center">
            {!isEditing && (
                <>
                    <Link className="h6 text-primary me-1 mb-0" href={getLinkByEntityType(entity?._class ?? ENTITIES.RESOURCE, entity?.id ?? '')}>
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
