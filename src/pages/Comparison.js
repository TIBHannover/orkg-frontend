import React, { Component } from 'react';
import { Alert, Dropdown, DropdownItem, DropdownMenu, NavLink, DropdownToggle, Button, ButtonGroup, Badge } from 'reactstrap';
import {
    comparisonUrl,
    submitGetRequest,
    getResource,
    getStatementsBySubject,
    getComparisonDataByDOI,
    getStatementsBySubjectAndPredicate
} from 'network';
import { getContributionIdsFromUrl, getPropertyIdsFromUrl, getTransposeOptionFromUrl, getResponseHashFromUrl, get_error_message } from 'utils';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faPlus, faArrowsAltH, faUser, faLightbulb, faCalendar } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import ComparisonLoadingComponent from '../components/Comparison/ComparisonLoadingComponent';
import ComparisonTable from '../components/Comparison/ComparisonTable.js';
import ExportToLatex from '../components/Comparison/ExportToLatex.js';
import GeneratePdf from '../components/Comparison/GeneratePdf.js';
import SelectProperties from 'components/Comparison/SelectProperties';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import AddContribution from 'components/Comparison/AddContribution/AddContribution';
import Share from '../components/Comparison/Share.js';
import Publish from '../components/Comparison/Publish.js';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { CSVLink } from 'react-csv';
import arrayMove from 'array-move';
import { connect } from 'react-redux';
import dotProp from 'dot-prop-immutable';
import { reverse } from 'named-urls';
import moment from 'moment';
//import ProvenanceBox from 'components/Comparison/ProvenanceBox/ProvenanceBox';
import ExportCitation from 'components/Comparison/ExportCitation';
import { generateRdfDataVocabularyFile, extendPropertyIds, similarPropertiesByLabel } from 'utils';
import { ContainerAnimated } from '../components/Comparison/styled';
import RelatedResources from '../components/Comparison/RelatedResources';
import RelatedFigures from '../components/Comparison/RelatedFigures';
import Tippy from '@tippy.js/react';
import { Cookies } from 'react-cookie';
import { flattenDepth } from 'lodash';
import { PREDICATES, CLASSES } from 'constants/graphSettings';

const cookies = new Cookies();

class Comparison extends Component {
    constructor(props) {
        super(props);

        this.state = {
            transpose: false,
            response_hash: null,
            title: '',
            description: '',
            subject: '',
            reference: '',
            createdAt: '',
            createdBy: '',
            contributions: [],
            dropdownOpen: false,
            properties: [],
            authors: [],
            comparisonLink: '',
            DOIData: [],
            data: {},
            csvData: [],
            showPropertiesDialog: false,
            showShareDialog: false,
            showLatexDialog: false,
            showExportCitationsDialog: false,
            showPublishWithDOIDialog: false,
            showPublishDialog: false,
            showAddContribuion: false,
            isLoading: false,
            loadingFailed: false,
            fullWidth: false,
            errors: null,
            locationSearch: '',
            resourcesStatements: [],
            hideScrollHint: cookies.get('seenShiftMouseWheelScroll') ? cookies.get('seenShiftMouseWheelScroll') : false
        };
    }

    componentDidMount = () => {
        this.performComparison();
        this.getComparisonData();
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

    getComparisonData = () => {
        if (this.props.match.params.comparisonId) {
            getComparisonDataByDOI(this.props.match.params.comparisonId)
                .then(response => {
                    this.setState({
                        DOIData: {
                            doi: response.data.attributes.doi,
                            authors: response.data.attributes.creators,
                            date: response.data.attributes.created
                        }
                    });
                })
                .catch(error => {
                    this.setState({ error: error });
                });
        }
    };

    updateComparisonMetadata = (title, description, reference, subject, authors, comparisonLink) => {
        this.setState({ title, description, reference, subject, authors, comparisonLink });
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
        const response_hash = getResponseHashFromUrl(locationSearch);
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
                    // Create an extended version of propertyIds (ADD the IDs of similar properties)
                    const extendedPropertyIds = extendPropertyIds(propertyIds, comparisonData.data);

                    // sort properties based on query string (is not presented in query string, sort at the bottom)
                    // TODO: sort by label when is not active
                    comparisonData.properties.sort((a, b) => {
                        const index1 = extendedPropertyIds.indexOf(a.id) !== -1 ? extendedPropertyIds.indexOf(a.id) : 1000;
                        const index2 = extendedPropertyIds.indexOf(b.id) !== -1 ? extendedPropertyIds.indexOf(b.id) : 1000;
                        return index1 - index2;
                    });

                    // hide properties based on query string
                    comparisonData.properties.forEach((property, index) => {
                        if (!extendedPropertyIds.includes(property.id)) {
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

                // Get Similar properties by Label
                comparisonData.properties.forEach((property, index) => {
                    if (property.active) {
                        comparisonData.properties[index].similar = similarPropertiesByLabel(property.label, comparisonData.data[property.id]);
                    }
                });

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
                    loadingFailed: contributionIds.length > 1 ? true : false,
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
                    if (!comparisonResource.classes.includes(CLASSES.COMPARISON)) {
                        throw new Error(`The requested resource is not of class "${CLASSES.COMPARISON}".`);
                    }
                    return getStatementsBySubject({ id: this.props.match.params.comparisonId }).then(comparisonStatement => {
                        const descriptionStatement = comparisonStatement.find(statement => statement.predicate.id === PREDICATES.DESCRIPTION);
                        const referenceStatement = comparisonStatement.find(statement => statement.predicate.id === PREDICATES.REFERENCE);
                        const urlStatement = comparisonStatement.find(statement => statement.predicate.id === PREDICATES.URL);

                        const resourcesStatements = comparisonStatement.filter(statement => statement.predicate.id === PREDICATES.RELATED_RESOURCES);

                        const figureStatements = comparisonStatement.filter(statement => statement.predicate.id === PREDICATES.RELATED_FIGURE);
                        let creators = comparisonStatement.filter(statement => statement.predicate.id === PREDICATES.HAS_AUTHOR);
                        creators = creators.reverse(); // statements are ordered desc, so first author is last => thus reverse
                        this.loadAuthorsORCID(creators);
                        if (urlStatement) {
                            this.getComparisonResult(urlStatement.object.label.substring(urlStatement.object.label.indexOf('?')));
                            this.setState({
                                locationSearch: urlStatement.object.label.substring(urlStatement.object.label.indexOf('?')),
                                title: descriptionStatement.subject.label,
                                description: descriptionStatement.object.label,
                                reference: referenceStatement ? referenceStatement.object.label : '',
                                createdAt: descriptionStatement.object.created_at,
                                createdBy: descriptionStatement.object.created_by,
                                //authors: authors,
                                resourcesStatements,
                                figureStatements
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

    addContributions = newContributionIds => {
        const contributionIds = getContributionIdsFromUrl(this.state.locationSearch || this.props.location.search);
        this.generateUrl(contributionIds.concat(newContributionIds).join(','));
    };

    loadAuthorsORCID = async creators => {
        return Promise.all(
            creators.map(author => getStatementsBySubjectAndPredicate({ subjectId: author.object.id, predicateId: PREDICATES.HAS_ORCID }))
        ).then(authorsORCID => {
            const authorsArray = [];
            for (const author of creators) {
                const orcid = flattenDepth(authorsORCID, 2).find(a => a !== undefined && a.subject.id === author.object.id);
                if (orcid) {
                    authorsArray.push({ orcid: orcid.object.label, label: author.object.label, id: author.object.id });
                } else {
                    authorsArray.push({ orcid: '', label: author.object.label, id: author.object.id });
                }
            }
            this.setState({
                authors: authorsArray
            });
        });
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
        this.props.match.params.comparisonId = '';
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

    handleFullWidth = () => {
        this.setState(prevState => ({
            fullWidth: !prevState.fullWidth
        }));
    };

    onDismiss = () => {
        // dismiss function for the alert thingy!;
        cookies.set('seenShiftMouseWheelScroll', true, { path: process.env.PUBLIC_URL, maxAge: 315360000 }); // << TEN YEARS
        const token = cookies.get('seenShiftMouseWheelScroll');
        this.setState({ hideScrollHint: token });
    };

    render() {
        const contributionAmount = getContributionIdsFromUrl(this.state.locationSearch || this.props.location.search).length;
        const containerStyle = this.state.fullWidth ? { maxWidth: 'calc(100% - 20px)' } : {};

        return (
            <div>
                <ContainerAnimated className="d-flex align-items-center">
                    <h1 className="h4 mt-4 mb-4 flex-grow-1">
                        Contribution comparison{' '}
                        <Tippy content="The amount of compared contributions">
                            <span>
                                <Badge color="darkblue" pill style={{ fontSize: '65%' }}>
                                    {contributionAmount}
                                </Badge>
                            </span>
                        </Tippy>
                    </h1>

                    {contributionAmount > 1 && !this.state.isLoading && !this.state.loadingFailed && (
                        <div style={{ marginLeft: 'auto' }} className="flex-shrink-0 mt-4">
                            <ButtonGroup className="float-right mb-4 ml-1">
                                <Button color="darkblue" size="sm" onClick={this.handleFullWidth} style={{ marginRight: 3 }}>
                                    <Icon icon={faArrowsAltH} /> <span className="mr-2">Full width</span>
                                </Button>
                                <Button
                                    className="flex-shrink-0"
                                    color="darkblue"
                                    size="sm"
                                    style={{ marginRight: 3 }}
                                    onClick={() => this.toggle('showAddContribuion')}
                                >
                                    <Icon icon={faPlus} style={{ margin: '2px 4px 0 0' }} /> Add contribution
                                </Button>
                                <Dropdown group isOpen={this.state.dropdownOpen} toggle={() => this.toggle('dropdownOpen')}>
                                    <DropdownToggle color="darkblue" size="sm" className="rounded-right">
                                        <span className="mr-2">More</span> <Icon icon={faEllipsisV} />
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
                                                filename="ORKG Contribution Comparison.csv"
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
                                        <DropdownItem
                                            onClick={() =>
                                                generateRdfDataVocabularyFile(
                                                    this.state.data,
                                                    this.state.contributions,
                                                    this.state.properties,
                                                    this.props.match.params.comparisonId
                                                        ? {
                                                              title: this.state.title,
                                                              description: this.state.description,
                                                              creator: this.state.createdBy,
                                                              date: this.state.createdAt
                                                          }
                                                        : { title: '', description: '', creator: '', date: '' }
                                                )
                                            }
                                        >
                                            Export as RDF
                                        </DropdownItem>
                                        {this.props.match.params.comparisonId && this.state.DOIData.doi && (
                                            <DropdownItem onClick={() => this.toggle('showExportCitationsDialog')}>Export Citation</DropdownItem>
                                        )}
                                        <DropdownItem divider />
                                        <DropdownItem onClick={() => this.toggle('showShareDialog')}>Share link</DropdownItem>
                                        <DropdownItem onClick={() => this.toggle('showPublishDialog')}>Publish</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </ButtonGroup>
                        </div>
                    )}
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
                </ContainerAnimated>

                <ContainerAnimated className="box rounded pt-4 pb-4 pl-5 pr-5 clearfix" style={containerStyle}>
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
                                <div className="p-0 d-flex align-items-start">
                                    <h2 className="h4 mb-4 mt-4">
                                        {this.props.match.params.comparisonId && this.state.title ? this.state.title : 'Compare'}
                                    </h2>

                                    {/*this.props.match.params.comparisonId && (
                                        <>
                                            <SubtitleSeparator />

                                            <ComparisonTitle>{this.state.title}</ComparisonTitle>
                                        </>
                                    )*/}
                                </div>
                                {this.props.match.params.comparisonId ? (
                                    <>
                                        {this.state.description && (
                                            <div style={{ lineHeight: 1.5 }} className="h6 mb-2">
                                                {this.state.description}
                                            </div>
                                        )}

                                        <div>
                                            {this.state.createdAt ? (
                                                <span className="badge badge-lightblue mr-2">
                                                    <Icon icon={faCalendar} className="text-primary" />{' '}
                                                    {this.state.createdAt ? moment(this.state.createdAt).format('MMMM') : ''}{' '}
                                                    {this.state.createdAt ? moment(this.state.createdAt).format('YYYY') : ''}
                                                </span>
                                            ) : (
                                                ''
                                            )}

                                            {this.state.authors && this.state.authors.length > 0 && (
                                                <>
                                                    {this.state.authors.map((author, index) =>
                                                        author.id && author.id !== '' && author.orcid && author.orcid !== '' ? (
                                                            <Link
                                                                className="p-0"
                                                                to={reverse(ROUTES.AUTHOR_PAGE, { authorId: author.id })}
                                                                key={index}
                                                            >
                                                                <Badge color="lightblue" className="mr-2 mb-2">
                                                                    <Icon icon={faUser} className="text-primary" /> {author.label}
                                                                </Badge>
                                                            </Link>
                                                        ) : author.orcid && author.orcid !== '' ? (
                                                            <NavLink
                                                                className="p-0"
                                                                style={{ display: 'contents' }}
                                                                href={'https://orcid.org/' + author.orcid}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                key={index}
                                                            >
                                                                <Badge color="lightblue" className="mr-2 mb-2">
                                                                    <Icon icon={faUser} className="text-primary" /> {author.label}
                                                                </Badge>
                                                            </NavLink>
                                                        ) : (
                                                            <Badge color="lightblue" className="mr-2 mb-2" key={index}>
                                                                <Icon icon={faUser} className="text-darkblue" /> {author.label}
                                                            </Badge>
                                                        )
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        {this.state.DOIData && (
                                            <div>
                                                {this.state.DOIData.doi && (
                                                    <div style={{ marginBottom: '20px', lineHeight: 1.5 }}>
                                                        <small>
                                                            DOI:{' '}
                                                            <i>
                                                                <ValuePlugins type="literal">{this.state.DOIData.doi}</ValuePlugins>
                                                            </i>
                                                        </small>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <br />
                                )}
                            </div>
                            {contributionAmount > 3 && (
                                <Alert color="info" isOpen={!this.state.hideScrollHint} toggle={this.onDismiss}>
                                    <Icon icon={faLightbulb} /> Use{' '}
                                    <b>
                                        <i>Shift</i>
                                    </b>{' '}
                                    +{' '}
                                    <b>
                                        <i>Mouse Wheel</i>
                                    </b>{' '}
                                    for horizontal scrolling in the table.
                                </Alert>
                            )}
                            {contributionAmount > 1 || this.props.match.params.comparisonId ? (
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
                                    <Alert color="info">Please select a minimum of two research contributions to compare on.</Alert>
                                </>
                            )}
                        </>
                    )}

                    <RelatedResources resourcesStatements={this.state.resourcesStatements} />
                    <RelatedFigures figureStatements={this.state.figureStatements} />
                    {/*
                    <ProvenanceBox resourceId={this.props.match.params.comparisonId} />
                    */}
                    {/* {this.props.match.params.comparisonId && ( */}
                    {/* <ExportCitations DOI={this.props.match.params.comparisonId} /> */}
                    {/* )} */}
                </ContainerAnimated>

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
                    locationSearch={this.state.locationSearch || this.props.location.search}
                    comparisonId={this.props.match.params.comparisonId}
                    response_hash={this.state.response_hash}
                />

                <Publish
                    showDialog={this.state.showPublishDialog}
                    toggle={() => this.toggle('showPublishDialog')}
                    url={window.location.href}
                    response_hash={this.state.response_hash}
                    authors={this.state.authors}
                    title={this.state.title}
                    location={this.state.locationSearch || this.props.location.search}
                    description={this.state.description}
                    reference={this.state.reference}
                    subject={this.state.subject}
                    comparisonId={this.props.match.params.comparisonId}
                    doi={this.state.DOIData.doi}
                    updateComparisonMetadata={this.updateComparisonMetadata}
                />

                <AddContribution
                    addContributions={this.addContributions}
                    showDialog={this.state.showAddContribuion}
                    toggle={() => this.toggle('showAddContribuion')}
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
                    title={this.state.title}
                    description={this.state.description}
                    comparisonId={this.props.match.params.comparisonId}
                />

                <ExportCitation
                    showDialog={this.state.showExportCitationsDialog}
                    toggle={() => this.toggle('showExportCitationsDialog')}
                    DOI={this.state.DOIData.doi}
                    comparisonId={this.props.match.params.comparisonId}
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
