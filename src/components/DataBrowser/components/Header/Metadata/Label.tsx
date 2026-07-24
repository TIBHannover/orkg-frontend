import { faCheck, faClose, faPen, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input, Skeleton, TextField } from '@heroui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { match } from 'path-to-regexp';
import { useRef, useState } from 'react';
import { mutate } from 'swr';

import ActionButton from '@/components/ActionButton/ActionButton';
import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useCanEdit from '@/components/DataBrowser/hooks/useCanEdit';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import useHistory from '@/components/DataBrowser/hooks/useHistory';
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
    const prevLabelRef = useRef(entity?.label);
    if (prevLabelRef.current !== entity?.label) {
        prevLabelRef.current = entity?.label;
        setValue(entity?.label ?? '');
    }
    const { config } = useDataBrowserState();
    const { isEditMode } = config;
    const pathname = usePathname();
    const { canEdit } = useCanEdit();

    const handleUpdateLabel = async () => {
        if (entity) {
            await updateResource(entity.id, { label: value });
            mutateEntity();
            const paperMatch = match(ROUTES.VIEW_PAPER_CONTRIBUTION)(pathname);
            const isPaperView = !!match(ROUTES.VIEW_PAPER)(pathname) || !!paperMatch;
            if (isPaperView && history.length <= 1) {
                // @ts-expect-error not typed
                const paperid = paperMatch?.params?.resourceId;
                mutate([{ subjectId: paperid, predicateId: PREDICATES.HAS_CONTRIBUTION }, statementsUrl, 'getStatements'], undefined, {
                    revalidate: true,
                });
            }
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <div className="mb-2 flex items-stretch min-h-9">
                <TextField
                    fullWidth
                    value={value}
                    onChange={setValue}
                    aria-label="Edit label"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') void handleUpdateLabel();
                        if (e.key === 'Escape') setIsEditing(false);
                    }}
                    className="flex-1 min-w-0"
                >
                    <Input autoFocus className="h-9 !rounded-e-none" />
                </TextField>
                <Button
                    variant="secondary"
                    size="sm"
                    isIconOnly
                    aria-label="Cancel"
                    className="!h-9 !rounded-none -ms-px"
                    onPress={() => setIsEditing(false)}
                >
                    <FontAwesomeIcon icon={faClose} />
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    isIconOnly
                    aria-label="Save"
                    className="!h-9 !rounded-s-none !rounded-e-[var(--radius)] -ms-px"
                    onPress={handleUpdateLabel}
                >
                    <FontAwesomeIcon icon={faCheck} />
                </Button>
            </div>
        );
    }

    return (
        <div className="mb-2 flex items-center min-h-9">
            <Link className="text-lg text-accent mr-1 mb-0" href={getLinkByEntityType(entity?._class ?? ENTITIES.RESOURCE, entity?.id ?? '')}>
                {entity?.label || (!entity ? <Skeleton className="w-[100px] h-4 rounded" /> : <i>No label</i>)}
            </Link>
            {canEdit && isEditMode && <ActionButton title="Edit" icon={faPen} action={() => setIsEditing(true)} />}
            {isValidating && <FontAwesomeIcon spin className="ml-2 text-accent" icon={faSpinner} />}
        </div>
    );
};

export default Label;
