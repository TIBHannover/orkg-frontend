import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faClipboard, faLink, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from '@heroui/react';
import Link from 'next/link';
import { FC, Fragment, useEffect, useState } from 'react';
import { useCopyToClipboard } from 'react-use';
import useSWR from 'swr';

import Tooltip from '@/components/FloatingUI/Tooltip';
import Button from '@/components/Ui/Button/Button';
import ButtonGroup from '@/components/Ui/Button/ButtonGroup';
import { ENTITIES, PREDICATES } from '@/constants/graphSettings';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { EntityType, Statement } from '@/services/backend/types';
import { getLinkByEntityType, getResourceLink } from '@/utils';

type DescriptionTooltipProps = {
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
        color: string;
        icon: IconProp;
        action?: () => void;
    }[];
};

const DescriptionTooltip: FC<DescriptionTooltipProps> = ({
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
    const [isActive, setIsActive] = useState(false);
    const [state, copyToClipboard] = useCopyToClipboard();

    useEffect(() => {
        if (state.value) {
            toast.clear();
            toast.success('ID copied to clipboard');
        }
    }, [state.value]);

    const { data, isLoading } = useSWR(
        isActive && id && _class !== ENTITIES.LITERAL
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

    return (
        <Tooltip
            onTrigger={() => setIsActive(true)}
            content={
                <div className="w-[300px] break-normal text-xs space-y-2 p-1">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-muted shrink-0">{renderTypeLabel()} id</span>
                        <span className="flex items-center gap-1">
                            <span>{id ?? <em>{`${renderTypeLabel()} doesn't exist yet`}</em>}</span>
                            {id && (
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(id);
                                    }}
                                    title="Click to copy id"
                                    className="py-0 px-0"
                                    size="sm"
                                    color="link"
                                >
                                    <FontAwesomeIcon icon={faClipboard} size="xs" />
                                </Button>
                            )}
                            {id && showURL && (
                                <Tooltip content={`Go to ${renderTypeLabel()} page`}>
                                    <Link href={getLinkByEntityType(_class, id)} target="_blank">
                                        <FontAwesomeIcon icon={faLink} size="xs" />
                                    </Link>
                                </Tooltip>
                            )}
                        </span>
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
                            <ButtonGroup tabIndex={0} size="sm">
                                {buttons.map((button, i) => (
                                    <Button
                                        onClick={() => {
                                            button.action?.();
                                        }}
                                        className="px-2 py-0"
                                        key={i}
                                        color={button.color}
                                    >
                                        <FontAwesomeIcon icon={button.icon} className="mr-1" />
                                        {button.title}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </>
                    )}
                </div>
            }
            disabled={disabled}
        >
            <span>{children}</span>
        </Tooltip>
    );
};

export default DescriptionTooltip;
