import { faPen, faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Skeleton } from '@heroui/react';
import Link from 'next/link';
import pluralize from 'pluralize';
import { Fragment, useState } from 'react';

import ActionButton from '@/components/ActionButton/ActionButton';
import BadgeTag from '@/components/DataBrowser/components/Header/Metadata/BadgeTag';
import TemplatesModal from '@/components/DataBrowser/components/TemplatesModal/TemplatesModal';
import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useCanEdit from '@/components/DataBrowser/hooks/useCanEdit';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import useTemplates from '@/components/DataBrowser/hooks/useTemplates';
import TemplateTooltip from '@/components/TemplateTooltip/TemplateTooltip';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

const Templates = () => {
    const { config } = useDataBrowserState();
    const { isEditMode } = config;
    const { entity } = useEntity();
    const { templates: _templates, isLoading } = useTemplates();
    const templates = _templates?.filter((t) => t.target_class.id !== CLASSES.RESOURCE);
    const { canEdit } = useCanEdit();
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    return (
        <div className="flex items-center">
            <BadgeTag>
                <FontAwesomeIcon icon={faPuzzlePiece} className="mr-1" />
                <span className="text-secondary-darker shrink-0"> Applied {pluralize('template', templates?.length ?? 0, false)}: </span>
                <div className="mx-1">
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
                    {isLoading && <Skeleton className="w-[100px] h-4 rounded" />}
                </div>
            </BadgeTag>
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
