import { Alert, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import React, { Component } from 'react';
import { comparisonUrl, submitGetRequest } from '../../network';

import { CSVLink } from 'react-csv';
import ComparisonLoadingComponent from './ComparisonLoadingComponent';
import ComparisonTable from './ComparisonTable.js';
import ExportToLatex from './ExportToLatex.js';
import GeneratePdf from './GeneratePdf.js';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import ROUTES from '../../constants/routes.js';
import SelectProperties from './SelectProperties.js';
import Share from './Share.js';
import arrayMove from 'array-move';
import { connect } from 'react-redux';
import dotProp from 'dot-prop-immutable';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import queryString from 'query-string';

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
            response_hash: null,
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
            loadingFailed: false
        };
    }

    componentDidMount = () => {
        this.performComparison();
        document.title = 'Comparison - ORKG';
    };

    componentDidUpdate = (prevProps, prevState) => {
        // check if the csv export data needs an update
        if (
            this.state.properties !== prevState.properties ||
            this.state.contributions !== prevState.contributions ||
            this.state.data !== prevState.data
        ) {
            this.generateMatrixOfComparison();
        }

        const prevContributions = this.getContributionIdsFromUrl(prevProps.location);
        const currentContributions = this.getContributionIdsFromUrl(this.props.location);
        // perform comparison again when contribution ids are removed
        if (prevContributions.length !== currentContributions.length || !currentContributions.every(e => prevContributions.includes(e))) {
            this.performComparison();
        }
    };

    getContributionIdsFromUrl = location => {
        let ids = queryString.parse(location.search, { arrayFormat: 'comma' }).contributions;
        if (!ids) {
            return [];
        }
        if (typeof ids === 'string' || ids instanceof String) {
            return [ids];
        }
        ids = ids.filter(n => n); //filter out empty element ids
        return ids;
    };

    getPropertyIdsFromUrl = () => {
        let ids = queryString.parse(this.props.location.search).properties;

        if (!ids) {
            return [];
        }
        ids = ids.split(',');
        ids = ids.filter(n => n); //filter out empty elements

        return ids;
    };

    getTransposeOptionFromUrl = () => {
        const transpose = queryString.parse(this.props.location.search).transpose;
        if (!transpose || !['true', '1'].includes(transpose)) {
            return false;
        }
        return true;
    };

    getResonseHashFromUrl = () => {
        const response_hash = queryString.parse(this.props.location.search).response_hash;
        if (response_hash) {
            return response_hash;
        }
        return null;
    };

    generateMatrixOfComparison = () => {
        const header = ['Title'];

        for (const property of this.state.properties) {
            if (property.active) {
                header.push(property.label);
            }
        }

        const rows = [];

        for (let i = 0; i < this.state.contributions.length; i++) {
            const contribution = this.state.contributions[i];
            const row = [contribution.title];

            for (const property of this.state.properties) {
                if (property.active) {
                    let value = '';
                    if (this.state.data[property.id]) {
                        // separate labels with comma
                        value = this.state.data[property.id][i].map(entry => entry.label).join(', ');
                        row.push(value);
                    }
                }
            }
            rows.push(row);
        }

        this.setState({
            csvData: [header, ...rows]
        });
    };

    performComparison = () => {
        this.setState({
            isLoading: true
        });

        const response_hash = this.getResonseHashFromUrl();
        const contributionIds = this.getContributionIdsFromUrl(this.props.location);

        submitGetRequest(`${comparisonUrl}${this.props.location.search}`)
            .then(comparisonData => {
                // mocking function to allow for deletion of contributions via the url
                const contributions = [];
                for (let i = 0; i < comparisonData.contributions.length; i++) {
                    const contribution = comparisonData.contributions[i];

                    if (contributionIds.includes(contribution.id)) {
                        contributions.push(contribution);
                    }
                }

                const propertyIds = this.getPropertyIdsFromUrl();

                // if there are properties in the query string
                if (propertyIds.length > 0) {
                    // sort properties based on query string (is not presented in query string, sort at the bottom)
                    // TODO: sort by label when is not active
                    comparisonData.properties.sort((a, b) => {
                        const index1 = propertyIds.indexOf(a.id) !== -1 ? propertyIds.indexOf(a.id) : 1000;
                        const index2 = propertyIds.indexOf(b.id) !== -1 ? propertyIds.indexOf(b.id) : 1000;
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
                    response_hash: comparisonData.response_hash ? comparisonData.response_hash : response_hash,
                    transpose: this.getTransposeOptionFromUrl(),
                    isLoading: false
                });
            })
            .catch(error => {
                this.setState({
                    loadingFailed: true,
                    isLoading: false
                });
            });
    };

    toggleDropdown = () => {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    };

    exportAsCsv = e => {
        this.setState({
            dropdownOpen: false
        });
    };

    removeContribution = contributionId => {
        const contributionIds = this.getContributionIdsFromUrl(this.props.location);
        const index = contributionIds.indexOf(contributionId);

        if (index > -1) {
            contributionIds.splice(index, 1);
        }

        this.generateUrl(contributionIds.join(','));
    };

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type]
        }));
    };

    onSortEnd = ({ oldIndex, newIndex }) => {
        this.setState(
            ({ properties }) => ({
                properties: arrayMove(properties, oldIndex, newIndex)
            }),
            () => {
                this.generateUrl();
            }
        );
    };

    // code is a bit ugly because the properties inside an array and not an object
    toggleProperty = id => {
        const newState = dotProp.set(this.state, 'properties', properties => {
            properties.forEach((property, index) => {
                if (property.id === id) {
                    properties[index].active = !properties[index].active;
                }
            });

            return properties;
        });

        this.setState(newState, () => {
            this.generateMatrixOfComparison();
            this.generateUrl();
        });
    };

    toggleTranpose = () => {
        this.setState(
            prevState => ({
                transpose: !prevState.transpose
            }),
            () => {
                this.generateUrl();
            }
        );
    };

    propertiesToQueryString = () => {
        let queryString = '';

        this.state.properties.forEach((property, index) => {
            if (property.active) {
                queryString += property.id + ',';
            }
        });
        queryString = queryString.slice(0, -1);

        return queryString;
    };

    generateUrl = (contributionIds, propertyIds, transpose) => {
        if (!contributionIds) {
            contributionIds = this.getContributionIdsFromUrl(this.props.location).join(',');
        }
        if (!propertyIds) {
            propertyIds = this.propertiesToQueryString();
        }
        if (!transpose) {
            transpose = this.state.transpose;
        }
        this.props.history.push(ROUTES.COMPARISON + '?contributions=' + contributionIds + '&properties=' + propertyIds + '&transpose=' + transpose);
    };

    handleGoBack = () => {
        this.props.history.goBack();
    };

    render() {
        const contributionAmount = this.getContributionIdsFromUrl(this.props.location).length;

        return (
            <div>
                <Container className="p-0 d-flex align-items-center">
                    <h1 className="h4 mt-4 mb-4 ">Contribution comparison</h1>
                    {/* 
                    // Created a breadcrumb so it is possible to navigate back to the original paper (or the first paper)
                    // problem is: when a contribution is performed, the first paper is not the paper from where the contribution started 
                    // So maybe a breadcrumb is not intuitive, therefore it is commented out right now
                    {this.state.contributions[0] &&
                        <BreadcrumbStyled>}
                            <BreadcrumbItem><Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: this.state.contributions[0].paperId })}>Paper</Link></BreadcrumbItem>
                            <BreadcrumbItem active>Comparison</BreadcrumbItem>
                        </BreadcrumbStyled>
                    }*/}
                </Container>

                <Container className="box pt-4 pb-4 pl-5 pr-5 clearfix">
                    {!this.state.isLoading && this.state.loadingFailed && (
                        <div>
                            <Alert color="danger">
                                <strong>Error.</strong> The comparison service is unreachable. Please come back later and try again.{' '}
                                <span className="btn-link" style={{ cursor: 'pointer' }} onClick={this.handleGoBack}>
                                    Go back
                                </span>{' '}
                                or <Link to={ROUTES.HOME}>go to the homepage</Link>.
                            </Alert>
                        </div>
                    )}
                    {!this.state.loadingFailed && (
                        <>
                            <h2 className="h4 mt-4 mb-3 float-left">
                                Compare
                                <br />
                                <span className="h6">{this.state.title}</span>
                            </h2>

                            {contributionAmount > 1 ? (
                                !this.state.isLoading ? (
                                    <div>
                                        <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown}>
                                            <DropdownToggle color="darkblue" size="sm" className="float-right mb-4 mt-4 ml-1 pl-3 pr-3">
                                                <span className="mr-2">Options</span> <Icon icon={faEllipsisV} />
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                <DropdownItem header>Customize</DropdownItem>
                                                <DropdownItem onClick={() => this.toggle('showPropertiesDialog')}>Select properties</DropdownItem>
                                                <DropdownItem onClick={() => this.toggleTranpose()}>Transpose table</DropdownItem>
                                                <DropdownItem divider />
                                                <DropdownItem header>Export</DropdownItem>
                                                <DropdownItem onClick={() => this.toggle('showLatexDialog')}>Export as LaTeX</DropdownItem>
                                                {this.state.csvData ? (
                                                    <CSVLink
                                                        data={this.state.csvData}
                                                        filename={'ORKG Contribution Comparison.csv'}
                                                        className="dropdown-item"
                                                        target="_blank"
                                                        onClick={this.exportAsCsv}
                                                    >
                                                        Export as CSV
                                                    </CSVLink>
                                                ) : (
                                                    ''
                                                )}
                                                <GeneratePdf id="comparisonTable" />
                                                <DropdownItem divider />
                                                <DropdownItem onClick={() => this.toggle('showShareDialog')}>Share link</DropdownItem>
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
                                    </div>
                                ) : (
                                    <ComparisonLoadingComponent />
                                )
                            ) : (
                                <>
                                    <div className="clearfix" />
                                    <Alert color="info">Please select a minimum of two research contributions to compare on</Alert>
                                </>
                            )}
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
                    response_hash={this.state.response_hash}
                />

                <ExportToLatex
                    data={this.state.csvData}
                    contributions={this.state.contributions}
                    properties={this.state.properties}
                    showDialog={this.state.showLatexDialog}
                    toggle={() => this.toggle('showLatexDialog')}
                    transpose={this.state.transpose}
                    location={window.location}
                    response_hash={this.state.response_hash}
                />
            </div>
        );
    }
}

Comparison.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            paperId: PropTypes.string,
            comparisonId: PropTypes.string
        }).isRequired
    }).isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    viewPaper: state.viewPaper
});

export default connect(mapStateToProps)(Comparison);
