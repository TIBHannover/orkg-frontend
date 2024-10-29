import { faChevronCircleDown, faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PathTooltipContent from 'components/Comparison/Table/Cells/PathTooltipContent';
import TableCellLiteral from 'components/Comparison/Table/Cells/TableCellLiteral';
import DataBrowserDialog from 'components/DataBrowser/DataBrowserDialog';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import { ENTITIES } from 'constants/graphSettings';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { Fragment, memo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'reactstrap';
import { getCellPadding } from 'slices/comparisonSlice';
import styled from 'styled-components';

export const Item = styled.div`
    margin: 0;
    height: 100%;
    background: #fff;
`;

export const ItemInner = styled.div`
    padding: ${(props) => props.cellPadding}px 0;
    border-right: thin solid #d5dae4;
    border-bottom: thin solid #e7eaf1;
    text-align: center;
    height: 100%;
    overflow-wrap: anywhere;
    background-color: ${(props) => props.$backgroundColor};

    &:hover .create-button {
        display: block;
    }
`;

export const ItemInnerSeparator = styled.hr`
    margin: ${(props) => props.cellPadding}px auto;
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
            date.id,
            date.label,
            null,
            date.path_labels.map((l, i) => ({
                id: entities[index].path[i],
                label: l,
                _class: isEqualPaths ? (i % 2 === 0 ? ENTITIES.RESOURCE : ENTITIES.PREDICATE) : i % 2 !== 0 ? ENTITIES.RESOURCE : ENTITIES.PREDICATE,
            })),
        );
    };

    const isEqualPaths = entities?.length > 0 ? entities[0].path_labels?.length === entities[0].path?.length : true;

    return (
        <>
            <Item>
                <ItemInner cellPadding={cellPadding} className={entities === undefined ? 'itemGroup' : ''}>
                    {entities &&
                        entities.length > 0 &&
                        entities.slice(0, !isExpanded ? MAX_ITEMS : entities?.length).map(
                            (entity, index) =>
                                Object.keys(entity).length > 0 && (
                                    <Fragment key={`value-${entity.id}`}>
                                        {index > 0 && <ItemInnerSeparator cellPadding={cellPadding} />}
                                        <div style={{ padding: '0 5px' }}>
                                            {entity._class === ENTITIES.RESOURCE ? (
                                                <span>
                                                    <DescriptionTooltip
                                                        id={entity.id}
                                                        _class={entity._class}
                                                        classes={entity.classes ?? []}
                                                        extraContent={
                                                            entity.path_labels?.length > 1 && (
                                                                <PathTooltipContent
                                                                    data={entity}
                                                                    cellDataValue={entity}
                                                                    openStatementBrowser={openStatementBrowser}
                                                                />
                                                            )
                                                        }
                                                    >
                                                        <div
                                                            className="btn-link"
                                                            onClick={() => onClickHandle(entity, index)}
                                                            style={{ cursor: 'pointer' }}
                                                            onKeyDown={(e) => (e.keyCode === 13 ? onClickHandle(entity, index) : undefined)}
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
                        <Button color="secondary" outline size="sm" className="mt-1 border-0" onClick={() => setIsExpanded((v) => !v)}>
                            {isExpanded ? 'Hide more' : `Show ${entities.length - MAX_ITEMS} more`}{' '}
                            <Icon icon={isExpanded ? faChevronCircleUp : faChevronCircleDown} />
                        </Button>
                    )}
                </ItemInner>
            </Item>

            {modal && (
                <DataBrowserDialog
                    defaultHistory={[...path.map((p) => p.id), dialogResourceId]}
                    show={modal}
                    toggleModal={() => setModal((v) => !v)}
                    id={dialogResourceId}
                    label={dialogResourceLabel}
                    type={dialogResourceType}
                />
            )}
        </>
    );
};

TableCell.propTypes = {
    entities: PropTypes.array,
};

export default memo(TableCell, isEqual);
