import React, { Component } from 'react';
import { Container, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { CSVLink } from 'react-csv';
import ROUTES from '../../constants/routes.js';
import arrayMove from 'array-move';
import dotProp from 'dot-prop-immutable';
import queryString from 'query-string';
import SelectProperties from './SelectProperties.js';
import Share from './Share.js';
import GeneratePdf from './GeneratePdf.js';
import { submitGetRequest, comparisonUrl } from '../../network';
import ComparisonTable from './ComparisonTable.js';
import ComparisonLoadingComponent from './ComparisonLoadingComponent';
import NotFound from '../StaticPages/NotFound';
import ExportToLatex from './ExportToLatex.js';

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
            transpose: false,
            title: '',
            authorNames: [],
            contributions: [],
            dropdownOpen: false,
            properties: [],
            data: {},
            csvData: [],
            showPropertiesDialog: false,
            showShareDialog: false,
            showLatexDialog: false,
            isLoading: false,
            loading_failed: false,
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

        // perform comparison again when contribution ids are removed 
        if (this.props.match.params[0] && this.props.match.params[0].length !== prevProps.match.params[0].length) {
            this.performComparison();
        }
    }

    getContributionIdsFromUrl = () => {
        let ids = this.props.match.params[0];

        if (!ids) {
            return [];
        }

        return ids.split('/');
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

    getTransposeOptionFromUrl = () => {
        let transpose = queryString.parse(this.props.location.search).transpose;
        if (!transpose || !['true', '1'].includes(transpose)) {
            return false;
        }
        return true;
    }

    generateMatrixOfComparison = () => {
        let header = ['Title'];

        for (let property of this.state.properties) {
            if (property.active) {
            header.push(property.label);
        }
        }

        let rows = [];

        for (let i = 0; i < this.state.contributions.length; i++) {
            let contribution = this.state.contributions[i];
            let row = [contribution.title];

            for (let property of this.state.properties) {
                if (property.active) {
                let value = '';
                if (this.state.data[property.id]) {
                    for (let entry of this.state.data[property.id][i]) {
                        value += entry.label
                    }
                    row.push(value);
                }
            }
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
        this.setState({
            isLoading: true
        });

        const contributionIds = this.getContributionIdsFromUrl();
        submitGetRequest(`${comparisonUrl}${contributionIds.join('/')}`).then((comparisonData) => {
            // mocking function to allow for deletion of contributions via the url
            let contributions = [];
            for (let i = 0; i < comparisonData.contributions.length; i++) {
                let contribution = comparisonData.contributions[i];

                if (contributionIds.includes(contribution.id)) {
                    contributions.push(contribution)
                }
            }

            const propertyIds = this.getPropertyIdsFromUrl();

            // if there are properties in the query string 
            if (propertyIds.length > 0) {

                // sort properties based on query string (is not presented in query string, sort at the bottom)
                // TODO: sort by label when is not active
                comparisonData.properties.sort((a, b) => {
                    let index1 = propertyIds.indexOf(a.id) !== -1 ? propertyIds.indexOf(a.id) : 1000;
                    let index2 = propertyIds.indexOf(b.id) !== -1 ? propertyIds.indexOf(b.id) : 1000;
                    return index1 - index2;
                });
                // hide properties based on query string
                comparisonData.properties.forEach((property, index) => {
                    if (!propertyIds.includes(property.id)) {
                        comparisonData.properties[index].active = false;
                    } else {
                        comparisonData.properties[index].active = true;
                    }
                });
            } else {
                //no properties ids in the url, but the ones from the api still need to be sorted
                comparisonData.properties.sort((a, b) => {
                    if (a.active === b.active) {
                        return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
                    } else {
                        return !a.active ? 1 : -1;
                    }
                });
            }

            this.setState({
                contributions: contributions,
                properties: comparisonData.properties,
                data: comparisonData.data,
                transpose: this.getTransposeOptionFromUrl(),
                isLoading: false,
            });
        }).catch((error) => {
            this.setState({
                loading_failed: true,
                isLoading: false,
            });
        });


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

    removeContribution = (contributionId) => {
        let contributionIds = this.getContributionIdsFromUrl();
        let index = contributionIds.indexOf(contributionId);

        if (index > -1) {
            contributionIds.splice(index, 1);
        }

        this.generateUrl(contributionIds.join('/'));
    }

    toggle = (type) => {
        this.setState(prevState => ({
            [type]: !prevState[type],
        }));
    }

    onSortEnd = ({ oldIndex, newIndex }) => {
        this.setState(({ properties }) => ({
            properties: arrayMove(properties, oldIndex, newIndex),
        }), () => {
            this.generateUrl();
        });
    }

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
            this.generateMatrixOfComparison();
            this.generateUrl();
        });
    }

    toggleTranpose = () => {
        this.setState(prevState => ({
            'transpose': !prevState.transpose,
        }), () => {
            this.generateUrl();
        });
    }

    propertiesToQueryString = () => {
        let queryString = '';

        this.state.properties.forEach((property, index) => {
            if (property.active) {
                queryString += property.id + ',';
            }
        });
        queryString = queryString.slice(0, -1);

        return queryString;
    }

    generateUrl = (contributionIds, propertyIds, transpose) => {
        if (!contributionIds) {
            contributionIds = this.getContributionIdsFromUrl().join('/');
        }
        if (!propertyIds) {
            propertyIds = this.propertiesToQueryString();
        }
        if (!transpose) {
            transpose = this.state.transpose;
        }
        let url = ROUTES.COMPARISON.replace('*', '');
        this.props.history.push(url + contributionIds + '?properties=' + propertyIds + '&transpose=' + transpose);
    }

    render() {
        const contributionAmount = this.getContributionIdsFromUrl().length;

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
                    {!this.state.isLoading && this.state.loading_failed && (
                        <NotFound />
                    )}
                    {!this.state.loading_failed && (
                        <>
                            <h2 className="h4 mt-4 mb-3 float-left">
                                Compare<br />
                                <span className="h6">{this.state.title}</span>
                            </h2>

                            {contributionAmount > 1 ?
                                !this.state.isLoading ? (
                                    <div>
                                        <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown}>
                                            <DropdownToggle color="darkblue" size="sm" className="float-right mb-4 mt-4 ml-1 pl-3 pr-3" >
                                                <span className="mr-2">Options</span> <Icon icon={faEllipsisV} />
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                <DropdownItem onClick={() => this.toggle('showPropertiesDialog')}>Select properties</DropdownItem>
                                                <DropdownItem divider />
                                                <DropdownItem onClick={() => this.toggleTranpose()}>Transpose table</DropdownItem>
                                                <DropdownItem divider />
                                                <DropdownItem onClick={() => this.toggle('showShareDialog')}>Share link</DropdownItem>
                                                <DropdownItem divider />
                                                <DropdownItem onClick={() => this.toggle('showLatexDialog')}>Export as LaTeX</DropdownItem>
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
                                                <GeneratePdf id="comparisonTable" />
                                            </DropdownMenu>
                                        </Dropdown>

                                        {/*<Button color="darkblue" className="float-right mb-4 mt-4 " size="sm">Add to comparison</Button>*/}

                                        <ComparisonTable
                                            data={this.state.data}
                                            properties={this.state.properties}
                                            contributions={this.state.contributions}
                                            removeContribution={this.removeContribution}
                                            transpose={this.state.transpose}
                                        />
                                    </div>)
                                    :
                                    <ComparisonLoadingComponent />
                                :
                                <>
                                    <div className="clearfix" />
                                    <Alert color="info">Please select a minimum of two research contributions to compare on</Alert>
                                </>}
                        </>
                    )}
                </Container>

                <SelectProperties
                    properties={this.state.properties}
                    showPropertiesDialog={this.state.showPropertiesDialog}
                    togglePropertiesDialog={() => this.toggle('showPropertiesDialog')}
                    generateUrl={this.generateUrl}
                    toggleProperty={this.toggleProperty}
                    onSortEnd={this.onSortEnd}
                />

                <Share
                    showDialog={this.state.showShareDialog}
                    toggle={() => this.toggle('showShareDialog')}
                    url={window.location.href}
                />

                <ExportToLatex 
                    data={this.state.csvData} 
                    contributions={this.state.contributions}
                    showDialog={this.state.showLatexDialog}
                    toggle={() => this.toggle('showLatexDialog')}
                    transpose={this.state.transpose}
                />
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

export default connect(
    mapStateToProps
)(Comparison);