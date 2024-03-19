import { faExpand, faSortDown, faSortUp, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import useTableData from 'components/ViewPaperVersion/ContributionsVersion/hooks/useTableData';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import PropTypes from 'prop-types';
import { useCallback, useMemo, useState } from 'react';
import { CSVLink } from 'react-csv';
import { usePagination, useSortBy, useTable } from 'react-table';
import { Button, ButtonGroup, Input, InputGroup, Modal, ModalBody, ModalHeader, Pagination, PaginationItem, PaginationLink, Table } from 'reactstrap';
import { sortMethod } from 'utils';

function CSVWTable(props) {
    const { cols, lines, isTitlesColumnsExist, value, isLoading } = useTableData({
        id: props.id,
        paperStatements: props.paperStatements,
    });
    const columnsSortMethod = useCallback((rowA, rowB, id, desc) => sortMethod(rowA.original[id].value?.label, rowB.original[id].value?.label), []);
    const [isCSVWModelOpen, setIsCSVWModelOpen] = useState(false);

    const toggleModal = () => {
        setIsCSVWModelOpen((v) => !v);
    };

    const columns = useMemo(
        () =>
            cols?.map((c, index) => ({
                Header: c.titles?.label ?? 'No Label',
                accessor: c.id,
                sortType: columnsSortMethod,
                disableFilters: isTitlesColumnsExist && index === 0,
                Cell: (innerProps) => (
                    <span>
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
            lines?.map((r) => {
                let values = r.cells.map((c) => c) ?? [];
                values = values.map((c, index) => ({
                    [cols[!isTitlesColumnsExist ? index : index + 1].id]: c,
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
        page,
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

    return (
        <ConditionalWrapper
            condition={isCSVWModelOpen}
            wrapper={(children) => (
                <Modal fade={false} fullscreen isOpen={isCSVWModelOpen} toggle={toggleModal} size="lg">
                    <ModalHeader toggle={toggleModal}>View Tabular Data: {value.label}</ModalHeader>
                    <ModalBody>{children} </ModalBody>
                </Modal>
            )}
        >
            <>
                {!isLoading && (
                    <>
                        <div className="d-flex justify-content-end">
                            <ButtonGroup className="mb-3" size="sm">
                                <Button style={{ marginRight: '2px' }} size="sm" onClick={toggleModal}>
                                    <Icon icon={faExpand} className="me-1" /> {isCSVWModelOpen ? 'Close full screen' : 'Full screen'}
                                </Button>
                                {rows?.length > 0 && (
                                    <CSVLink
                                        headers={cols.map((h) => ({
                                            label: h.titles?.label ?? 'No Label',
                                            key: h.id,
                                        }))}
                                        data={data?.map(
                                            (c) => Object.assign({}, ...Object.keys(c).map((v) => ({ [v]: c[v]?.value?.label ?? '' }))) ?? [],
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
                                    {headerGroups.map((headerGroup) => (
                                        // eslint-disable-next-line react/jsx-key
                                        <tr {...headerGroup.getHeaderGroupProps()}>
                                            {headerGroup.headers.map((column) => (
                                                <th key={column.getHeaderProps(column.getSortByToggleProps()).key}>
                                                    <div {...column.getHeaderProps(column.getSortByToggleProps())}>
                                                        {column.render('Header')}
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
                                                {row.cells.map((cell) => (
                                                    // eslint-disable-next-line react/jsx-key
                                                    <td {...cell.getCellProps()}> {cell.render('Cell')} </td>
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
                                <span className="input-group-text">Page</span>
                                <Input
                                    type="number"
                                    defaultValue={pageIndex + 1}
                                    onChange={(e) => {
                                        const _page = e.target.value ? Number(e.target.value) - 1 : 0;
                                        gotoPage(_page);
                                    }}
                                />
                                <Input
                                    className="d-inline-block"
                                    type="select"
                                    name="selectMulti"
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                    }}
                                >
                                    {[10, 20, 30, 40, 50].map((_pageSize) => (
                                        <option key={_pageSize} value={_pageSize}>
                                            Show {_pageSize}
                                        </option>
                                    ))}
                                </Input>
                            </InputGroup>
                        </div>
                    </>
                )}

                {isLoading && (
                    <div className="text-center text-primary mt-4 mb-4">
                        <span style={{ fontSize: 80 }}>
                            <Icon icon={faSpinner} spin />
                        </span>
                        <br />
                        <h2 className="h5">Loading table...</h2>
                    </div>
                )}
            </>
        </ConditionalWrapper>
    );
}

CSVWTable.propTypes = {
    id: PropTypes.string.isRequired,
    paperStatements: PropTypes.array,
};

export default CSVWTable;
