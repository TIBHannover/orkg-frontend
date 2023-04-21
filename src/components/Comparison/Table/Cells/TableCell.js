import { Fragment, memo, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ENTITIES } from 'constants/graphSettings';
import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faChevronCircleUp, faChevronCircleDown } from '@fortawesome/free-solid-svg-icons';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import TableCellLiteral from 'components/Comparison/Table/Cells/TableCellLiteral';
import PathTooltipContent from 'components/Comparison/Table/Cells/PathTooltipContent';
import { isEqual } from 'lodash';
import { getCellPadding } from 'slices/comparisonSlice';
import { useSelector } from 'react-redux';

export const Item = styled.div`
    margin: 0;
    height: 100%;
    background: #fff;
`;

export const ItemInner = styled.div`
    padding: ${props => props.cellPadding}px 0;
    border-right: thin solid #d5dae4;
    border-bottom: thin solid #e7eaf1;
    text-align: center;
    height: 100%;
    overflow-wrap: anywhere;

    &:hover .create-button {
        display: block;
    }
`;

export const ItemInnerSeparator = styled.hr`
    margin: ${props => props.cellPadding}px auto;
    width: 100%;
    border-color: #d5dae4;
    opacity: 1;
`;

const MAX_ITEMS = 6;

const TableCell = ({ entities }) => {
    const [modal, setModal] = useState(false);
    const [dialogResourceId, setDialogResourceId] = useState(null);
    const [dialogResourceLabel, setDialogResourceLabel] = useState(null);
    const [dialogResourceType, setDialogResourceType] = useState(ENTITIES.RESOURCE);
    const [path, setPath] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const cellPadding = useSelector(getCellPadding);

    const openStatementBrowser = (id, label, type = null, path = []) => {
        setDialogResourceId(id);
        setDialogResourceLabel(label);
        setDialogResourceType(type || ENTITIES.RESOURCE);
        setPath(path);
        setModal(true);
    };

    const onClickHandle = (date, index) => {
        openStatementBrowser(
            date.resourceId,
            date.label,
            null,
            date.pathLabels.map((l, i) => ({
                id: entities[index].path[i],
                label: l,
                _class: isEqualPaths ? (i % 2 === 0 ? ENTITIES.RESOURCE : ENTITIES.PREDICATE) : i % 2 !== 0 ? ENTITIES.RESOURCE : ENTITIES.PREDICATE,
            })),
        );
    };

    const isEqualPaths = entities?.length > 0 ? entities[0].pathLabels?.length === entities[0].path?.length : true;

    return (
        <>
            <Item>
                <ItemInner cellPadding={cellPadding} className={entities === undefined ? 'itemGroup' : ''}>
                    {entities &&
                        entities.length > 0 &&
                        entities.slice(0, !isExpanded ? MAX_ITEMS : entities?.length).map(
                            (entity, index) =>
                                Object.keys(entity).length > 0 && (
                                    <Fragment key={`value-${entity.resourceId}`}>
                                        {index > 0 && <ItemInnerSeparator cellPadding={cellPadding} />}
                                        <div style={{ padding: '0 5px' }}>
                                            {entity.type === ENTITIES.RESOURCE ? (
                                                <span>
                                                    <DescriptionTooltip
                                                        id={entity.resourceId}
                                                        _class={entity.type}
                                                        classes={entity.classes ?? []}
                                                        extraContent={
                                                            entity.pathLabels?.length > 1 ? (
                                                                <PathTooltipContent data={entity} cellDataValue={entity} />
                                                            ) : (
                                                                ''
                                                            )
                                                        }
                                                    >
                                                        <div
                                                            className="btn-link"
                                                            onClick={() => onClickHandle(entity, index)}
                                                            style={{ cursor: 'pointer' }}
                                                            onKeyDown={e => (e.keyCode === 13 ? onClickHandle(entity, index) : undefined)}
                                                            role="button"
                                                            tabIndex={0}
                                                        >
                                                            <ValuePlugins type="resource">{entity.label}</ValuePlugins>
                                                        </div>
                                                    </DescriptionTooltip>
                                                </span>
                                            ) : (
                                                <TableCellLiteral key={index} entity={entity} />
                                            )}
                                        </div>
                                    </Fragment>
                                ),
                        )}
                    {entities?.length > MAX_ITEMS && (
                        <Button color="secondary" outline size="sm" className="mt-1 border-0" onClick={() => setIsExpanded(v => !v)}>
                            {isExpanded ? 'Hide more' : `Show ${entities.length - MAX_ITEMS} more`}{' '}
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
    entities: PropTypes.array,
};

export default memo(TableCell, isEqual);
