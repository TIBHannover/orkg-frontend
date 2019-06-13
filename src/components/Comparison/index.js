import React, { Component } from 'react';
import { Container, Button, Table, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Modal, ModalHeader, ModalBody, ListGroup, ListGroupItem, Badge, CustomInput /*Breadcrumb, BreadcrumbItem*/ } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faTimes, faSort } from '@fortawesome/free-solid-svg-icons';
import { CSVLink } from 'react-csv';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from '../../constants/routes.js';
import StatementBrowserDialog from '../StatementBrowser/StatementBrowserDialog';
import Tooltip from '../Utils/Tooltip.js';
import { SortableContainer, SortableElement, sortableHandle } from 'react-sortable-hoc';
import arrayMove from 'array-move';
import dotProp from 'dot-prop-immutable';
import queryString from 'query-string';

// TODO: component is too large, split into smaller componenets 
// There is a lot is styling needed for this table, this it is using a column structure,
// instead of the default HTML row structure
const Row = styled.tr`
    &:last-child td > div {
        border-bottom:2px solid #CFCBCB;
        border-radius:0 0 11px 11px;
    }
`;

const Properties = styled.td`
    padding-right:10px;
    padding:0 10px!important;
    margin:0;
    display: table-cell;
    height:100%;
    width:250px;
`;

const PropertiesInner = styled.div`
    background: #80869B;
    height:100%;
    color:#fff;
    padding:10px;
    border-bottom:2px solid #8B91A5!important;

    &.first {
        border-radius:11px 11px 0 0;
    }

    &.last {
        border-radius:0 0 11px 11px;
    }
`;

const Item = styled.td`
    padding-right:10px;
    padding: 0 10px!important;
    margin:0;
    display: table-cell;
    height:100%;
`;

const ItemInner = styled.div`
    padding:10px 5px;
    border-left:2px solid #CFCBCB;
    border-right:2px solid #CFCBCB;
    border-bottom:2px solid #EDEBEB;
    text-align:center;
    height:100%;
`;

const ItemHeader = styled.td`
    padding-right:10px;
    min-height:50px;
    padding: 0 10px!important;
    margin:0;
    display: table-cell;
    height:100%;
    width:250px;
    position:relative;
`;

const ItemHeaderInner = styled.div`
    padding:5px 10px;
    background:#E86161;
    border-radius:11px 11px 0 0;
    color:#fff;
    height:100%;

    a {
        color:#fff!important;
    }
`;

const Contribution = styled.div`
    color:#FFA5A5;
    font-size:85%;
`;

const Delete = styled.div`
    position:absolute;
    top:-4px;
    right:7px;
    background:#FFA3A3;
    border-radius:20px;
    width:24px;
    height:24px;
    text-align:center;
    color:#E86161;
    cursor:pointer;
`;

const DragHandle = styled.span`
    cursor:move;
    color:#A5A5A5;
    width:30px;
    text-align:center;
`;

const DragHandlePlaceholder = styled.span`
    width:30px;
`;

const ListGroupItemStyled = styled(ListGroupItem)`
    padding: 10px 10px 9px 5px!important;
    display:flex!important;
`;

/*const BreadcrumbStyled = styled(Breadcrumb)`
    .breadcrumb {
        background:transparent;
        border-left: 2px solid #caccd5;
        border-radius: 0;
        margin: 0 0 0 18px;
    }
`;*/

class Comparison extends Component {

    constructor(props) {
        super(props);

        this.state = {
            title: '',
            authorNames: [],
            contributions: [],
            dropdownOpen: false,
            properties: [],
            data: [],
            csvData: [],
            redirect: null,
            modal: false,
            dialogResourceId: null,
            dialogResourceLabel: null,
            showPropertiesDialog: false,
        }

    }

    componentDidMount = () => {
        this.performComparison();
    }

    componentDidUpdate = (prevProps, prevState) => {
        // check if the csv export data needs an update
        if (this.state.properties !== prevState.properties || this.state.contributions !== prevState.contributions || this.state.data !== prevState.data) {
            this.generateMatrixOfComparison();
        }

        if (this.props.match.params !== prevProps.match.params) {
            this.performComparison();
        }
    }

    getContributionIdsFromUrl = () => {
        return this.props.match.params[0].split('/');
    }

    getPropertyIdsFromUrl = () => {
        let ids = queryString.parse(this.props.location.search).properties;
        if (!ids) {
            return [];
        }
        ids = ids.split(',');
        ids = ids.filter(n => n); //filter out empty elements

        return ids;
    }

    generateMatrixOfComparison = () => {
        let header = ['Title'];

        for (let property of this.state.properties) {
            header.push(property.label);
        }

        let rows = [];

        for (let i = 0; i < this.state.contributions.length; i++) {
            let contribution = this.state.contributions[i];
            let row = [contribution.title];

            for (let property of this.state.properties) {
                row.push(this.state.data[property.id][i].label);
            }
            rows.push(row);
        }

        this.setState({
            csvData: [
                header,
                ...rows
            ]
        });
    }

    performComparison = () => {
        const contributionIds = this.getContributionIdsFromUrl();
        const propertyIds = this.getPropertyIdsFromUrl();

        const apiMockingData = {
            contributions:
                [
                    {
                        id: 'R1026',
                        paperId: 'R1022',
                        title: 'Fifth',
                        contributionLabel: 'Contribution 2'
                    },
                    {
                        id: 'R3004',
                        paperId: 'R3000',
                        title: 'Research Directions for the Internet of Things',
                        contributionLabel: 'Contribution 1'
                    },
                    {
                        id: 'R1032',
                        paperId: 'R1028',
                        title: 'Research Directions for the Internet of Things',
                        contributionLabel: 'Contribution 1'
                    },
                ],
            properties:
                [
                    {
                        id: 'P1',
                        label: 'Algorithm',
                        path: 'Approach > Method > ',
                        active: true
                    },
                    {
                        id: 'P2',
                        label: 'Problem',
                        path: 'Approach > ',
                        active: true
                    },
                    {
                        id: 'P3',
                        label: 'Programming language',
                        path: 'Approach > ',
                        active: true
                    },
                    {
                        id: 'P4',
                        label: 'Stable',
                        path: 'Approach > ',
                        active: true
                    },
                    {
                        id: 'P5',
                        label: 'Best complexity',
                        path: 'Approach > ',
                        active: true
                    },
                    {
                        id: 'P6',
                        label: 'Worst complexity',
                        path: 'Approach > ',
                        active: true
                    },
                ],
            data:
            {
                'P1': [
                    {
                        resourceId: 'R1',
                        label: 'Merge sort',
                        type: 'resource'
                    },
                    {
                        resourceId: 'R1',
                        label: 'Heap sort',
                        type: 'resource'
                    },
                    {
                        resourceId: 'R1',
                        label: 'Bubble sort',
                        type: 'resource'
                    },
                ],
                'P2': [
                    {
                        resourceId: 'R1',
                        label: 'Efficient sorting',
                        type: 'resource'
                    },
                    {
                        resourceId: 'R1',
                        label: 'Efficient sorting',
                        type: 'resource'
                    },
                    {
                        resourceId: 'R1',
                        label: 'Sorting',
                        type: 'resource'
                    },
                ],
                'P3': [
                    {
                        resourceId: 'R1',
                        label: 'C++',
                        type: 'resource'
                    },
                    {
                        resourceId: 'R1',
                        label: '',
                        type: 'resource'
                    },
                    {
                        resourceId: 'R1',
                        label: 'Python',
                        type: 'resource'
                    },
                ],
                'P4': [
                    {
                        resourceId: 'R1',
                        label: 'Y',
                        type: 'literal'
                    },
                    {
                        resourceId: 'R1',
                        label: 'N',
                        type: 'literal'
                    },
                    {
                        resourceId: 'R1',
                        label: 'N',
                        type: 'literal'
                    },
                ],
                'P5': [
                    {
                        resourceId: 'R1',
                        label: 'n log n',
                        type: 'literal'
                    },
                    {
                        resourceId: 'R1',
                        label: 'n',
                        type: 'literal'
                    },
                    {
                        resourceId: 'R1',
                        label: 'n',
                        type: 'literal'
                    },
                ],
                'P6': [
                    {
                        resourceId: 'R1',
                        label: 'n log n',
                        type: 'literal'
                    },
                    {
                        resourceId: 'R1',
                        label: 'n log n',
                        type: 'literal'
                    },
                    {
                        resourceId: 'R1',
                        label: 'n log n',
                        type: 'literal'
                    },
                ],
            }
        };

        // mocking function to allow for deletion of contributions via the url
        let contributions = [];
        for (let i = 0; i < apiMockingData.contributions.length; i++) {
            let contribution = apiMockingData.contributions[i];

            if (contributionIds.includes(contribution.id)) {
                contributions.push(contribution)
            }
        }
        
        // if there are properties in the query string 
        if (propertyIds.length > 0) { 

            // sort properties based on query string (is not presented in query string, sort at the bottom)
            apiMockingData.properties.sort(function(a, b) {
                let index1 = propertyIds.indexOf(a.id) !== -1 ? propertyIds.indexOf(a.id) : 1000;
                let index2 = propertyIds.indexOf(b.id) !== -1 ? propertyIds.indexOf(b.id) : 1000;
                return index1 - index2;
                
                //return propertyIds.indexOf(a.id) - propertyIds.indexOf(b.id);
            });

            // hide properties based on query string
            apiMockingData.properties.forEach((property, index) => {
                if (!propertyIds.includes(property.id)) {
                    apiMockingData.properties[index].active = false;
                }
            });
        }
        
        this.setState({
            contributions: contributions,
            properties: apiMockingData.properties,
            data: apiMockingData.data,
        });
    }

    toggle = () => {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    openStatementBrowser = (id, label) => {
        this.setState({
            modal: true,
            dialogResourceId: id,
            dialogResourceLabel: label,
        });
    }

    exportAsCsv = (e) => {
        this.setState({
            dropdownOpen: false,
        })
    }

    removeContribution = (contributionId) => {
        let url = ROUTES.COMPARISON.replace('*', '');
        let contributionIds = this.getContributionIdsFromUrl();
        let index = contributionIds.indexOf(contributionId);

        if (index > -1) {
            contributionIds.splice(index, 1);
        }

        this.props.history.push(url + contributionIds.join('/'));
    }

    toggleModal = () => {
        this.setState(prevState => ({
            modal: !prevState.modal,
        }));
    }

    togglePropertiesDialog = () => {
        this.setState(prevState => ({
            showPropertiesDialog: !prevState.showPropertiesDialog,
        }));
    }

    onSortEnd = ({ oldIndex, newIndex }) => {
        this.setState(({ properties }) => ({
            properties: arrayMove(properties, oldIndex, newIndex),
        }), () => {
            this.propertiesToUrl();
        });
    }

    // TODO: place this outside the component class 
    SortableHandle = sortableHandle(() => (
        <DragHandle>
            <Icon icon={faSort} />
        </DragHandle>
    ));
    
    SortableItem = SortableElement(({ value: property }) => (
        <ListGroupItemStyled>
            {property.active ? <this.SortableHandle /> : <DragHandlePlaceholder />}
            <CustomInput
                type="checkbox"
                id={`checkbox-${property.label}`}
                label={property.label}
                className="flex-grow-1"
                onChange={() => this.toggleProperty(property.id)}
                checked={property.active}
            />
            <Badge color="lightblue">3</Badge>
        </ListGroupItemStyled>
    ));
    
    SortableList = SortableContainer(({ items }) => {
        return (
            <ListGroup>
                {items.map((value, index) => (
                    <this.SortableItem key={`item-${index}`} index={index} value={value} />
                ))}
            </ListGroup>
        );
    });

    // code is a bit ugly because the properties inside an array and not an object
    toggleProperty = (id) => {
        let newState = dotProp.set(this.state, 'properties', properties => {
            properties.forEach((property, index) => {
                if (property.id === id) {
                    properties[index].active = !properties[index].active
                }
            });

            return properties;
        });

        this.setState(newState, () => {
            this.propertiesToUrl();
        });
    }

    propertiesToUrl = () => {
        let queryString = '?properties=';

        this.state.properties.forEach((property, index) => {
            if (property.active) {
                queryString += property.id + ',';
            }
        });

        let url = ROUTES.COMPARISON.replace('*', '');
        let contributionIds = this.getContributionIdsFromUrl().join('/');
        this.props.history.push(url + contributionIds + queryString);
    }

    render() {
        return (
            <div>
                <Container className="p-0 d-flex align-items-center">
                    <h1 className="h4 mt-4 mb-4 ">Contribution comparison</h1>
                    {/* 
                    // Created a breadcrumb so it is possible to navigate back to the original paper (or the first paper)
                    // problem is: when a contribution is performed, the first paper is not the paper from where the contribution started 
                    // So maybe a breadcrumb is not intiutive, therefore it is commented out right now
                    {this.state.contributions[0] &&
                        <BreadcrumbStyled>}
                            <BreadcrumbItem><Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: this.state.contributions[0].paperId })}>Paper</Link></BreadcrumbItem>
                            <BreadcrumbItem active>Comparison</BreadcrumbItem>
                        </BreadcrumbStyled>
                    }*/}
                </Container>

                <Container className="box pt-4 pb-4 pl-5 pr-5 clearfix ">
                    <h2 className="h4 mt-4 mb-3 float-left">
                        Compare: <br />
                        <span className="h6">{this.state.title}</span>
                    </h2>

                    <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                        <DropdownToggle color="darkblue" size="sm" className="float-right mb-4 mt-4 ml-1 pl-3 pr-3" >
                            <Icon icon={faEllipsisV} />
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem onClick={this.togglePropertiesDialog}>Select properties</DropdownItem>
                            {this.state.csvData ?
                                <CSVLink
                                    data={this.state.csvData}
                                    filename={'ORKG Contribution Comparison.csv'}
                                    className="dropdown-item"
                                    target="_blank"
                                    onClick={this.exportAsCsv}
                                >
                                    Export as CSV
                                </CSVLink>
                                : ''}
                        </DropdownMenu>
                    </Dropdown>

                    <Button color="darkblue" className="float-right mb-4 mt-4 " size="sm">Add to comparison</Button>

                    <div style={{ overflowX: 'auto', float: 'left', width: '100%', paddingTop: 10 }}>
                        <Table className="mb-0" style={{ borderCollapse: 'collapse', tableLayout: 'fixed', height: 'max-content', width: '100%' }}>
                            <tbody className="table-borderless">
                                <tr className="table-borderless">
                                    <Properties><PropertiesInner className="first">Properties</PropertiesInner></Properties>

                                    {this.state.contributions.map((contribution, index) => {
                                        return (
                                            <ItemHeader key={`contribution${index}`}>
                                                <ItemHeaderInner>
                                                    <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: contribution.paperId })}>
                                                        {contribution.title}
                                                    </Link>
                                                    <br />
                                                    <Contribution>{contribution.contributionLabel}</Contribution>
                                                </ItemHeaderInner>

                                                {this.state.contributions.length > 2 &&
                                                    <Delete onClick={() => this.removeContribution(contribution.id)}>
                                                        <Icon icon={faTimes} />
                                                    </Delete>}
                                            </ItemHeader>
                                        )
                                    })}
                                </tr>

                                {this.state.properties.map((property, index) => {
                                    if (!property.active) {
                                        return null;
                                    }

                                    return (
                                        <Row key={`row${index}`}>
                                            <Properties>
                                                <PropertiesInner>
                                                    <Tooltip message={property.path} colorIcon={'#606679'}>
                                                        {property.label}
                                                    </Tooltip>
                                                </PropertiesInner>
                                            </Properties>
                                            {this.state.contributions.map((contribution, index2) => {
                                                const data = this.state.data[property.id][index2];

                                                return (
                                                    <Item key={`data${index2}`}>
                                                        <ItemInner>
                                                            {data.type === 'resource' ?
                                                                <span
                                                                    className="btn-link"
                                                                    onClick={() => this.openStatementBrowser(data.resourceId, data.label)}
                                                                    style={{ cursor: 'pointer' }}
                                                                >
                                                                    {data.label}
                                                                </span>
                                                                : data.label}
                                                        </ItemInner>
                                                    </Item>
                                                )
                                            })}
                                        </Row>
                                    )
                                })}
                            </tbody>
                        </Table>
                    </div>
                </Container>

                {this.state.modal &&
                    <StatementBrowserDialog
                        show={this.state.modal}
                        toggleModal={this.toggleModal}
                        resourceId={this.state.dialogResourceId}
                        resourceLabel={this.state.dialogResourceLabel}
                    />
                }

                <Modal isOpen={this.state.showPropertiesDialog} toggle={this.togglePropertiesDialog}>
                    <ModalHeader toggle={this.togglePropertiesDialog}>Select properties</ModalHeader>
                    <ModalBody>
                        <this.SortableList
                            items={this.state.properties}
                            onSortEnd={this.onSortEnd}
                            lockAxis="y"
                            helperClass="sortableHelper"
                            useDragHandle
                        />
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}

Comparison.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            paperId: PropTypes.string,
            comparisonId: PropTypes.string,
        }).isRequired,
    }).isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
}

const mapStateToProps = state => ({
    viewPaper: state.viewPaper,
});

const mapDispatchToProps = dispatch => ({

});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Comparison);