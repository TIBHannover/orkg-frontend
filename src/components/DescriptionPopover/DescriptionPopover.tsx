'use client';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faLink, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup, type ButtonProps, Popover, Tooltip } from '@heroui/react';
import Link from 'next/link';
import { FC, Fragment, useState } from 'react';
import useSWR from 'swr';

import CopyId from '@/components/CopyId/CopyId';
import { ENTITIES, PREDICATES } from '@/constants/graphSettings';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { EntityType, Statement } from '@/services/backend/types';
import { getLinkByEntityType, getResourceLink } from '@/utils';

type DescriptionPopoverProps = {
    id?: string;
    _class: EntityType;
    classes?: string[];
    children: React.ReactNode;
    extraContent?: React.ReactNode;
    contextDescription?: string;
    disabled?: boolean;
    showURL?: boolean;
    buttons?: {
        title: string;
        variant?: ButtonProps['variant'];
        icon: IconProp;
        action?: () => void;
    }[];
};

const DescriptionPopover: FC<DescriptionPopoverProps> = ({
    id,
    _class,
    classes,
    children,
    extraContent,
    contextDescription,
    disabled = false,
    showURL = false,
    buttons,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const { data, isLoading } = useSWR(
        isOpen && id && _class !== ENTITIES.LITERAL
            ? [{ subjectId: id, predicateId: PREDICATES.DESCRIPTION, returnContent: true }, statementsUrl, 'getStatements']
            : null,
        ([params]) => getStatements(params) as Promise<Statement[]>,
    );

    let description = !contextDescription ? (data?.[0]?.object.label ?? '') : contextDescription;

    description = description.length > 300 ? `${description.substring(0, 300)}...` : description;

    const renderTypeLabel = () => {
        switch (_class) {
            case ENTITIES.PREDICATE:
                return 'Property';
            case `${ENTITIES.PREDICATE}_ref`:
                return 'Property';
            case ENTITIES.RESOURCE:
                return 'Resource';
            case `${ENTITIES.RESOURCE}_ref`:
                return 'Resource';
            case ENTITIES.CLASS:
                return 'Class';
            case `${ENTITIES.CLASS}_ref`:
                return 'Class';
            case ENTITIES.LITERAL:
                return 'Literal';
            default:
                return 'Resource';
        }
    };

    if (disabled) {
        return <span>{children}</span>;
    }

    return (
        <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger>
                <span className="cursor-pointer">{children}</span>
            </Popover.Trigger>
            <Popover.Content className="w-[300px] p-0">
                <Popover.Dialog>
                    <Popover.Arrow />
                    <div className="break-normal text-xs space-y-2 p-0">
                        <div className="flex items-center gap-2">
                            {id ? (
                                <>
                                    <CopyId id={id} text={`${renderTypeLabel()} id`} fullWidth />
                                    {showURL && (
                                        <Tooltip>
                                            <Tooltip.Trigger>
                                                <Link href={getLinkByEntityType(_class, id)} target="_blank">
                                                    <FontAwesomeIcon icon={faLink} size="xs" />
                                                </Link>
                                            </Tooltip.Trigger>
                                            <Tooltip.Content showArrow>
                                                <Tooltip.Arrow />
                                                {`Go to ${renderTypeLabel()} page`}
                                            </Tooltip.Content>
                                        </Tooltip>
                                    )}
                                </>
                            ) : (
                                <div className="flex w-full items-center justify-between gap-3">
                                    <span className="text-muted shrink-0">{renderTypeLabel()} id</span>
                                    <em>{`${renderTypeLabel()} doesn't exist yet`}</em>
                                </div>
                            )}
                        </div>
                        {classes && classes.length > 0 && (
                            <>
                                <hr className="border-border" />
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="text-muted shrink-0">Instance of</span>
                                    <span>
                                        {classes.map((c, index: number) => (
                                            <Fragment key={c}>
                                                <Link href={getResourceLink(ENTITIES.CLASS, c)} target="_blank">
                                                    {c}
                                                </Link>
                                                {index + 1 < classes.length && ', '}
                                            </Fragment>
                                        ))}
                                    </span>
                                </div>
                            </>
                        )}
                        {_class !== ENTITIES.LITERAL && (
                            <>
                                <hr className="border-border" />
                                <div>
                                    <span className="text-muted">Description</span>
                                    <p className="mt-1 mb-0 leading-relaxed text-sm">
                                        {isLoading && <FontAwesomeIcon icon={faSpinner} spin />}
                                        {!isLoading && description && description}
                                        {!isLoading && !description && <span className="italic text-muted text-xs">No description yet</span>}
                                    </p>
                                </div>
                            </>
                        )}
                        {extraContent}
                        {buttons && buttons.length > 0 && (
                            <>
                                <hr className="border-border" />
                                <ButtonGroup size="sm">
                                    {buttons.map((button) => (
                                        <Button
                                            onPress={() => {
                                                button.action?.();
                                            }}
                                            className="px-2 py-0"
                                            key={button.title}
                                            variant={button.variant ?? 'primary'}
                                        >
                                            <FontAwesomeIcon icon={button.icon} className="mr-1" />
                                            {button.title}
                                        </Button>
                                    ))}
                                </ButtonGroup>
                            </>
                        )}
                    </div>
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
};

export default DescriptionPopover;
