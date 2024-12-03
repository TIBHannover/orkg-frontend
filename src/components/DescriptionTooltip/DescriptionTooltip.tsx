import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faClipboard, faLink, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { ENTITIES, PREDICATES } from 'constants/graphSettings';
import Link from 'next/link';
import { FC, Fragment, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import { Button, ButtonGroup, Table } from 'reactstrap';
import { getStatements, statementsUrl } from 'services/backend/statements';
import { EntityType, Statement } from 'services/backend/types';
import styled from 'styled-components';
import useSWR from 'swr';
import { getLinkByEntityType, getResourceLink } from 'utils';

const TippyStyle = styled(Tippy)`
    &.tippy-box .tippy-content {
        padding: 0 !important;
        table {
            border-collapse: collapse;
            color: #fff;
            overflow-wrap: break-word;
            table-layout: fixed;
            width: 100%;
        }
        table td,
        table th {
            border: 1px solid black;
        }
        table td:first-child {
            width: 100px;
        }
        table tr:first-child td {
            border-top: 0;
            border-bottom: 0;
            border-left: 0;
        }
        table tr:last-child td {
            border-bottom: 0;
        }
        table tr td:first-child,
        table tr th:first-child {
            border-left: 0;
        }
        table tr td:last-child,
        table tr th:last-child {
            border-right: 0;
        }
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
            case ENTITIES.RESOURCE:
                return 'Resource';
            case ENTITIES.CLASS:
                return 'Class';
            case ENTITIES.LITERAL:
                return 'Literal';
            default:
                return 'Resource';
        }
    };

    return (
        <TippyStyle
            onTrigger={() => setIsActive(true)}
            onHide={() => setIsActive(false)}
            content={
                <Table className="rounded mb-0">
                    <tbody>
                        <tr>
                            <td>{renderTypeLabel()} id</td>
                            <td className="d-flex">
                                <div className="flex-grow-1">
                                    <span>{id ?? <em>{`${renderTypeLabel()} doesn't exist yet`}</em>}</span>
                                    {id && (
                                        <CopyToClipboard
                                            text={id}
                                            onCopy={() => {
                                                toast.dismiss();
                                                toast.success('ID copied to clipboard');
                                            }}
                                        >
                                            <Button
                                                title="Click to copy id"
                                                onClick={(e) => e.stopPropagation()}
                                                className="py-0 px-0 ms-1"
                                                size="sm"
                                                color="link"
                                                style={{ verticalAlign: 'middle' }}
                                            >
                                                <FontAwesomeIcon icon={faClipboard} size="xs" />
                                            </Button>
                                        </CopyToClipboard>
                                    )}
                                </div>
                                {id && showURL && (
                                    <div>
                                        <Tippy content={`Go to ${renderTypeLabel()} page`}>
                                            <Link href={getLinkByEntityType(_class, id)} target="_blank">
                                                <FontAwesomeIcon icon={faLink} size="xs" />
                                            </Link>
                                        </Tippy>
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
                </Table>
            }
            delay={[500, 0]}
            appendTo={document.body}
            disabled={disabled}
            interactive
            arrow
        >
            <span>{children}</span>
        </TippyStyle>
    );
};

export default DescriptionTooltip;
