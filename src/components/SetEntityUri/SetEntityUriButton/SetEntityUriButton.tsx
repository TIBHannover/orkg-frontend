'use client';

import { faLink } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

import ActionButton from '@/components/ActionButton/ActionButton';
import useAuthentication from '@/components/hooks/useAuthentication';
import SetEntityUriModal from '@/components/SetEntityUri/SetEntityUriModal/SetEntityUriModal';
import { ENTITIES } from '@/constants/graphSettings';

type SetEntityUriButtonProps = {
    entityId: string;
    entityType: (typeof ENTITIES)[keyof typeof ENTITIES];
    /** The backend also returns the string 'null' when the URI is unset */
    uri?: string | null;
    isEditMode: boolean;
    /** Called after the URI was set successfully, e.g. to refresh the page data */
    onUpdated?: () => void;
};

/**
 * Opens the {@link SetEntityUriModal} for an entity that has no URI yet. Rendered only
 * in edit mode and only for curators; hidden entirely once a URI is set, since the
 * backend does not allow changing or removing it.
 */
const SetEntityUriButton = ({ entityId, entityType, uri, isEditMode, onUpdated }: SetEntityUriButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { isCurationAllowed } = useAuthentication();

    const hasUri = Boolean(uri) && uri !== 'null';

    if (!isEditMode || !isCurationAllowed || hasUri) {
        return null;
    }

    return (
        <>
            <ActionButton title="Set URI" icon={faLink} action={() => setIsOpen(true)} />
            {isOpen && <SetEntityUriModal entityId={entityId} entityType={entityType} toggle={() => setIsOpen(false)} onUpdated={onUpdated} />}
        </>
    );
};

export default SetEntityUriButton;
