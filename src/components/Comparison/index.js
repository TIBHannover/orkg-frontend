import React, { Component } from 'react';
import { Container, Button, Table, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faTimes } from '@fortawesome/free-solid-svg-icons';
import { CSVLink } from 'react-csv';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from '../../constants/routes.js';

// There is a lot is styling needed for this table, this it is using a column structure,
// instead of the default HTML row structure
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
    
    &.last {
        border-bottom:2px solid #CFCBCB;
        border-radius:0 0 11px 11px;
    }
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

class Comparison extends Component {
    state = {
        title: '',
        authorNames: [],
        contributions: [],
        dropdownOpen: false,
        properties: [],
        data: [],
        csvData: [],
        redirect: null,
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
                        label: 'Algorithm'
                    },
                    {
                        id: 'P2',
                        label: 'Problem'
                    },
                    {
                        id: 'P3',
                        label: 'Programming language'
                    },
                    {
                        id: 'P4',
                        label: 'Stable'
                    },
                    {
                        id: 'P5',
                        label: 'Best complexity'
                    },
                    {
                        id: 'P6',
                        label: 'Worst complexity'
                    },
                ],
            data:
            {
                'P1': [
                    {
                        resourceId: 'R1',
                        label: 'Merge sort'
                    },
                    {
                        resourceId: 'R1',
                        label: 'Heap sort'
                    },
                    {
                        resourceId: 'R1',
                        label: 'Bubble sort'
                    },
                ],
                'P2': [
                    {
                        resourceId: 'R1',
                        label: 'Efficient sorting'
                    },
                    {
                        resourceId: 'R1',
                        label: 'Efficient sorting'
                    },
                    {
                        resourceId: 'R1',
                        label: 'Sorting'
                    },
                ],
                'P3': [
                    {
                        resourceId: 'R1',
                        label: 'C++'
                    },
                    {
                        resourceId: 'R1',
                        label: ''
                    },
                    {
                        resourceId: 'R1',
                        label: 'Python'
                    },
                ],
                'P4': [
                    {
                        resourceId: 'R1',
                        label: 'Y'
                    },
                    {
                        resourceId: 'R1',
                        label: 'N'
                    },
                    {
                        resourceId: 'R1',
                        label: 'N'
                    },
                ],
                'P5': [
                    {
                        resourceId: 'R1',
                        label: 'n log n'
                    },
                    {
                        resourceId: 'R1',
                        label: 'n'
                    },
                    {
                        resourceId: 'R1',
                        label: 'n'
                    },
                ],
                'P6': [
                    {
                        resourceId: 'R1',
                        label: 'n log n'
                    },
                    {
                        resourceId: 'R1',
                        label: 'n log n'
                    },
                    {
                        resourceId: 'R1',
                        label: 'n log n'
                    },
                ],
            }
        };

        // mocking function to allow for deletion of contributions via the url
        let contributions = [];
        for (let i = 0; i < apiMockingData.contributions.length; i++) {
            let contribution = apiMockingData.contributions[i];

            if (contributionIds.includes(contribution.id)) {
                //apiMockingData.contributions.splice(i, 1);
                contributions.push(contribution)
            }
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

    render() {
        return (
            <div>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">Contribution comparison</h1>
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
                            <DropdownItem>Select properties</DropdownItem>
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
                                    let className = this.state.properties.length === index + 1 ? 'last' : '';

                                    return (
                                        <tr key={`row${index}`}>
                                            <Properties>
                                                <PropertiesInner className={className}>{property.label}</PropertiesInner>
                                            </Properties>
                                            {this.state.contributions.map((contribution, index2) => {
                                                return (
                                                    <Item key={`data${index2}`}>
                                                        <ItemInner className={className}>{this.state.data[property.id][index2].label}</ItemInner>
                                                    </Item>
                                                )
                                            })}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </Table>
                    </div>
                </Container>
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