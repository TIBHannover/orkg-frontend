import { useState, useMemo } from 'react';
import {
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
import { getTableByValueId } from 'slices/statementBrowserSlice';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { useSelector, shallowEqual } from 'react-redux';
import { useTable, usePagination, useSortBy, useFilters } from 'react-table';
import { CSVLink } from 'react-csv';
import PropTypes from 'prop-types';

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
    const { lines, cols } = useSelector(state => getTableByValueId(state, props.id), shallowEqual);
    const [dropdownOpen, setDropdownOpen] = useState(false);

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

    const columns = useMemo(
        () =>
            cols.map(c => ({
                Header: c.names?.[0]?.label ?? 'No Label',
                accessor: c.id,
            })),
        [],
    );

    const data = useMemo(
        () =>
            lines.map(r => {
                let values = r.cells.map(c => c?.values?.[0]?.label ?? '') ?? [];
                values = values.map((c, index) => ({
                    [cols[index].id]: c,
                }));
                values = Object.assign({}, ...values);
                return values;
            }),
        [],
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
                    {!resource.isFetching ? (
                        <>
                            <Dropdown className="float-end mb-2" isOpen={dropdownOpen} toggle={() => setDropdownOpen(prevState => !prevState)}>
                                <DropdownToggle color="secondary" size="sm">
                                    <span className="me-2">Options</span> <Icon icon={faEllipsisV} />
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem header>Export</DropdownItem>
                                    {rows.length > 0 ? (
                                        <CSVLink
                                            headers={cols.map(h => ({
                                                label: h.names?.[0]?.label ?? 'No Label',
                                                key: h.id,
                                            }))}
                                            data={data}
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
                            <Table {...getTableProps()} striped bordered className="text-nowrap d-block overflow-auto">
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
                                                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>

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
                                        {[10, 20, 30, 40, 50].map(pageSize => (
                                            <option key={pageSize} value={pageSize}>
                                                Show {pageSize}
                                            </option>
                                        ))}
                                    </Input>
                                </InputGroup>
                            </div>
                        </>
                    ) : (
                        'Loading...'
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
