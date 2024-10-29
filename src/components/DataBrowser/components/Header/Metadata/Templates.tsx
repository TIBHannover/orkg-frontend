import { faPen, faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ActionButton from 'components/ActionButton/ActionButton';
import { useDataBrowserState } from 'components/DataBrowser/context/DataBrowserContext';
import { BadgeTagsStyle } from 'components/DataBrowser/components/Header/Metadata/Classes';
import useCanEdit from 'components/DataBrowser/hooks/useCanEdit';
import useEntity from 'components/DataBrowser/hooks/useEntity';
import useTemplates from 'components/DataBrowser/hooks/useTemplates';
import TemplatesModal from 'components/DataBrowser/components/TemplatesModal/TemplatesModal';
import Link from 'next/link';
import TemplateTooltip from 'components/TemplateTooltip/TemplateTooltip';
import { ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import pluralize from 'pluralize';
import { Fragment, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

const Templates = () => {
    const { config } = useDataBrowserState();
    const { isEditMode } = config;
    const { entity } = useEntity();
    const { templates, isLoading } = useTemplates();
    const { canEdit } = useCanEdit();
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    return (
        <div className="d-flex align-items-center">
            <BadgeTagsStyle className="text-muted ps-2 my-1 me-1 pe-2 align-items-center d-flex">
                <Icon icon={faPuzzlePiece} className="me-1" />
                <span className="text-secondary-darker flex-shrink-0"> Applied {pluralize('template', templates?.length ?? 0, false)}: </span>
                <div className="mx-1" style={{ padding: '3.5px 0' }}>
                    {!isLoading &&
                        templates?.map((t, index) => (
                            <Fragment key={t.id}>
                                <TemplateTooltip id={t.id}>
                                    <Link target="_blank" href={reverse(ROUTES.TEMPLATE, { id: t.id })}>
                                        {t.label}
                                    </Link>
                                </TemplateTooltip>
                                {index + 1 !== templates.length && ', '}
                            </Fragment>
                        ))}
                    {!isLoading && templates?.length === 0 && <i className="text-secondary-darker">No templates applied</i>}
                    {isLoading && <Skeleton width={100} />}
                </div>
            </BadgeTagsStyle>
            {canEdit && entity?._class === ENTITIES.RESOURCE && isEditMode && (
                <>
                    <TemplatesModal isOpen={isOpen} toggle={toggle} />
                    <ActionButton title="Edit templates" icon={faPen} action={toggle} />
                </>
            )}
        </div>
    );
};

export default Templates;
