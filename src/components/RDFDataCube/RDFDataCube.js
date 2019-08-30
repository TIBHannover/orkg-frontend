import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, Alert, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { getStatementsBySubject, getStatementsByObject, getAllClasses } from '../../network';
import ReactTable from 'react-table';
import CUBE from 'olap-cube';
import 'react-table/react-table.css'
import { CSVLink } from 'react-csv';
import PropTypes from 'prop-types';

class RDFDataCube extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isDatacubeLoading: true,
            isDatacubeFailedLoading: false,
            dropdownOpen: false,
            datacube: {},
            resources: {},
            dimensions: {},
            measures: {},
            attributes: {},
            displayedData: []
        };
    }

    componentDidMount() {
        this.loadDataCube();
    }

    toggleDropdown = () => {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    exportAsCsv = (e) => {
        this.setState({
            dropdownOpen: false,
        })
    }

    loadDataCube = async () => {
        this.setState({ isDatacubeLoading: true });
        let resources = {};
        if (this.props.resourceId) {
            // Get all the classes
            let classes = await getAllClasses();
            // Convert to an object { class_label: class_ID }
            classes = Object.assign({}, ...(classes.map(item => ({ [item.label]: item.id }))));
            // Get Data Structure Definition (DSD)
            let dsd = await getStatementsBySubject(this.props.resourceId).then(s_dataset => s_dataset.find(s => s.object.classes.includes(classes['qb:DataStructureDefinition'])).object)
            // Get Component Specification
            let cspecifications = await getStatementsBySubject(dsd.id).then(s_dataset => s_dataset.filter(s => s.object.classes.includes(classes['qb:ComponentSpecification']))).then(css => css.map(cs => cs.object))
            // Fetch Statements of each component specification
            cspecifications = cspecifications.map((cs) => {
                return getStatementsBySubject(cs.id).then(css => css.map(cs => cs.object))
            })
            Promise.all(cspecifications).then(cso => cso.flat(1)).then(cso => {
                // Get Dimensions and Measures
                let sDimensions = cso.filter(s => s.classes.includes(classes['qb:DimensionProperty']));
                let sMeasures = cso.filter(s => s.classes.includes(classes['qb:MeasureProperty']));
                let sAttributes = cso.filter(s => s.classes.includes(classes['qb:AttributeProperty']));
                sDimensions = Object.assign({}, ...(sDimensions.map(item => ({ [item.id]: item }))));
                sMeasures = Object.assign({}, ...(sMeasures.map(item => ({ [item.id]: item }))));
                sAttributes = Object.assign({}, ...(sAttributes.map(item => ({ [item.id]: item }))));
                return { sMeasures, sDimensions, sAttributes };
            }).then(({ sMeasures, sDimensions, sAttributes }) => {
                // Observations (fetch statements of the dataset ressource by object)
                getStatementsByObject({
                    id: this.props.resourceId,
                    order: 'desc',
                }).then((statements) => {
                    // Filter observations
                    let observations = statements.filter((statement) => (statement.predicate.label === 'dataSet' && statement.subject.classes.includes(classes['qb:Observation'])))
                    // Fetch the data of each observation
                    var observations_data = observations.map((observation) => {
                        return getStatementsBySubject(observation.subject.id).then((observationStatements) => {
                            // Measure
                            let os_m = observationStatements.filter((statement) => statement.predicate.label in sMeasures);
                            // Dimensions
                            let os_d = observationStatements.filter((statement) => statement.predicate.label in sDimensions);
                            // Attributes
                            let os_a = observationStatements.filter((statement) => statement.predicate.label in sAttributes);
                            let ob = {
                                // OLAP table data is in the format data[pointIndex][fieldIndex], sort by predicate label is to keep same order in Table fields
                                data: [...os_m
                                    .sort((first, second) => first.predicate.label > second.predicate.label)
                                    .map(o_m => {
                                        return {
                                            id: observation.subject.id,
                                            rlabel: observation.subject.label,
                                            label: o_m.object.label
                                        }
                                    }
                                    )],
                                point: [ // sort by predicate label because statements are not ordered by default
                                    ...os_d.sort((first, second) => first.predicate.label > second.predicate.label).map(o_d => o_d.object.id),
                                    ...os_a.sort((first, second) => first.predicate.label > second.predicate.label).map(o_a => o_a.object.id)
                                ],
                                point_label: [
                                    ...os_d.map(o_d => { return { id: o_d.object.id, label: o_d.object.label, type: o_d.object._class } }),
                                    ...os_a.map(o_a => { return { id: o_a.object.id, label: o_a.object.label, type: o_a.object._class } })
                                ], // Ressource labels
                            }
                            return ob;
                        })
                    });

                    return Promise.all(observations_data).then((observations) => {
                        const table = new CUBE.model.Table({
                            dimensions: [...Object.keys(sDimensions).sort(), ...Object.keys(sAttributes).sort()],
                            fields: Object.keys(sMeasures).sort(),
                            points: observations.map((o) => o.point),
                            data: observations.map((o) => o.data)
                        })

                        //const onlyFebruary = (point) => point[2] === 'R1415'
                        //table = table.dice(onlyFebruary)
                        // Ressoruces labels
                        resources = Object.assign({}, ...(observations.map((o) => o.point_label).flat(1).map(item => ({ [item.id]: item }))))
                        this.setState({ measures: sMeasures, dimensions: sDimensions, attributes: sAttributes, datacube: table, resources: resources, isDatacubeLoading: false, isDatacubeFailedLoading: false });
                    })
                });
            }).catch(e => {
                console.log(e);
                this.setState({ isDatacubeLoading: false, isDatacubeFailedLoading: true });
            });
        };
    }


    label2Resource = (resource) => {
        if ((typeof resource === 'string' || resource instanceof String) && resource in this.state.resources) {
            return this.state.resources[resource]
        } else if (typeof resource === 'object' && resource !== null) {
            return resource
        } else {
            return { id: resource, label: resource, rlabel: resource }
        }
    }

    handleCellClick = (ressource) => {
        if (ressource.type !== 'literal') {
            this.props.handleResourceClick(ressource)
            this.props.toggleModal();
        }
    }

    render() {

        let columns = {}
        if (!this.state.isDatacubeLoading) {
            columns = { ...this.state.measures, ...this.state.dimensions, ...this.state.attributes }
        }

        return (
            <Modal isOpen={this.props.show} toggle={this.props.toggleModal} size="lg" style={{ maxWidth: '90%' }}>
                <ModalHeader toggle={this.props.toggleModal}>View dataset: {this.props.resourceLabel}</ModalHeader>
                <ModalBody>

                    {!this.state.isDatacubeLoading && (
                        <>
                            <ReactTable
                                defaultPageSize={10}
                                filterable={true}
                                className="-striped -highlight"
                                defaultFilterMethod={(filter, row) => { return String(row[filter.id].label).startsWith(filter.value) }}
                                data={
                                    this.state.datacube.rows.map(r => {
                                        let a = Object.assign({}, ...this.state.datacube.header.map((n, index) => ({ [n]: this.label2Resource(r[index]) })))
                                        return a
                                    })
                                }
                                columns={
                                    this.state.datacube.header.map(h => {
                                        return {
                                            id: h,
                                            Header: columns[h].label,
                                            accessor: h,
                                            Cell: props => <span onClick={() => this.handleCellClick(props.value)}>{props.value.label}</span>, // Custom cell components!
                                            Filter: ({ filter, onChange }) => (
                                                <input
                                                    type="text"
                                                    style={{ 'width': '100%' }}
                                                    placeholder="Search..."
                                                    value={filter ? filter.value : ''}
                                                    onChange={event => onChange(event.target.value)}
                                                />
                                            )
                                        }
                                    })}
                            >
                                {(state, makeTable, instance) => {
                                    return (
                                        <>
                                            <div className="clearfix">
                                                {`Showing ${state.sortedData.length} observations ${state.sortedData.length !== this.state.datacube.rows.length ? `(filtered from ${this.state.datacube.rows.length} total observations)` : ''} :`}
                                                <Dropdown className="float-right mb-2" isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown}>
                                                    <DropdownToggle color="darkblue" size="sm">
                                                        <span className="mr-2">Options</span> <Icon icon={faEllipsisV} />
                                                    </DropdownToggle>
                                                    <DropdownMenu>
                                                        <DropdownItem header>Export</DropdownItem>
                                                        {state.sortedData.length > 0 ?
                                                            <CSVLink
                                                                headers={
                                                                    this.state.datacube.header.map(h => { return { label: columns[h].label, key: h + '.label' } })
                                                                }
                                                                data={state.sortedData}
                                                                filename={this.props.resourceLabel + '.csv'}
                                                                className="dropdown-item"
                                                                target="_blank"
                                                                onClick={this.exportAsCsv}
                                                            >
                                                                Export as CSV
                                                            </CSVLink>
                                                            : ''}
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </div>
                                            {makeTable()}
                                        </>);
                                }}
                            </ReactTable>
                        </>
                    )}
                    {this.state.isDatacubeLoading && (
                        <div className="text-center text-primary mt-4 mb-4">
                            <span style={{ fontSize: 80 }}>
                                <Icon icon={faSpinner} spin />
                            </span>
                            <br />
                            <h2 className="h5">Loading dataset...</h2>
                        </div>
                    )}
                    {!this.state.isDatacubeLoading && this.state.isDatacubeFailedLoading && (
                        <div className="text-center text-primary mt-4 mb-4">
                            <Alert color="light">Failed to load dataset, please try again later</Alert>
                        </div>
                    )}
                </ModalBody>
            </Modal>
        );
    }
}

RDFDataCube.propTypes = {
    resourceLabel: PropTypes.string.isRequired,
    resourceId: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    toggleModal: PropTypes.func.isRequired,
    handleResourceClick: PropTypes.func.isRequired,
}


export default (RDFDataCube);