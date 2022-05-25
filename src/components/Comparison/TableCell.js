import { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import { ENTITIES } from 'constants/graphSettings';
import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faChevronCircleUp, faChevronCircleDown } from '@fortawesome/free-solid-svg-icons';
import ValuePlugins from '../ValuePlugins/ValuePlugins';
import StatementBrowserDialog from '../StatementBrowser/StatementBrowserDialog';

export const Item = styled.div`
    padding-right: 10px;
    padding: 0 10px !important;
    margin: 0;
    height: 100%;
    background: #fff;
`;

export const ItemInner = styled.div`
    padding: ${props => props.cellPadding}px 5px;
    border-left: 2px solid #d5dae4;
    border-right: 2px solid #d5dae4;
    border-bottom: 2px solid #e7eaf1;
    text-align: center;
    height: 100%;
    word-wrap: break-word;

    &:hover .create-button {
        display: block;
    }
`;

export const ItemInnerSeparator = styled.hr`
    margin: 5px auto;
    width: 50%;
`;

const MAX_ITEMS = 6;

const TableCell = props => {
    const [modal, setModal] = useState(false);
    const [dialogResourceId, setDialogResourceId] = useState(null);
    const [dialogResourceLabel, setDialogResourceLabel] = useState(null);
    const [dialogResourceType, setDialogResourceType] = useState(ENTITIES.RESOURCE);
    const [path, setPath] = useState([]);
    const [data, setData] = useState(props.data?.slice(0, MAX_ITEMS));
    const [isExpanded, setIsExpanded] = useState(false);

    const openStatementBrowser = (id, label, type = null, path = []) => {
        setDialogResourceId(id);
        setDialogResourceLabel(label);
        setDialogResourceType(type || ENTITIES.RESOURCE);
        setPath(path);
        setModal(true);
    };

    const toggleExpand = () => {
        if (isExpanded) {
            setData(props.data?.slice(0, MAX_ITEMS));
            setIsExpanded(false);
        } else {
            setData([...props.data]);
            setIsExpanded(true);
        }
    };

    const PathTooltipContent = (data, cellDataValue) => (
        <div className="fullPath">
            Path of this value:{' '}
            {data.pathLabels?.map((path, index) => {
                const resourceType = isEqualPaths
                    ? index % 2 === 0
                        ? ENTITIES.RESOURCE
                        : ENTITIES.PREDICATE
                    : index % 2 !== 0
                    ? ENTITIES.RESOURCE
                    : ENTITIES.PREDICATE;
                return (
                    <span key={index}>
                        <span
                            className={resourceType !== ENTITIES.PREDICATE ? 'btn-link' : ''}
                            onClick={() =>
                                resourceType !== ENTITIES.PREDICATE
                                    ? openStatementBrowser(
                                          data.path[isEqualPaths ? index : index + 1],
                                          path,
                                          resourceType,
                                          resourceType === ENTITIES.RESOURCE
                                              ? data.pathLabels.slice(0, isEqualPaths ? index : index + 1).map((l, i) => ({
                                                    id: cellDataValue.path[i],
                                                    label: l,
                                                    _class: i % 2 === 0 ? ENTITIES.RESOURCE : ENTITIES.PREDICATE,
                                                }))
                                              : [],
                                      )
                                    : null
                            }
                            style={{ cursor: resourceType !== ENTITIES.PREDICATE ? 'pointer' : 'default' }}
                            onKeyDown={e =>
                                (e.keyCode === 13
                                    ? () =>
                                          resourceType !== ENTITIES.PREDICATE
                                              ? openStatementBrowser(
                                                    data.path[isEqualPaths ? index : index + 1],
                                                    path,
                                                    resourceType,
                                                    resourceType === ENTITIES.RESOURCE
                                                        ? data.pathLabels.slice(0, isEqualPaths ? index : index + 1).map((l, i) => ({
                                                              id: cellDataValue.path[i],
                                                              label: l,
                                                              _class: i % 2 === 0 ? ENTITIES.RESOURCE : ENTITIES.PREDICATE,
                                                          }))
                                                        : [],
                                                )
                                              : null
                                    : undefined)
                            }
                            role="button"
                            tabIndex={0}
                        >
                            {path}
                        </span>
                        {index !== data.pathLabels?.length - 1 && ' / '}
                    </span>
                );
            })}
        </div>
    );

    const onClickHandle = (date, index) => {
        openStatementBrowser(
            date.resourceId,
            date.label,
            null,
            date.pathLabels.map((l, i) => ({
                id: data[index].path[i],
                label: l,
                _class: isEqualPaths ? (i % 2 === 0 ? ENTITIES.RESOURCE : ENTITIES.PREDICATE) : i % 2 !== 0 ? ENTITIES.RESOURCE : ENTITIES.PREDICATE,
            })),
        );
    };

    const isEqualPaths = props.data?.length > 0 ? props.data[0].pathLabels?.length === props.data[0].path?.length : true;

    let cellPadding = 10;
    if (props.viewDensity === 'normal') {
        cellPadding = 5;
    } else if (props.viewDensity === 'compact') {
        cellPadding = 1;
    }

    return (
        <>
            <Item>
                <ItemInner cellPadding={cellPadding} className={data === undefined ? 'itemGroup' : ''}>
                    {data &&
                        data.length > 0 &&
                        data.map(
                            (date, index) =>
                                Object.keys(date).length > 0 &&
                                (date.type === ENTITIES.RESOURCE ? (
                                    <span key={`value-${date.resourceId}`}>
                                        {index > 0 && <ItemInnerSeparator />}
                                        <Tippy
                                            content={PathTooltipContent(date, data[index])}
                                            arrow={true}
                                            disabled={date.pathLabels?.length <= 1}
                                            interactive={true}
                                        >
                                            <div
                                                className="btn-link"
                                                onClick={() => onClickHandle(date, index)}
                                                style={{ cursor: 'pointer' }}
                                                onKeyDown={e => (e.keyCode === 13 ? onClickHandle(date, index) : undefined)}
                                                role="button"
                                                tabIndex={0}
                                            >
                                                <ValuePlugins type="resource">{date.label}</ValuePlugins>
                                            </div>
                                        </Tippy>
                                    </span>
                                ) : (
                                    <span key={`value-${date.label}-${index}`}>
                                        {index > 0 && <ItemInnerSeparator />}
                                        <Tippy
                                            content={PathTooltipContent(date, data[index])}
                                            arrow={true}
                                            disabled={date.pathLabels?.length <= 1}
                                            interactive={true}
                                        >
                                            <span>
                                                <ValuePlugins type="literal" options={{ inModal: true }}>
                                                    {date.label}
                                                </ValuePlugins>
                                            </span>
                                        </Tippy>
                                    </span>
                                )),
                        )}
                    {props.data?.length > MAX_ITEMS && (
                        <Button color="secondary" outline size="sm" className="mt-1 border-0" onClick={toggleExpand}>
                            {isExpanded ? 'Hide more' : `Show ${props.data.length - MAX_ITEMS} more`}{' '}
                            <Icon icon={isExpanded ? faChevronCircleUp : faChevronCircleDown} />
                        </Button>
                    )}
                </ItemInner>
            </Item>

            {modal && (
                <StatementBrowserDialog
                    show={modal}
                    toggleModal={() => setModal(v => !v)}
                    id={dialogResourceId}
                    label={dialogResourceLabel}
                    type={dialogResourceType}
                    initialPath={path}
                />
            )}
        </>
    );
};

TableCell.propTypes = {
    data: PropTypes.array,
    viewDensity: PropTypes.oneOf(['spacious', 'normal', 'compact']),
};

export default TableCell;
