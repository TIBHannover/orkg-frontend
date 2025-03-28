import { faPen, faTags } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { Fragment, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import styled from 'styled-components';

import ActionButton from '@/components/ActionButton/ActionButton';
import ClassesInput from '@/components/DataBrowser/components/Header/Metadata/ClassesInput/ClassesInput';
import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useCanEdit from '@/components/DataBrowser/hooks/useCanEdit';
import useClasses from '@/components/DataBrowser/hooks/useClasses';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';

export const BadgeTagsStyle = styled.div`
    background-color: ${(props) => props.theme.lightDarker};
    overflow-wrap: break-word;
    border-radius: 4px;
    font-size: 85%;
`;

const Classes = () => {
    const [isEditing, setIsEditing] = useState(false);
    const { config } = useDataBrowserState();
    const { isEditMode } = config;
    const { canEdit } = useCanEdit();
    const { classes, isLoading } = useClasses();
    const { entity } = useEntity();

    if (entity?._class !== ENTITIES.RESOURCE) {
        return null;
    }

    return (
        <div className="d-flex align-items-center">
            <BadgeTagsStyle className={`text-muted ps-2 ${!isEditing ? 'pe-2' : ''} my-1 me-1 align-items-center d-flex`}>
                <FontAwesomeIcon icon={faTags} className="me-1" />
                <span className="text-secondary-darker flex-shrink-0"> Instance of: </span>
                {!isEditing && (
                    <div className="mx-1" style={{ padding: '3.5px 0' }}>
                        {!isLoading &&
                            classes?.map((c, index) => (
                                <Fragment key={c.id}>
                                    <DescriptionTooltip id={c.id} _class={ENTITIES.CLASS} disabled={false}>
                                        <Link target="_blank" href={reverse(ROUTES.CLASS, { id: c.id })}>
                                            {c.label}
                                        </Link>
                                    </DescriptionTooltip>
                                    {index + 1 !== classes.length && ', '}
                                </Fragment>
                            ))}
                        {!isLoading && classes?.length === 0 && <i className="text-secondary-darker">No classes</i>}
                        {isLoading && <Skeleton width={100} />}
                    </div>
                )}

                {isEditing && <ClassesInput setIsEditing={setIsEditing} />}
            </BadgeTagsStyle>
            {canEdit && isEditMode && !isEditing && <ActionButton title="Edit classes" icon={faPen} action={() => setIsEditing(true)} />}
        </div>
    );
};

export default Classes;
