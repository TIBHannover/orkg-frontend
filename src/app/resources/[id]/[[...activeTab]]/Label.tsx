import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

import EditableHeader from '@/components/EditableHeader';
import Tooltip from '@/components/FloatingUI/Tooltip';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useDeleteResource from '@/components/Resource/hooks/useDeleteResource';
import Button from '@/components/Ui/Button/Button';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import CONTENT_TYPES from '@/constants/contentTypes';
import { ENTITIES } from '@/constants/graphSettings';
import { Resource } from '@/services/backend/types';

type LabelProps = {
    id: string;
    resource: Resource;
    mutate: () => void;
    isDeletionAllowed: boolean;
    isShared: boolean;
};

const Label = ({ id, resource, isShared, mutate, isDeletionAllowed }: LabelProps) => {
    const { isEditMode } = useIsEditMode();
    const { deleteResource } = useDeleteResource({ resourceId: id, redirect: true });
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: id,
        unlisted: resource?.unlisted ?? false,
        featured: resource?.featured ?? false,
    });

    const preventDeletionTooltipText = isShared
        ? 'This resource is used in statements so it cannot be deleted'
        : "You cannot delete this resource because you are not the creator and you don't have the curator role";

    return (
        <div>
            {!isEditMode ? (
                <h3 className="" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                    {resource?.label || (
                        <i>
                            <small>No label</small>
                        </i>
                    )}
                    {resource?.classes?.some((c) => CONTENT_TYPES.includes(c)) && (
                        <span className="ms-2">
                            <MarkFeatured size="xs" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                            <div className="d-inline-block ms-1">
                                <MarkUnlisted size="xs" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                            </div>
                        </span>
                    )}
                </h3>
            ) : (
                <>
                    <EditableHeader id={id} value={resource?.label ?? ''} onChange={() => mutate()} entityType={ENTITIES.RESOURCE} />

                    <Tooltip content={preventDeletionTooltipText} disabled={isDeletionAllowed ?? false}>
                        <span>
                            <Button
                                color="danger"
                                size="sm"
                                className="mt-2 mb-3"
                                style={{ marginLeft: 'auto' }}
                                onClick={deleteResource}
                                disabled={!isDeletionAllowed}
                            >
                                <FontAwesomeIcon icon={faTrash} /> Delete resource
                            </Button>
                        </span>
                    </Tooltip>
                </>
            )}
        </div>
    );
};

export default Label;
