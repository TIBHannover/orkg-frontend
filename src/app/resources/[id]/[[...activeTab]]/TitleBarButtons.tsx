import { faEllipsisV, faExternalLinkAlt, faPen, faPlus, faTimes, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown } from '@heroui/react';
import { buttonVariants } from '@heroui/styles';
import Link from 'next/link';
import React from 'react';

import { additionalContentTypes } from '@/components/ContentType/types';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import { PreventEditCase } from '@/components/Resource/hooks/preventEditing';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Resource } from '@/services/backend/types';
import { getDedicatedLink, reverseWithSlug } from '@/utilsTyped';

type TitleBarButtonsProps = {
    resource: Resource;
    contentType: string;
    isCurationAllowed: boolean;
    preventEditCase?: PreventEditCase;
    setIsOpenPublishModal: (isOpen: boolean) => void;
    setIsOpenPreventModal: (isOpen: boolean) => void;
    setIsOpenGraphViewModal: (isOpen: boolean) => void;
};
const TitleBarButtons = ({
    resource,
    contentType,
    isCurationAllowed,
    preventEditCase,
    setIsOpenPublishModal,
    setIsOpenPreventModal,
    setIsOpenGraphViewModal,
}: TitleBarButtonsProps) => {
    const { isEditMode, toggleIsEditMode } = useIsEditMode();
    const dedicatedLink = getDedicatedLink(resource?.classes);
    return (
        <>
            {isEditMode ? (
                <RequireAuthentication size="sm" component={Button} className="button--orkg-secondary" onPress={() => setIsOpenPublishModal(true)}>
                    <FontAwesomeIcon icon={faUpload} className="mr-1" /> Publish
                </RequireAuthentication>
            ) : (
                <RequireAuthentication
                    size="sm"
                    component={Button}
                    className="button--orkg-secondary"
                    href={
                        additionalContentTypes.find((c) => c.id === contentType)
                            ? `${reverse(ROUTES.CONTENT_TYPE_NEW)}?type=${contentType}`
                            : ROUTES.CREATE_RESOURCE
                    }
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-1" /> Create new{' '}
                    {additionalContentTypes.find((c) => c.id === contentType)?.label || 'resource'}
                </RequireAuthentication>
            )}
            {dedicatedLink && contentType === 'Resource' && (
                <Link
                    data-slot="button"
                    className={`${buttonVariants({ size: 'sm' })} button--orkg-secondary`}
                    href={reverseWithSlug(dedicatedLink.route, {
                        ...(dedicatedLink.getParams
                            ? dedicatedLink.getParams(resource)
                            : { [dedicatedLink.routeParams!]: resource.id, slug: dedicatedLink.hasSlug ? resource.label : undefined }),
                    })}
                >
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-1" /> {dedicatedLink.label} view
                </Link>
            )}
            {!isEditMode && (
                <RequireAuthentication
                    component={Button}
                    className="button--orkg-secondary"
                    size="sm"
                    onPress={() => (!isCurationAllowed && preventEditCase ? setIsOpenPreventModal(true) : toggleIsEditMode())}
                >
                    <FontAwesomeIcon icon={faPen} /> Edit
                </RequireAuthentication>
            )}
            {isEditMode && (
                <Button className="shrink-0 button--orkg-secondary-darker" size="sm" onPress={() => toggleIsEditMode()}>
                    <FontAwesomeIcon icon={faTimes} /> Stop editing
                </Button>
            )}
            <Dropdown>
                <Button size="sm" className="button--orkg-secondary px-4 rounded-r" isIconOnly aria-label="More options">
                    <FontAwesomeIcon icon={faEllipsisV} />
                </Button>
                <Dropdown.Popover placement="bottom end">
                    <Dropdown.Menu
                        aria-label="Options"
                        onAction={(key) => {
                            if (key === 'view-graph') setIsOpenGraphViewModal(true);
                        }}
                    >
                        <Dropdown.Item id="view-graph" textValue="View graph">
                            View graph
                        </Dropdown.Item>
                        {additionalContentTypes.find((c) => c.id === contentType) && (
                            <Dropdown.Item href={`${reverse(ROUTES.RESOURCE, { id: resource.id })}?noRedirect`} textValue="View resource">
                                View resource
                            </Dropdown.Item>
                        )}
                    </Dropdown.Menu>
                </Dropdown.Popover>
            </Dropdown>
        </>
    );
};

export default TitleBarButtons;
