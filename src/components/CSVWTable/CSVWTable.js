import { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Alert,
    Modal,
    ModalHeader,
    ModalBody,
    Table,
    Pagination,
    PaginationItem,
    PaginationLink,
    Input,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    InputGroup,
} from 'reactstrap';
import {
    selectResourceAction as selectResource,
    fetchStatementsForResource,
    getTableByValueId,
    getDepthByValueId,
} from 'slices/statementBrowserSlice';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faEllipsisV, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { useTable, usePagination, useSortBy, useFilters } from 'react-table';
import { CSVLink } from 'react-csv';
import PropTypes from 'prop-types';
import { sortMethod } from 'utils';
import { ENTITIES, PREDICATES } from 'constants/graphSettings';

// Define a default UI for filtering
// eslint-disable-next-line react/prop-types
const DefaultColumnFilter = ({ column: { filterValue, preFilteredRows, setFilter } }) => {
    // eslint-disable-next-line react/prop-types
    const count = preFilteredRows.length;

    return (
        <Input
            bsSize="sm"
            value={filterValue || ''}
            onChange={e => {
                setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
            }}
            placeholder={`Search ${count} records...`}
        />
    );
};

function CSVWTable(props) {
    const value = useSelector(state => state.statementBrowser.values.byId[props.id]);
    const resource = useSelector(state => state.statementBrowser.resources.byId[value.resourceId]);
    const fetchedDepth = useSelector(state => getDepthByValueId(state, props.id));
    const { lines, cols } = useSelector(state => getTableByValueId(state, props.id), shallowEqual);
    const [dropdownOpen, setDropdownOpen] = useState(false);

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

    const defaultColumn = useMemo(
        () => ({
            Filter: DefaultColumnFilter,
        }),
        [],
    );

    const filterTypes = useMemo(
        () => ({
            text: (rows, id, filterValue) =>
                rows.filter(row => {
                    const rowValue = row.values[id].label;
                    return rowValue !== undefined ? String(rowValue).toLowerCase().startsWith(String(filterValue).toLowerCase()) : true;
                }),
        }),
        [],
    );

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
            cols?.map(c => ({
                Header: c.name?.label ?? 'No Label',
                accessor: c.existingResourceId,
                sortType: columnsSortMethod,
                Cell: innerProps => (
                    <span
                        onKeyDown={e => (e.key === 'Enter' ? handleCellClick(e, innerProps?.value, PREDICATES.CSVW_CELLS) : undefined)}
                        role="button"
                        tabIndex={0}
                        onClick={e => handleCellClick(e, innerProps?.value, PREDICATES.CSVW_CELLS)}
                    >
                        {innerProps?.value?.value?.label ?? (
                            <small>
                                <i>N/A</i>
                            </small>
                        )}
                    </span>
                ),
            })) ?? [],
        [resource, lines?.length, cols.length],
    );

    const data = useMemo(
        () =>
            lines?.map(r => {
                let values = r.cells.map(c => c) ?? [];
                values = values.map((c, index) => ({
                    [cols[index].existingResourceId]: c,
                }));
                values.cells = r;
                values = Object.assign({}, ...values);
                return values;
            }) ?? [],
        [resource, lines?.length, cols.length, columns],
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
            defaultColumn,
            filterTypes,
        },
        useFilters,
        useSortBy,
        usePagination,
    );

    const exportAsCsv = e => {
        setDropdownOpen(false);
    };

    return (
        <Modal isOpen={props.show} toggle={props.toggleModal} size="lg" style={{ maxWidth: '90%' }}>
            <ModalHeader toggle={props.toggleModal}>View Tabular Data: {value.label}</ModalHeader>
            <ModalBody>
                <>
                    {!resource.isFetching && !resource.isFailedFetching && (
                        <>
                            <div className="d-flex flex-row-reverse">
                                <Dropdown className="mb-2" isOpen={dropdownOpen} toggle={() => setDropdownOpen(prevState => !prevState)}>
                                    <DropdownToggle color="secondary" size="sm">
                                        <span className="me-2">Options</span> <Icon icon={faEllipsisV} />
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem header>Export</DropdownItem>
                                        {rows.length > 0 ? (
                                            <CSVLink
                                                headers={cols.map(h => ({
                                                    label: h.name?.label ?? 'No Label',
                                                    key: h.existingResourceId,
                                                }))}
                                                data={data?.map(
                                                    c => Object.assign({}, ...Object.keys(c).map(v => ({ [v]: c[v]?.value?.label ?? '' }))) ?? [],
                                                )}
                                                filename={`${value.label}.csv`}
                                                className="dropdown-item"
                                                target="_blank"
                                                onClick={exportAsCsv}
                                            >
                                                Export as CSV
                                            </CSVLink>
                                        ) : (
                                            ''
                                        )}
                                    </DropdownMenu>
                                </Dropdown>
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
                                                                e.key === 'Enter'
                                                                    ? handleCellClick(e, cell.value.row, PREDICATES.CSVW_ROWS)
                                                                    : undefined
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
                            <Pagination aria-label="Page navigation" className="float-start">
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
                                <InputGroup>
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
            </ModalBody>
        </Modal>
    );
}

CSVWTable.propTypes = {
    id: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    toggleModal: PropTypes.func.isRequired,
};

export default CSVWTable;
