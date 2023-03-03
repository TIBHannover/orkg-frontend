import { useState, Fragment, useEffect } from 'react';
import { Button, Table } from 'reactstrap';
import PropTypes from 'prop-types';
import Tippy from '@tippyjs/react';
import { truncate } from 'lodash';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faClipboard } from '@fortawesome/free-solid-svg-icons';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { PREDICATES, ENTITIES } from 'constants/graphSettings';
import CopyToClipboard from 'react-copy-to-clipboard';
import { getResourceLink } from 'utils';
import { toast } from 'react-toastify';
import styled from 'styled-components';

const TippyStyle = styled(Tippy)`
    &.tippy-box[data-theme~='descriptionTooltip'] .tippy-content {
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

const DescriptionTooltip = props => {
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const onTrigger = () => {
        if (!isLoaded && props._class !== ENTITIES.LITERAL) {
            setIsLoading(true);
            getStatementsBySubjectAndPredicate({ subjectId: props.id, predicateId: PREDICATES.DESCRIPTION })
                .then(descriptionStatement => {
                    if (descriptionStatement.length) {
                        setDescription(descriptionStatement[0].object.label);
                    }
                    setIsLoading(false);
                    setIsLoaded(true);
                })
                .catch(() => {
                    setIsLoading(false);
                    setIsLoaded(true);
                });
        }
    };

    useEffect(() => {
        setIsLoaded(false);
    }, [props?.id]);

    const renderTypeLabel = () => {
        switch (props._class) {
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
            theme="descriptionTooltip"
            onTrigger={onTrigger}
            content={
                <Table className="rounded mb-0">
                    <tbody>
                        <tr>
                            <td>{renderTypeLabel()} id</td>
                            <td>
                                <span>{props.id}</span>
                                <CopyToClipboard
                                    text={props.id}
                                    onCopy={() => {
                                        toast.dismiss();
                                        toast.success('ID copied to clipboard');
                                    }}
                                >
                                    <Button
                                        title="Click to copy id"
                                        onClick={e => e.stopPropagation()}
                                        className="py-0 px-0 ms-1"
                                        size="sm"
                                        color="link"
                                        style={{ verticalAlign: 'middle' }}
                                    >
                                        <Icon icon={faClipboard} size="xs" />
                                    </Button>
                                </CopyToClipboard>
                            </td>
                        </tr>
                        {props.classes?.length > 0 && (
                            <tr>
                                <td>Instance of</td>
                                <td>
                                    {props.classes.map((c, index) => (
                                        <Fragment key={index}>
                                            <Link to={getResourceLink(ENTITIES.CLASS, c)} target="_blank">
                                                {c}
                                            </Link>
                                            {index + 1 < props.classes.length && ','}
                                        </Fragment>
                                    ))}
                                </td>
                            </tr>
                        )}
                        {props._class !== ENTITIES.LITERAL && (
                            <tr>
                                <td>Description</td>
                                <td>
                                    {' '}
                                    {!isLoading ? (
                                        <>
                                            {description ? (
                                                <> {truncate(description, { length: 300 })}</>
                                            ) : (
                                                <small className="font-italic"> No description yet</small>
                                            )}
                                        </>
                                    ) : (
                                        <Icon icon={faSpinner} spin />
                                    )}
                                </td>
                            </tr>
                        )}
                        {props.extraContent && props.extraContent}
                    </tbody>
                </Table>
            }
            delay={[500, 0]}
            appendTo={document.body}
            disabled={props.disabled}
            interactive={true}
            arrow={true}
        >
            <span tabIndex="0" title="">
                {props.children}
            </span>
        </TippyStyle>
    );
};

DescriptionTooltip.propTypes = {
    children: PropTypes.node.isRequired,
    id: PropTypes.string.isRequired,
    _class: PropTypes.string.isRequired,
    classes: PropTypes.array,
    extraContent: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    disabled: PropTypes.bool.isRequired,
};

DescriptionTooltip.defaultProps = {
    disabled: false,
};

export default DescriptionTooltip;
