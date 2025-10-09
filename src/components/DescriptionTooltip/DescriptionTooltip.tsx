import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faClipboard, faLink, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { FC, Fragment, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'react-use';
import styled from 'styled-components';
import useSWR from 'swr';

import Tooltip from '@/components/FloatingUI/Tooltip';
import Button from '@/components/Ui/Button/Button';
import ButtonGroup from '@/components/Ui/Button/ButtonGroup';
import Table from '@/components/Ui/Table/Table';
import { ENTITIES, PREDICATES } from '@/constants/graphSettings';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { EntityType, Statement } from '@/services/backend/types';
import { getLinkByEntityType, getResourceLink } from '@/utils';

const TableContentStyle = styled(Table)`
    border-collapse: collapse;
    color: #fff;
    overflow-wrap: break-word;
    table-layout: fixed;
    max-width: 300px;

    td,
    th {
        border: 1px solid black;
    }
    td:first-child {
        width: 100px;
    }
    tr:first-child td {
        border-top: 0;
        border-bottom: 0;
        border-left: 0;
    }
    tr:last-child td {
        border-bottom: 0;
    }
    tr td:first-child,
    tr th:first-child {
        border-left: 0;
    }
    tr td:last-child,
    tr th:last-child {
        border-right: 0;
    }
`;

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
            toast.dismiss();
            toast.success('ID copied to clipboard');
        }
    }, [state.value]);

    const { data, isLoading } = useSWR(
        isActive && id && _class !== ENTITIES.LITERAL
            ? [{ subjectId: id, predicateId: PREDICATES.DESCRIPTION, returnContent: true }, statementsUrl, 'getStatements']
            : null,
        ([params]) => getStatements(params) as Promise<Statement[]>,
    );

    let description = !contextDescription ? data?.[0]?.object.label ?? '' : contextDescription;

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
            contentStyle={{
                padding: 0,
            }}
            onTrigger={() => setIsActive(true)}
            content={
                <TableContentStyle className="rounded mb-0" style={{ padding: '0px' }}>
                    <tbody>
                        <tr>
                            <td>{renderTypeLabel()} id</td>
                            <td className="d-flex">
                                <div className="flex-grow-1">
                                    <span>{id ?? <em>{`${renderTypeLabel()} doesn't exist yet`}</em>}</span>
                                    {id && (
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                copyToClipboard(id);
                                            }}
                                            title="Click to copy id"
                                            className="py-0 px-0 ms-1"
                                            size="sm"
                                            color="link"
                                            style={{ verticalAlign: 'middle' }}
                                        >
                                            <FontAwesomeIcon icon={faClipboard} size="xs" />
                                        </Button>
                                    )}
                                </div>
                                {id && showURL && (
                                    <div>
                                        <Tooltip content={`Go to ${renderTypeLabel()} page`}>
                                            <Link href={getLinkByEntityType(_class, id)} target="_blank">
                                                <FontAwesomeIcon icon={faLink} size="xs" />
                                            </Link>
                                        </Tooltip>
                                    </div>
                                )}
                            </td>
                        </tr>
                        {classes && classes?.length > 0 && (
                            <tr>
                                <td>Instance of</td>
                                <td>
                                    {classes.map((c, index: number) => (
                                        <Fragment key={c}>
                                            <Link href={getResourceLink(ENTITIES.CLASS, c)} target="_blank">
                                                {c}
                                            </Link>
                                            {index + 1 < classes.length && ','}
                                        </Fragment>
                                    ))}
                                </td>
                            </tr>
                        )}
                        {_class !== ENTITIES.LITERAL && (
                            <tr>
                                <td>Description</td>
                                <td>
                                    {isLoading && <FontAwesomeIcon icon={faSpinner} spin />}
                                    {!isLoading && description && description}
                                    {!isLoading && !description && <small className="font-italic"> No description yet</small>}
                                </td>
                            </tr>
                        )}
                        {extraContent}
                        {buttons && buttons.length > 0 && (
                            <tr>
                                <td colSpan={2}>
                                    <ButtonGroup tabIndex={0} size="sm">
                                        {buttons?.map((button, i) => (
                                            <Button
                                                onClick={() => {
                                                    button.action?.();
                                                }}
                                                className="px-2 py-0"
                                                key={i}
                                                color={button.color}
                                            >
                                                <FontAwesomeIcon icon={button.icon} className="me-1" />
                                                {button.title}
                                            </Button>
                                        ))}
                                    </ButtonGroup>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </TableContentStyle>
            }
            disabled={disabled}
        >
            <span>{children}</span>
        </Tooltip>
    );
};

export default DescriptionTooltip;
