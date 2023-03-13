import { faArrowsAlt, faSortDown, faSortUp, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import CopyId from 'components/CopyId/CopyId';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import { ENTITIES, PREDICATES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CSVLink } from 'react-csv';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { usePagination, useSortBy, useTable } from 'react-table';
import {
    Alert,
    Button,
    ButtonGroup,
    Input,
    InputGroup,
    Modal,
    ModalBody,
    ModalHeader,
    Pagination,
    PaginationItem,
    PaginationLink,
    Table,
} from 'reactstrap';
import {
    fetchStatementsForResource,
    getDepthByValueId,
    getTableByValueId,
    selectResourceAction as selectResource,
} from 'slices/statementBrowserSlice';
import { sortMethod } from 'utils';

function CSVWTable(props) {
    const resource = useSelector(state => state.statementBrowser.resources.byId[props.id]);
    const value = useSelector(state => state.statementBrowser.values.byId[resource.valueId]);
    const fetchedDepth = useSelector(state => getDepthByValueId(state, resource.valueId));
    const { lines, cols, isTitlesColumnsExist } = useSelector(state => getTableByValueId(state, resource.valueId), shallowEqual);

    const dispatch = useDispatch();
    const columnsSortMethod = useCallback((rowA, rowB, id, desc) => sortMethod(rowA.original[id].value?.label, rowB.original[id].value?.label), []);

    useEffect(() => {
        const handleViewTableClick = async e => {
            const { existingResourceId } = resource;
            if (existingResourceId) {
                if (!resource.isFetching && fetchedDepth < 3) {
                    await dispatch(
                        fetchStatementsForResource({
                            resourceId: resource.existingResourceId,
                            depth: 3,
                        }),
                    );
                }
            }
        };
        handleViewTableClick();
    }, [dispatch, fetchedDepth, resource]);

    const handleCellClick = (e, r, propertyId) => {
        // Clicking on the label opens the cell and clicking on empty space open the row
        e.stopPropagation();
        if (r._class !== ENTITIES.LITERAL) {
            dispatch(
                selectResource({
                    increaseLevel: true,
                    resourceId: r.resourceId,
                    label: r.label ? r.label : 'No label',
                    propertyLabel: PREDICATES.CSVW_ROWS === propertyId ? 'rows' : 'cells',
                }),
            );
            props.toggleModal();
        }
    };

    const columns = useMemo(
        () =>
            cols?.map((c, index) => ({
                Header: c.titles?.label ?? 'No Label',
                accessor: c.existingResourceId,
                sortType: columnsSortMethod,
                disableFilters: isTitlesColumnsExist && index === 0,
                Cell: innerProps => (
                    <span
                        onKeyDown={e => (e.key === 'Enter' ? handleCellClick(e, innerProps?.value, PREDICATES.CSVW_CELLS) : undefined)}
                        role="button"
                        tabIndex={0}
                        onClick={e => handleCellClick(e, innerProps?.value, PREDICATES.CSVW_CELLS)}
                    >
                        {innerProps?.value?.value?.label ?? <b>{innerProps?.value?.label}</b> ?? (
                            <small>
                                <i>N/A</i>
                            </small>
                        )}
                    </span>
                ),
            })) ?? [],
        [lines?.length, cols?.length],
    );

    const data = useMemo(
        () =>
            lines?.map(r => {
                let values = r.cells.map(c => c) ?? [];
                values = values.map((c, index) => ({
                    [cols[!isTitlesColumnsExist ? index : index + 1].existingResourceId]: c,
                }));
                values.cells = r;
                values = Object.assign({}, ...values);
                if (isTitlesColumnsExist) {
                    values.titles = r.titles;
                }
                return values;
            }) ?? [],
        [lines?.length, cols?.length],
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page, // Instead of using 'rows', we'll use page,
        // which has only the rows for the active page
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        rows,
        state: { pageIndex, pageSize },
    } = useTable(
        {
            columns,
            data,
            initialState: {
                pageIndex: 0,
                sortBy:
                    columns?.columns?.length > 0
                        ? [
                              {
                                  id: columns[0].accessor,
                                  desc: false,
                              },
                          ]
                        : [],
            },
        },
        useSortBy,
        usePagination,
    );

    const [isCSVWModelOpen, setIsCSVWModelOpen] = useState(false);

    const toggleModal = () => {
        setIsCSVWModelOpen(v => !v);
    };

    return (
        <ConditionalWrapper
            condition={isCSVWModelOpen}
            wrapper={children => (
                <Modal fade={false} fullscreen isOpen={isCSVWModelOpen} toggle={toggleModal} size="lg">
                    <ModalHeader toggle={toggleModal}>View Tabular Data: {value.label}</ModalHeader>
                    <ModalBody>{children} </ModalBody>
                </Modal>
            )}
        >
            <>
                {!resource.isFetching && !resource.isFailedFetching && (
                    <>
                        <div className="d-flex justify-content-between">
                            <div className="flex-shrink-0 my-1">
                                <CopyId id={resource.id} />
                            </div>
                            <ButtonGroup className="mb-3" size="sm">
                                <Button style={{ marginRight: '2px' }} size="sm" onClick={toggleModal}>
                                    <Icon icon={faArrowsAlt} className="me-1" /> {isCSVWModelOpen ? 'Close full width mode' : 'Full width'}
                                </Button>
                                {rows?.length > 0 && (
                                    <CSVLink
                                        headers={cols.map(h => ({
                                            label: h.titles?.label ?? 'No Label',
                                            key: h.existingResourceId,
                                        }))}
                                        data={data?.map(
                                            c => Object.assign({}, ...Object.keys(c).map(v => ({ [v]: c[v]?.value?.label ?? '' }))) ?? [],
                                        )}
                                        filename={`${value.label}.csv`}
                                        className="btn btn-secondary"
                                        target="_blank"
                                    >
                                        Export as CSV
                                    </CSVLink>
                                )}
                            </ButtonGroup>
                        </div>
                        <div className="text-nowrap d-block overflow-auto ">
                            <Table {...getTableProps()} striped bordered hover>
                                <thead>
                                    {headerGroups.map(headerGroup => (
                                        // eslint-disable-next-line react/jsx-key
                                        <tr {...headerGroup.getHeaderGroupProps()}>
                                            {headerGroup.headers.map(column => (
                                                // Add the sorting props to control sorting. For this example
                                                // we can add them into the header props
                                                <th key={column.getHeaderProps(column.getSortByToggleProps()).key}>
                                                    <div {...column.getHeaderProps(column.getSortByToggleProps())}>
                                                        {column.render('Header')}
                                                        {/* Add a sort direction indicator */}
                                                        <span>
                                                            {column.isSorted ? (
                                                                <>
                                                                    {column.isSortedDesc ? (
                                                                        <Icon icon={faSortUp} className="ms-1" />
                                                                    ) : (
                                                                        <Icon icon={faSortDown} className="ms-1" />
                                                                    )}
                                                                </>
                                                            ) : (
                                                                ''
                                                            )}
                                                        </span>
                                                    </div>
                                                    {/* Render the columns filter UI */}
                                                    <div>{column.canFilter ? column.render('Filter') : null}</div>
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody {...getTableBodyProps()}>
                                    {page.map((row, i) => {
                                        prepareRow(row);
                                        return (
                                            // eslint-disable-next-line react/jsx-key
                                            <tr {...row.getRowProps()}>
                                                {row.cells.map(cell => (
                                                    // eslint-disable-next-line react/jsx-key
                                                    <td
                                                        {...cell.getCellProps()}
                                                        onKeyDown={e =>
                                                            e.key === 'Enter' ? handleCellClick(e, cell.value.row, PREDICATES.CSVW_ROWS) : undefined
                                                        }
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={e => handleCellClick(e, cell.value.row, PREDICATES.CSVW_ROWS)}
                                                    >
                                                        {cell.render('Cell')}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                        <Pagination size={!isCSVWModelOpen ? 'sm' : 'md'} aria-label="Page navigation" className="float-start">
                            <PaginationItem title="First page" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                                <PaginationLink first />
                            </PaginationItem>
                            <PaginationItem title="Previous page" onClick={() => previousPage()} disabled={!canPreviousPage}>
                                <PaginationLink previous />
                            </PaginationItem>
                            <PaginationItem active title="Current page">
                                <PaginationLink>
                                    {pageIndex + 1} of {pageOptions.length}
                                </PaginationLink>
                            </PaginationItem>

                            <PaginationItem title="Next page" onClick={() => nextPage()} disabled={!canNextPage}>
                                <PaginationLink next />
                            </PaginationItem>
                            <PaginationItem title="Last page" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                                <PaginationLink last />
                            </PaginationItem>
                        </Pagination>
                        <div className="row">
                            <InputGroup size={!isCSVWModelOpen ? 'sm' : 'md'}>
                                <span className="input-group-text">Go to page:</span>
                                <Input
                                    type="number"
                                    defaultValue={pageIndex + 1}
                                    onChange={e => {
                                        const _page = e.target.value ? Number(e.target.value) - 1 : 0;
                                        gotoPage(_page);
                                    }}
                                />
                                <Input
                                    className="d-inline-block"
                                    type="select"
                                    name="selectMulti"
                                    value={pageSize}
                                    onChange={e => {
                                        setPageSize(Number(e.target.value));
                                    }}
                                >
                                    {[10, 20, 30, 40, 50].map(_pageSize => (
                                        <option key={_pageSize} value={_pageSize}>
                                            Show {_pageSize}
                                        </option>
                                    ))}
                                </Input>
                            </InputGroup>
                        </div>
                    </>
                )}

                {resource.isFetching && (
                    <div className="text-center text-primary mt-4 mb-4">
                        <span style={{ fontSize: 80 }}>
                            <Icon icon={faSpinner} spin />
                        </span>
                        <br />
                        <h2 className="h5">Loading table...</h2>
                    </div>
                )}
                {!resource.isFetching && resource.isFailedFetching && (
                    <div className="text-center text-primary mt-4 mb-4">
                        <Alert color="light">Failed to load dataset, please try again later</Alert>
                    </div>
                )}
            </>
        </ConditionalWrapper>
    );
}

CSVWTable.propTypes = {
    // resource id in the statement browser
    id: PropTypes.string.isRequired,
    toggleModal: PropTypes.func,
};

export default CSVWTable;
