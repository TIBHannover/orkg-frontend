import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Modal,
    ModalHeader,
    ModalBody,
    Alert,
    Table,
    Pagination,
    PaginationItem,
    PaginationLink,
    Input,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    InputGroupAddon,
    InputGroup
} from 'reactstrap';
import { selectResource, fetchStatementsForResource, createResource } from 'actions/statementBrowser';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faEllipsisV, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { getStatementsBySubject, getStatementsByObject } from 'services/backend/statements';
import { getClasses } from 'services/backend/classes';
import { useDispatch, useSelector } from 'react-redux';
import { useTable, usePagination, useSortBy, useFilters } from 'react-table';
import { sortMethod } from 'utils';
import CUBE from 'olap-cube';
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

const RDFDataCube = props => {
    const [isDataCubeLoading, setIsDataCubeLoading] = useState(true);
    const [isDataCubeFailedLoading, setIsDataCubeFailedLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dataCube, setDataCube] = useState({});
    const [resources, setResources] = useState({});
    const [dimensions, setDimensions] = useState({});
    const [measures, setMeasures] = useState({});
    const [attributes, setAttributes] = useState({});
    const value = useSelector(state => state.statementBrowser.values.byId[props.id]);
    const resource = useSelector(state => state.statementBrowser.resources.byId[value.resourceId]);
    const property = useSelector(state => state.statementBrowser.properties.byId[resource.propertyId]);
    const existingResourceId = resource.existingResourceId;
    const dispatch = useDispatch();

    const handleResourceClick = r => {
        dispatch(
            createResource({
                label: r.rlabel ? r.rlabel : r.label,
                existingResourceId: r.id,
                resourceId: r.id
            })
        );

        dispatch(
            selectResource({
                increaseLevel: true,
                resourceId: r.id,
                label: r.rlabel ? r.rlabel : r.label,
                propertyLabel: property?.label
            })
        );

        dispatch(
            fetchStatementsForResource({
                resourceId: r.id
            })
        );
    };

    useEffect(() => {
        loadDataCube();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const data = useMemo(() => {
        const label2Resource = r => {
            if ((typeof r === 'string' || r instanceof String) && r in resources) {
                return resources[r];
            } else if (typeof r === 'object' && r !== null) {
                return r;
            } else {
                return { id: r, label: r, rlabel: r };
            }
        };
        return !isDataCubeLoading && !isDataCubeFailedLoading
            ? dataCube.rows.map(r => {
                  const a = Object.assign({}, ...dataCube.header.map((n, index) => ({ [n]: label2Resource(r[index]) })));
                  return a;
              })
            : [];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDataCubeFailedLoading, isDataCubeLoading]);

    const columnsSortMethod = useCallback((rowA, rowB, id, desc) => {
        return sortMethod(rowA.original[id].label, rowB.original[id].label);
    }, []);

    const columns = useMemo(() => {
        const handleCellClick = r => {
            if (r.type !== 'literal') {
                handleResourceClick(r);
                props.toggleModal();
            }
        };

        return !isDataCubeLoading && !isDataCubeFailedLoading
            ? dataCube.header.map(h => {
                  return {
                      id: h,
                      Header: { ...measures, ...dimensions, ...attributes }[h].label,
                      accessor: h,
                      sortType: columnsSortMethod,
                      filter: 'text',
                      Cell: innerProps => (
                          <span
                              onKeyDown={e => (e.keyCode === 13 ? handleCellClick(innerProps.value) : undefined)}
                              role="button"
                              tabIndex={0}
                              onClick={() => handleCellClick(innerProps.value)}
                          >
                              {innerProps.value.label}
                          </span>
                      )
                  };
              })
            : [];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDataCubeFailedLoading, isDataCubeLoading]);

    const defaultColumn = useMemo(
        () => ({
            Filter: DefaultColumnFilter
        }),
        []
    );

    const filterTypes = useMemo(
        () => ({
            text: (rows, id, filterValue) => {
                return rows.filter(row => {
                    const rowValue = row.values[id].label;
                    return rowValue !== undefined
                        ? String(rowValue)
                              .toLowerCase()
                              .startsWith(String(filterValue).toLowerCase())
                        : true;
                });
            }
        }),
        []
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
        state: { pageIndex, pageSize }
    } = useTable(
        {
            columns,
            data,
            initialState: {
                pageIndex: 0,
                sortBy:
                    dataCube?.header?.length > 0
                        ? [
                              {
                                  id: dataCube.header[0],
                                  desc: false
                              }
                          ]
                        : []
            },
            defaultColumn,
            filterTypes
        },
        useFilters,
        useSortBy,
        usePagination
    );

    const toggleDropdown = () => {
        setDropdownOpen(prevState => !prevState);
    };

    const exportAsCsv = e => {
        setDropdownOpen(false);
    };

    const loadDataCube = async () => {
        setIsDataCubeLoading(true);
        let resources = {};
        if (existingResourceId) {
            // Get all the classes
            let classes = await getClasses({ q: 'qb:', returnContent: true });
            // Convert to an object { class_label: class_ID }
            classes = Object.assign({}, ...classes.map(item => ({ [item.label]: item.id })));
            // Get Data Structure Definition (DSD)
            const dsd = await getStatementsBySubject({ id: existingResourceId }).then(
                s_dataset => s_dataset.find(s => s.object.classes && s.object.classes.includes(classes['qb:DataStructureDefinition'])).object
            );
            // Get Component Specification
            let cSpecifications = await getStatementsBySubject({ id: dsd.id })
                .then(s_dataset => s_dataset.filter(s => s.object.classes && s.object.classes.includes(classes['qb:ComponentSpecification'])))
                .then(css => css.map(cs => cs.object));
            // Fetch Statements of each component specification
            cSpecifications = cSpecifications.map(cs => {
                return getStatementsBySubject({ id: cs.id }).then(css => {
                    // Get order of component specification
                    let order = css.filter(statement => statement.predicate.label === 'order');
                    if (order.length > 0) {
                        order = order[0].object.label;
                    } else {
                        order = css[0].subject.id;
                    }
                    css = css.map(cs => ({ ...cs.object, order: order }));
                    return css;
                });
            });
            Promise.all(cSpecifications)
                .then(cso => cso.flat(1))
                .then(cso => {
                    // Get Dimensions and Measures
                    let sDimensions = cso.filter(s => s.classes && s.classes.includes(classes['qb:DimensionProperty']));
                    let sMeasures = cso.filter(s => s.classes && s.classes.includes(classes['qb:MeasureProperty']));
                    let sAttributes = cso.filter(s => s.classes && s.classes.includes(classes['qb:AttributeProperty']));
                    sDimensions = Object.assign({}, ...sDimensions.map(item => ({ [item.id]: item })));
                    sMeasures = Object.assign({}, ...sMeasures.map(item => ({ [item.id]: item })));
                    sAttributes = Object.assign({}, ...sAttributes.map(item => ({ [item.id]: item })));
                    return { sMeasures, sDimensions, sAttributes };
                })
                .then(({ sMeasures, sDimensions, sAttributes }) => {
                    // Observations (fetch statements of the dataset resource by object)
                    const allDim = Object.assign({}, sDimensions, sMeasures, sAttributes);
                    getStatementsByObject({
                        id: existingResourceId,
                        items: 9999,
                        sortBy: 'created_at',
                        desc: true
                    }).then(statements => {
                        // Filter observations
                        const observations = statements.filter(
                            statement =>
                                statement.predicate.label.toLowerCase() === 'dataset' && statement.subject.classes.includes(classes['qb:Observation'])
                        );
                        // Fetch the data of each observation todo : check for const correctness
                        const observations_data = observations.map(observation => {
                            return getStatementsBySubject({ id: observation.subject.id }).then(observationStatements => {
                                // Measure
                                const os_m = observationStatements.filter(statement => statement.predicate.label in sMeasures);
                                // Dimensions
                                const os_d = observationStatements.filter(statement => statement.predicate.label in sDimensions);
                                // Attributes
                                const os_a = observationStatements.filter(statement => statement.predicate.label in sAttributes);
                                const ob = {
                                    // OLAP table data is in the format data[pointIndex][fieldIndex], sort by order or predicate label is to keep same order in Table fields
                                    data: [
                                        ...os_m
                                            .sort((first, second) =>
                                                sortMethod(allDim[first.predicate.label].order, allDim[second.predicate.label].order)
                                            )
                                            .map(o_m => {
                                                return {
                                                    id: observation.subject.id,
                                                    rlabel: observation.subject.label,
                                                    label: o_m.object.label
                                                };
                                            })
                                    ],
                                    point: [
                                        // sort by order or predicate label because statements are not ordered by default
                                        ...os_d
                                            .sort((first, second) =>
                                                sortMethod(allDim[first.predicate.label].order, allDim[second.predicate.label].order)
                                            )
                                            .map(o_d => o_d.object.id),
                                        ...os_a
                                            .sort((first, second) =>
                                                sortMethod(allDim[first.predicate.label].order, allDim[second.predicate.label].order)
                                            )
                                            .map(o_a => o_a.object.id)
                                    ],
                                    point_label: [
                                        ...os_d.map(o_d => {
                                            return { id: o_d.object.id, label: o_d.object.label, type: o_d.object._class };
                                        }),
                                        ...os_a.map(o_a => {
                                            return { id: o_a.object.id, label: o_a.object.label, type: o_a.object._class };
                                        })
                                    ] // Resource labels
                                };
                                return ob;
                            });
                        });

                        return Promise.all(observations_data).then(observations => {
                            try {
                                const table = new CUBE.model.Table({
                                    dimensions: [
                                        ...Object.keys(sDimensions).sort((first, second) => sortMethod(allDim[first].order, allDim[second].order)),
                                        ...Object.keys(sAttributes).sort((first, second) => sortMethod(allDim[first].order, allDim[second].order))
                                    ],
                                    fields: Object.keys(sMeasures).sort((first, second) => sortMethod(allDim[first].order, allDim[second].order)),
                                    points: observations.map(o => o.point),
                                    data: observations.map(o => o.data)
                                });
                                //const onlyFebruary = (point) => point[2] === 'R1415'
                                //table = table.dice(onlyFebruary)
                                // Resources labels
                                resources = Object.assign(
                                    {},
                                    ...observations
                                        .map(o => o.point_label)
                                        .flat(1)
                                        .map(item => ({ [item.id]: item }))
                                );

                                setMeasures(sMeasures);
                                setDimensions(sDimensions);
                                setAttributes(sAttributes);
                                setDataCube(table);
                                setResources(resources);
                                setIsDataCubeLoading(false);
                                setIsDataCubeFailedLoading(false);
                            } catch (error) {
                                console.log(error);
                                setIsDataCubeLoading(false);
                                setIsDataCubeFailedLoading(true);
                            }
                        });
                    });
                })
                .catch(e => {
                    console.log(e);
                    setIsDataCubeLoading(false);
                    setIsDataCubeFailedLoading(true);
                });
        }
    };

    return (
        <Modal isOpen={props.show} toggle={props.toggleModal} size="lg" style={{ maxWidth: '90%' }}>
            <ModalHeader toggle={props.toggleModal}>View dataset: {value.label}</ModalHeader>
            <ModalBody>
                {!isDataCubeLoading && !isDataCubeFailedLoading && (
                    <>
                        {!isDataCubeLoading && !isDataCubeFailedLoading && (
                            <>
                                <Dropdown className="float-right mb-2" isOpen={dropdownOpen} toggle={toggleDropdown}>
                                    <DropdownToggle color="secondary" size="sm">
                                        <span className="mr-2">Options</span> <Icon icon={faEllipsisV} />
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem header>Export</DropdownItem>
                                        {rows.length > 0 ? (
                                            <CSVLink
                                                headers={dataCube.header.map(h => {
                                                    return { label: { ...measures, ...dimensions, ...attributes }[h].label, key: h + '.label' };
                                                })}
                                                data={rows.map(r => r.values)}
                                                filename={value.label + '.csv'}
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
                                <Table {...getTableProps()} striped bordered>
                                    <thead>
                                        {headerGroups.map(headerGroup => (
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
                                                                    column.isSortedDesc ? (
                                                                        <Icon icon={faSortUp} className="ml-1" />
                                                                    ) : (
                                                                        <Icon icon={faSortDown} className="ml-1" />
                                                                    )
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
                                                <tr {...row.getRowProps()}>
                                                    {row.cells.map(cell => {
                                                        return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>

                                <Pagination aria-label="Page navigation" className="float-left">
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

                                <div className=" d-flex">
                                    <InputGroup className="col-2">
                                        <InputGroupAddon addonType="prepend">Go to page:</InputGroupAddon>
                                        <Input
                                            type="number"
                                            defaultValue={pageIndex + 1}
                                            onChange={e => {
                                                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                                                gotoPage(page);
                                            }}
                                            style={{ width: '100px' }}
                                        />
                                    </InputGroup>
                                    <Input
                                        className="d-inline-block col-1"
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
                                </div>
                            </>
                        )}
                    </>
                )}
                {isDataCubeLoading && (
                    <div className="text-center text-primary mt-4 mb-4">
                        <span style={{ fontSize: 80 }}>
                            <Icon icon={faSpinner} spin />
                        </span>
                        <br />
                        <h2 className="h5">Loading dataset...</h2>
                    </div>
                )}
                {!isDataCubeLoading && isDataCubeFailedLoading && (
                    <div className="text-center text-primary mt-4 mb-4">
                        <Alert color="light">Failed to load dataset, please try again later</Alert>
                    </div>
                )}
            </ModalBody>
        </Modal>
    );
};

RDFDataCube.propTypes = {
    id: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    toggleModal: PropTypes.func.isRequired
};

export default RDFDataCube;
