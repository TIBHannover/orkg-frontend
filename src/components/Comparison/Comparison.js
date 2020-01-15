import React, { Component } from 'react';
import { Alert, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { comparisonUrl, submitGetRequest, getResource, getStatementsBySubject } from 'network';
import { getContributionIdsFromUrl, getPropertyIdsFromUrl, getTransposeOptionFromUrl, getResonseHashFromUrl, get_error_message } from 'utils';
import { SubtitleSeparator, ComparisonTitle } from './styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import ComparisonLoadingComponent from './ComparisonLoadingComponent';
import ComparisonTable from './ComparisonTable.js';
import ExportToLatex from './ExportToLatex.js';
import GeneratePdf from './GeneratePdf.js';
import SelectProperties from './SelectProperties.js';
import Share from './Share.js';
import Publish from './Publish.js';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { CSVLink } from 'react-csv';
import arrayMove from 'array-move';
import { connect } from 'react-redux';
import dotProp from 'dot-prop-immutable';
import { reverse } from 'named-urls';

class Comparison extends Component {
    constructor(props) {
        super(props);

        this.state = {
            transpose: false,
            response_hash: null,
            title: '',
            description: '',
            contributions: [],
            dropdownOpen: false,
            properties: [],
            data: {},
            csvData: [],
            showPropertiesDialog: false,
            showShareDialog: false,
            showLatexDialog: false,
            showPublishDialog: false,
            isLoading: false,
            loadingFailed: false,
            errors: null,
            locationSearch: ''
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

        const prevContributions = getContributionIdsFromUrl(prevProps.location.search);
        const currentContributions = getContributionIdsFromUrl(this.props.location.search);
        // perform comparison again when contribution ids are removed
        if (prevContributions.length !== currentContributions.length || !currentContributions.every(e => prevContributions.includes(e))) {
            this.performComparison();
        }
    };

    updateComparisonMetadata = (title, description) => {
        this.setState({ title, description });
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

    getComparisonResult = locationSearch => {
        const response_hash = getResonseHashFromUrl(locationSearch);
        const contributionIds = getContributionIdsFromUrl(locationSearch);
        const propertyIds = getPropertyIdsFromUrl(locationSearch);
        const transpose = getTransposeOptionFromUrl(locationSearch);

        submitGetRequest(`${comparisonUrl}${locationSearch}`)
            .then(comparisonData => {
                // mocking function to allow for deletion of contributions via the url
                const contributions = [];
                for (let i = 0; i < comparisonData.contributions.length; i++) {
                    const contribution = comparisonData.contributions[i];

                    if (contributionIds.includes(contribution.id)) {
                        contributions.push(contribution);
                    }
                }

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
                    transpose: transpose,
                    isLoading: false,
                    errors: null,
                    loadingFailed: false
                });
            })
            .catch(error => {
                this.setState({
                    loadingFailed: true,
                    isLoading: false,
                    errors: get_error_message(error)
                });
            });
    };

    performComparison = () => {
        this.setState({
            isLoading: true
        });
        if (this.props.match.params.comparisonId) {
            getResource(this.props.match.params.comparisonId)
                .then(comparisonResource => {
                    if (!comparisonResource.classes.includes(process.env.REACT_APP_CLASSES_COMPARISON)) {
                        throw new Error(`The requested resource is not of class "${process.env.REACT_APP_CLASSES_COMPARISON}".`);
                    }
                    return getStatementsBySubject({ id: this.props.match.params.comparisonId }).then(comparisonStatement => {
                        const descriptionStatement = comparisonStatement.find(
                            statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_DESCRIPTION
                        );
                        const urlStatement = comparisonStatement.find(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_URL);
                        if (urlStatement) {
                            this.getComparisonResult(urlStatement.object.label.substring(urlStatement.object.label.indexOf('?')));
                            this.setState({
                                locationSearch: urlStatement.object.label.substring(urlStatement.object.label.indexOf('?')),
                                title: descriptionStatement.subject.label,
                                description: descriptionStatement.object.label
                            });
                        } else {
                            throw new Error('The requested comparison has no contributions.');
                        }
                    });
                })
                .catch(error => {
                    let errorMessage = null;
                    if (error.statusCode && error.statusCode === 404) {
                        errorMessage = 'The requested resource is not found';
                    } else {
                        errorMessage = get_error_message(error);
                    }
                    this.setState({ errors: errorMessage, isLoading: false, loadingFailed: true });
                });
        } else {
            this.getComparisonResult(this.props.location.search);
            this.setState({ locationSearch: '' });
        }
    };

    removeContribution = contributionId => {
        const contributionIds = getContributionIdsFromUrl(this.state.locationSearch || this.props.location.search);
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
            contributionIds = getContributionIdsFromUrl(this.state.locationSearch || this.props.location.search).join(',');
        }
        if (!propertyIds) {
            propertyIds = this.propertiesToQueryString();
        }
        if (!transpose) {
            transpose = this.state.transpose;
        }
        this.props.history.push(
            reverse(ROUTES.COMPARISON) + '?contributions=' + contributionIds + '&properties=' + propertyIds + '&transpose=' + transpose
        );
    };

    handleGoBack = () => {
        this.props.history.goBack();
    };

    render() {
        const contributionAmount = getContributionIdsFromUrl(this.state.locationSearch || this.props.location.search).length;

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
                                {this.state.errors ? (
                                    <>{this.state.errors}</>
                                ) : (
                                    <>
                                        <strong>Error.</strong> The comparison service is unreachable. Please come back later and try again.{' '}
                                        <span className="btn-link" style={{ cursor: 'pointer' }} onClick={this.handleGoBack}>
                                            Go back
                                        </span>{' '}
                                        or <Link to={ROUTES.HOME}>go to the homepage</Link>.
                                    </>
                                )}
                            </Alert>
                        </div>
                    )}
                    {!this.state.loadingFailed && (
                        <>
                            <div>
                                <div className="p-0 d-flex align-items-center">
                                    <h2 className="h4 flex-shrink-0 mb-4 mt-4">Compare</h2>
                                    {this.props.match.params.comparisonId && (
                                        <>
                                            <SubtitleSeparator />

                                            <ComparisonTitle>{this.state.title}</ComparisonTitle>
                                        </>
                                    )}
                                    {contributionAmount > 1 && !this.state.isLoading && (
                                        <div style={{ marginLeft: 'auto' }} className="flex-shrink-0">
                                            <Dropdown isOpen={this.state.dropdownOpen} toggle={() => this.toggle('dropdownOpen')}>
                                                <DropdownToggle color="darkblue" size="sm" className="float-right ml-1 pl-3 pr-3">
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
                                                            onClick={() => this.toggle('dropdownOpen')}
                                                        >
                                                            Export as CSV
                                                        </CSVLink>
                                                    ) : (
                                                        ''
                                                    )}
                                                    <GeneratePdf id="comparisonTable" />
                                                    <DropdownItem divider />
                                                    <DropdownItem onClick={() => this.toggle('showShareDialog')}>Share link</DropdownItem>
                                                    <DropdownItem onClick={() => this.toggle('showPublishDialog')}>Publish</DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>
                                    )}
                                </div>
                                {this.props.match.params.comparisonId && this.state.description ? (
                                    <div style={{ marginBottom: '20px' }} className="h6">
                                        {this.state.description}
                                    </div>
                                ) : (
                                    <br />
                                )}
                            </div>
                            {contributionAmount > 1 ? (
                                !this.state.isLoading ? (
                                    <ComparisonTable
                                        data={this.state.data}
                                        properties={this.state.properties}
                                        contributions={this.state.contributions}
                                        removeContribution={this.removeContribution}
                                        transpose={this.state.transpose}
                                    />
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
                    comparisonId={this.props.match.params.comparisonId}
                    response_hash={this.state.response_hash}
                />

                <Publish
                    showDialog={this.state.showPublishDialog}
                    toggle={() => this.toggle('showPublishDialog')}
                    url={window.location.href}
                    response_hash={this.state.response_hash}
                    comparisonId={this.props.match.params.comparisonId}
                    updateComparisonMetadata={this.updateComparisonMetadata}
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
