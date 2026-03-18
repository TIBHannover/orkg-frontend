import { faEllipsisV, faExternalLinkAlt, faPen, faPlus, faTimes, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import React from 'react';

import { additionalContentTypes } from '@/components/ContentType/types';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import { PreventEditCase } from '@/components/Resource/hooks/preventEditing';
import Button from '@/components/Ui/Button/Button';
import UncontrolledButtonDropdown from '@/components/Ui/Button/UncontrolledButtonDropdown';
import DropdownItem from '@/components/Ui/Dropdown/DropdownItem';
import DropdownMenu from '@/components/Ui/Dropdown/DropdownMenu';
import DropdownToggle from '@/components/Ui/Dropdown/DropdownToggle';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import ROUTES from '@/constants/routes';
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
                <RequireAuthentication
                    size="sm"
                    component={Button}
                    color="secondary"
                    style={{ marginRight: 2 }}
                    onClick={() => setIsOpenPublishModal(true)}
                >
                    <FontAwesomeIcon icon={faUpload} className="me-1" /> Publish
                </RequireAuthentication>
            ) : (
                <RequireAuthentication
                    size="sm"
                    component={Button}
                    color="secondary"
                    style={{ marginRight: 2 }}
                    tag={Link}
                    href={
                        additionalContentTypes.find((c) => c.id === contentType)
                            ? `${reverse(ROUTES.CONTENT_TYPE_NEW)}?type=${contentType}`
                            : ROUTES.CREATE_RESOURCE
                    }
                >
                    <FontAwesomeIcon icon={faPlus} className="me-1" /> Create new{' '}
                    {additionalContentTypes.find((c) => c.id === contentType)?.label || 'resource'}
                </RequireAuthentication>
            )}
            {dedicatedLink && contentType === 'Resource' && (
                <Button
                    color="secondary"
                    size="sm"
                    tag={Link}
                    href={reverseWithSlug(dedicatedLink.route, {
                        ...(dedicatedLink.getParams
                            ? dedicatedLink.getParams(resource)
                            : { [dedicatedLink.routeParams!]: resource.id, slug: dedicatedLink.hasSlug ? resource.label : undefined }),
                    })}
                    style={{ marginRight: 2 }}
                >
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="me-1" /> {dedicatedLink.label} view
                </Button>
            )}
            {!isEditMode && (
                <RequireAuthentication
                    component={Button}
                    className="float-end"
                    color="secondary"
                    size="sm"
                    onClick={() => (!isCurationAllowed && preventEditCase ? setIsOpenPreventModal(true) : toggleIsEditMode())}
                >
                    <FontAwesomeIcon icon={faPen} /> Edit
                </RequireAuthentication>
            )}
            {isEditMode && (
                <Button className="flex-shrink-0" color="secondary-darker" size="sm" onClick={() => toggleIsEditMode()}>
                    <FontAwesomeIcon icon={faTimes} /> Stop editing
                </Button>
            )}
            <UncontrolledButtonDropdown>
                <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                    <FontAwesomeIcon icon={faEllipsisV} />
                </DropdownToggle>
                <DropdownMenu end="true">
                    <DropdownItem onClick={() => setIsOpenGraphViewModal(true)}>View graph</DropdownItem>
                    {additionalContentTypes.find((c) => c.id === contentType) && (
                        <DropdownItem tag={Link} end="true" href={`${reverse(ROUTES.RESOURCE, { id: resource.id })}?noRedirect`}>
                            View resource
                        </DropdownItem>
                    )}
                </DropdownMenu>
            </UncontrolledButtonDropdown>
        </>
    );
};

export default TitleBarButtons;
