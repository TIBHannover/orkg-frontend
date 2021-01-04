import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ListGroup, CustomInput } from 'reactstrap';
import {
    createLiteralStatement,
    createResourceStatement,
    deleteStatementsByIds,
    deleteStatementById,
    updateStatement,
    getStatementsBySubjectAndPredicate,
    getStatementsByPredicateAndLiteral
} from 'services/backend/statements';
import { updateLiteral, createLiteral as createLiteralApi } from 'services/backend/literals';
import { updateResource, createResource } from 'services/backend/resources';
import { markAsVerified, markAsUnverified } from 'services/backend/papers';
import REGEX from 'constants/regex';
import { toast } from 'react-toastify';
import Tippy from '@tippy.js/react';
import { connect } from 'react-redux';
import EditItem from './EditItem';
import { loadPaper } from 'actions/viewPaper';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import LoadingOverlay from 'react-loading-overlay';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { isEqual } from 'lodash';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { PREDICATES } from 'constants/graphSettings';
import { CLASSES } from 'constants/graphSettings';

const LoadingOverlayStyled = styled(LoadingOverlay)`
    //border-radius: 7px;
    //overflow: hidden;
`;
class EditPaperDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showDialog: false,
            openItem: 'title',
            isLoading: false,
            ...this.getStateFromRedux()
        };
    }

    getStateFromRedux = () => {
        return {
            title: this.props.viewPaper.title,
            publicationMonth: this.props.viewPaper.publicationMonth,
            publicationYear: this.props.viewPaper.publicationYear,
            doi: this.props.viewPaper.doi,
            authors: this.props.viewPaper.authors,
            publishedIn: this.props.viewPaper.publishedIn,
            url: this.props.viewPaper.url,
            researchField: this.props.viewPaper.researchField,
            verified: this.props.viewPaper.verified
        };
    };

    toggleDialog = () => {
        if (!this.state.showDialog) {
            this.setState({
                showDialog: true,
                openItem: 'title',
                ...this.getStateFromRedux()
            });
        } else {
            this.setState({
                showDialog: false
            });
        }
    };

    handleChange = (event, name) => {
        // fixing publication month and year as int number edit;
        if (name === 'publicationMonth' || name === 'publicationYear') {
            this.setState({ [name]: parseInt(event.target.value) });
        } else if (name === 'verified') {
            this.setState({ [name]: event.target.checked });
        } else {
            this.setState({ [name]: event.target.value });
        }
    };

    handleSave = async () => {
        this.setState({
            isLoading: true
        });
        const loadPaper = {};

        // Validate title
        if (!this.state.title) {
            toast.error('Please enter the title of this paper');
            this.setState({ isLoading: false });
            return;
        }
        // Validate URL
        if (this.state.url && !new RegExp(REGEX.URL).test(this.state.url.trim())) {
            toast.error(`Please enter a valid paper URL`);
            this.setState({ isLoading: false });
            return;
        }

        //title
        updateResource(this.props.viewPaper.paperResourceId, this.state.title);

        //authors
        await this.updateAuthors(this.state.authors); //use await to prevent updating the props, which are needed to check whether authors exist

        //venue
        if (this.state.publishedIn && this.state.publishedIn.statementId && this.state.publishedIn.id) {
            await updateStatement(this.state.publishedIn.statementId, { object_id: this.state.publishedIn.id });
        } else if (this.state.publishedIn && !this.state.publishedIn.statementId) {
            await createResourceStatement(this.props.viewPaper.paperResourceId, PREDICATES.HAS_VENUE, this.state.publishedIn.id);
        } else if (this.state.publishedIn && this.state.publishedIn.statementId && !this.state.publishedIn.id) {
            await deleteStatementById(this.state.publishedIn.statementId);
            this.setState({ publishedIn: '' });
        }

        // research field
        if (this.state.researchField && this.state.researchField.statementId && this.state.researchField.id) {
            await updateStatement(this.state.researchField.statementId, { object_id: this.state.researchField.id });
        } else if (this.state.researchField && !this.state.researchField.statementId && this.state.researchField.id) {
            const statement = await createResourceStatement(
                this.props.viewPaper.paperResourceId,
                PREDICATES.HAS_RESEARCH_FIELD,
                this.state.researchField.id
            );
            this.setState({
                researchField: { ...this.state.researchField, statementId: statement.id }
            });
        }

        //publication month
        loadPaper['publicationMonthResourceId'] = await this.updateOrCreateLiteral({
            reducerName: 'publicationMonthResourceId',
            value: this.state.publicationMonth,
            predicateIdForCreate: PREDICATES.HAS_PUBLICATION_MONTH
        });

        //publication year
        loadPaper['publicationYearResourceId'] = await this.updateOrCreateLiteral({
            reducerName: 'publicationYearResourceId',
            value: this.state.publicationYear,
            predicateIdForCreate: PREDICATES.HAS_PUBLICATION_YEAR
        });

        //doi
        loadPaper['doiResourceId'] = await this.updateOrCreateLiteral({
            reducerName: 'doiResourceId',
            value: this.state.doi,
            predicateIdForCreate: PREDICATES.HAS_DOI
        });

        //url
        loadPaper['urlResourceId'] = await this.updateOrCreateLiteral({
            reducerName: 'urlResourceId',
            value: this.state.url,
            predicateIdForCreate: PREDICATES.URL
        });

        //verified
        if (!!this.props.user && this.props.user.isCurationAllowed) {
            if (this.state.verified) {
                markAsVerified(this.props.viewPaper.paperResourceId, this.state.verified).catch(e => console.log(e));
            } else {
                markAsUnverified(this.props.viewPaper.paperResourceId, this.state.verified).catch(e => console.log(e));
            }
        }

        //update redux state with changes, so it is updated on the view paper page
        this.props.loadPaper({
            ...loadPaper,
            title: this.state.title,
            publicationMonth: this.state.publicationMonth,
            publicationYear: this.state.publicationYear,
            doi: this.state.doi,
            authors: this.state.authors,
            publishedIn: this.state.publishedIn,
            url: this.state.url,
            researchField: this.state.researchField,
            verified: this.state.verified
        });

        this.setState({
            isLoading: false
        });

        this.toggleDialog();
    };

    updateOrCreateLiteral = async ({ reducerName, value, predicateIdForCreate }) => {
        const literalId = this.props.viewPaper[reducerName];

        if (literalId && value !== '') {
            updateLiteral(literalId, value);
            return literalId;
        } else if (literalId && value === '') {
            // delete statements because it's not possible to set empty label for literal
            await getStatementsBySubjectAndPredicate({ subjectId: this.props.viewPaper.paperResourceId, predicateId: predicateIdForCreate }).then(
                statements => {
                    deleteStatementsByIds(statements.map(s => s.id));
                }
            );
            return null;
        } else if (value) {
            // only create a new literal if a value has been provided
            const newLiteral = await this.createNewLiteral(this.props.viewPaper.paperResourceId, predicateIdForCreate, value);
            return newLiteral.literalId;
        }
        return null;
    };

    createNewLiteral = async (resourceId, predicateId, label) => {
        const newLiteral = await createLiteralApi(label);
        const statement = await createLiteralStatement(resourceId, predicateId, newLiteral.id);

        return {
            literalId: newLiteral.id,
            statementId: statement.id
        };
    };

    // TODO: improve code by using reduce function
    updateAuthors = async () => {
        // Check if there is changes on the authors
        if (isEqual(this.props.viewPaper.authors, this.state.authors)) {
            return null;
        }

        const statementsIds = [];
        // remove all authors statement from reducer
        for (const author of this.props.viewPaper.authors) {
            statementsIds.push(author.statementId);
        }
        deleteStatementsByIds(statementsIds);

        // Add all authors from the state
        const authors = this.state.authors;
        for (const [i, author] of this.state.authors.entries()) {
            // create the author
            if (author.orcid) {
                // Create author with ORCID
                // check if there's an author resource
                const responseJson = await getStatementsByPredicateAndLiteral({
                    predicateId: PREDICATES.HAS_ORCID,
                    literal: author.orcid,
                    subjectClass: CLASSES.AUTHOR,
                    items: 1
                });
                if (responseJson.length > 0) {
                    // Author resource exists
                    const authorResource = responseJson[0];
                    const authorStatement = await createResourceStatement(
                        this.props.viewPaper.paperResourceId,
                        PREDICATES.HAS_AUTHOR,
                        authorResource.subject.id
                    );
                    authors[i].statementId = authorStatement.id;
                    authors[i].id = authorResource.subject.id;
                    authors[i].class = authorResource.subject._class;
                    authors[i].classes = authorResource.subject.classes;
                } else {
                    // Author resource doesn't exist
                    // Create resource author
                    const authorResource = await createResource(author.label, [CLASSES.AUTHOR]);
                    const createLiteral = await createLiteralApi(author.orcid);
                    await createLiteralStatement(authorResource.id, PREDICATES.HAS_ORCID, createLiteral.id);
                    const authorStatement = await createResourceStatement(
                        this.props.viewPaper.paperResourceId,
                        PREDICATES.HAS_AUTHOR,
                        authorResource.id
                    );
                    authors[i].statementId = authorStatement.id;
                    authors[i].id = authorResource.id;
                    authors[i].class = authorResource._class;
                    authors[i].classes = authorResource.classes;
                }
            } else {
                // Author resource exists
                if (author.label !== author.id) {
                    const authorStatement = await createResourceStatement(this.props.viewPaper.paperResourceId, PREDICATES.HAS_AUTHOR, author.id);
                    authors[i].statementId = authorStatement.id;
                    authors[i].id = author.id;
                    authors[i].class = author._class;
                    authors[i].classes = author.classes;
                } else {
                    // Author resource doesn't exist
                    const newLiteral = await createLiteralApi(author.label);
                    // Create literal of author
                    const authorStatement = await createLiteralStatement(this.props.viewPaper.paperResourceId, PREDICATES.HAS_AUTHOR, newLiteral.id);
                    authors[i].statementId = authorStatement.id;
                    authors[i].id = newLiteral.id;
                    authors[i].class = authorStatement.object._class;
                    authors[i].classes = authorStatement.object.classes;
                }
            }
        }

        this.setState({
            authors
        });
    };

    toggleItem = type => {
        this.setState(prevState => ({
            openItem: prevState.openItem !== type ? type : null
        }));
    };

    handleAuthorsChange = tags => {
        tags = tags ? tags : [];
        this.setState({
            authors: tags
        });
    };

    handleVenueChange = async (selected, action) => {
        if (action.action === 'select-option') {
            selected.statementId = this.state.publishedIn && this.state.publishedIn.statementId ? this.state.publishedIn.statementId : '';
            this.setState({
                publishedIn: selected
            });
        } else if (action.action === 'create-option') {
            const newVenue = await createResource(selected.label, [CLASSES.VENUE]);
            selected.id = newVenue.id;
            selected.statementId = this.state.publishedIn && this.state.publishedIn.statementId ? this.state.publishedIn.statementId : '';
            this.setState({
                publishedIn: selected
            });
        } else if (action.action === 'clear') {
            const statementId = this.state.publishedIn && this.state.publishedIn.statementId ? this.state.publishedIn.statementId : '';
            this.setState({
                publishedIn: { statementId: statementId, id: null, label: null }
            });
        }
    };

    handleResearchFieldChange = async (selected, action) => {
        if (action.action === 'select-option') {
            selected.statementId = this.state.researchField && this.state.researchField.statementId ? this.state.researchField.statementId : '';
            this.setState({
                researchField: selected
            });
        }
    };

    render() {
        return (
            <>
                <Button color="darkblue" size="sm" className="mt-2" style={{ marginLeft: 'auto' }} onClick={this.toggleDialog}>
                    <Icon icon={faPen} /> Edit data
                </Button>

                <Modal isOpen={this.state.showDialog} toggle={this.toggleDialog} size="lg">
                    <LoadingOverlayStyled
                        active={this.state.isLoading}
                        spinner
                        text="Saving..."
                        styles={{
                            overlay: base => ({
                                ...base,
                                borderRadius: 7,
                                overflow: 'hidden',
                                background: 'rgba(215, 215, 215, 0.7)',
                                color: '#282828',
                                '& svg circle': {
                                    stroke: '#282828'
                                }
                            })
                        }}
                    >
                        <ModalHeader toggle={this.toggleDialog}>Edit general data</ModalHeader>
                        <ModalBody>
                            <ListGroup className="listGroupEnlarge">
                                <EditItem
                                    open={this.state.openItem === 'title'}
                                    label="Title"
                                    type="text"
                                    value={this.state.title}
                                    onChange={e => this.handleChange(e, 'title')}
                                    toggleItem={() => this.toggleItem('title')}
                                />
                                <EditItem
                                    open={this.state.openItem === 'month'}
                                    label="Publication month"
                                    type="month"
                                    value={this.state.publicationMonth}
                                    onChange={e => this.handleChange(e, 'publicationMonth')}
                                    toggleItem={() => this.toggleItem('month')}
                                />
                                <EditItem
                                    open={this.state.openItem === 'year'}
                                    label="Publication year"
                                    type="year"
                                    value={this.state.publicationYear}
                                    onChange={e => this.handleChange(e, 'publicationYear')}
                                    toggleItem={() => this.toggleItem('year')}
                                />
                                <EditItem
                                    open={this.state.openItem === 'authors'}
                                    label="Authors"
                                    type="authors"
                                    value={this.state.authors}
                                    onChange={this.handleAuthorsChange}
                                    toggleItem={() => this.toggleItem('authors')}
                                />
                                <EditItem
                                    open={this.state.openItem === 'doi'}
                                    label="DOI"
                                    type="text"
                                    value={this.state.doi}
                                    onChange={e => this.handleChange(e, 'doi')}
                                    toggleItem={() => this.toggleItem('doi')}
                                />
                                <EditItem
                                    open={this.state.openItem === 'publishedIn'}
                                    label="Published in"
                                    type="publishedIn"
                                    value={this.state.publishedIn}
                                    onChange={this.handleVenueChange}
                                    toggleItem={() => this.toggleItem('publishedIn')}
                                />
                                <EditItem
                                    open={this.state.openItem === 'researchField'}
                                    label="Research Field"
                                    type="researchField"
                                    value={this.state.researchField}
                                    onChange={this.handleResearchFieldChange}
                                    toggleItem={() => this.toggleItem('researchField')}
                                />
                                <EditItem
                                    open={this.state.openItem === 'url'}
                                    isLastItem={true}
                                    label="Paper URL"
                                    type="text"
                                    value={this.state.url}
                                    onChange={e => this.handleChange(e, 'url')}
                                    toggleItem={() => this.toggleItem('url')}
                                />
                            </ListGroup>
                            <div className="d-flex" style={{ justifyContent: 'flex-end' }}>
                                {!!this.props.user && this.props.user.isCurationAllowed && (
                                    <Tippy content="Mark this meta-data as verified">
                                        <span>
                                            <CustomInput
                                                className="mt-2 mr-2 pt-2"
                                                type="checkbox"
                                                id="replaceTitles"
                                                label="Verified"
                                                name="verified"
                                                onChange={e => this.handleChange(e, 'verified')}
                                                checked={this.state.verified}
                                            />
                                        </span>
                                    </Tippy>
                                )}

                                <Button disabled={this.state.isLoading} color="primary" className=" mt-2 mb-2" onClick={this.handleSave}>
                                    Save
                                </Button>
                            </div>
                        </ModalBody>
                    </LoadingOverlayStyled>
                </Modal>
            </>
        );
    }
}

EditPaperDialog.propTypes = {
    loadPaper: PropTypes.func.isRequired,
    viewPaper: PropTypes.shape({
        paperResourceId: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        publicationMonth: PropTypes.number.isRequired,
        publicationYear: PropTypes.number.isRequired,
        doi: PropTypes.string.isRequired,
        publishedIn: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        url: PropTypes.string,
        researchField: PropTypes.object.isRequired,
        verified: PropTypes.bool.isRequired,
        authors: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                label: PropTypes.string.isRequired
            }).isRequired
        ).isRequired
    }).isRequired,
    user: PropTypes.oneOfType([PropTypes.object, PropTypes.number])
};

const mapStateToProps = state => ({
    viewPaper: state.viewPaper,
    user: state.auth.user
});

const mapDispatchToProps = dispatch => ({
    loadPaper: payload => dispatch(loadPaper(payload))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EditPaperDialog);
