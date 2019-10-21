import React, { Component } from 'react';
import { Container, Button, Alert, UncontrolledAlert, Modal, ModalHeader, ModalBody, Collapse, ListGroup } from 'reactstrap';
import { getStatementsBySubject, getResource, updateResource, updateLiteral, createLiteral, createLiteralStatement } from 'network';
import { connect } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar, faBars, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import { StyledStatementItem, StyledListGroupOpen, StyledValueItem } from 'components/AddPaper/Contributions/styled';
import classNames from 'classnames';
import EditItem from './EditItem';
import { loadPaper } from 'actions/viewPaper';

class EditPaperDialog extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showDialog: false,
            openItem: 'title',
            title: props.viewPaper.title,
            publicationMonth: props.viewPaper.publicationMonth,
            publicationYear: props.viewPaper.publicationYear,
            doi: props.viewPaper.doi,
            authors: props.viewPaper.authors,
        }
    }

    toggleDialog = () => {
        this.setState(prevState => ({
            showDialog: !prevState.showDialog,
        }));
    }

    handleChange = (event, name) => {
        this.setState({ [name]: event.target.value });
    }

    handleSave = async () => {
        this.toggleDialog();

        let loadPaper = {};

        updateResource(this.props.viewPaper.paperResourceId, this.state.title);
        //updateLiteral(this.props.viewPaper.publicationMonthResourceId, this.state.publicationMonth);
        //updateLiteral(this.props.viewPaper.publicationYearResourceId, this.state.publicationYear);

        this.updateAuthors(this.state.authors);

        this.updateOrCreateLiteral({
            reducerName: 'publicationMonthResourceId',
            value: this.state.publicationMonth,
            predicateIdForCreate: process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_MONTH,
        }); 

        this.updateOrCreateLiteral({
            reducerName: 'publicationYearResourceId',
            value: this.state.publicationYear,
            predicateIdForCreate: process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_YEAR,
        }); 

        this.updateOrCreateLiteral({
            reducerName: 'doiResourceId',
            value: this.state.doi,
            predicateIdForCreate: process.env.REACT_APP_PREDICATES_HAS_DOI,
        }); 

        this.props.loadPaper({
            ...loadPaper,
            title: this.state.title,
            publicationMonth: this.state.publicationMonth,
            publicationYear: this.state.publicationYear,
            doi: this.state.doi,
            authors: this.state.authors,
        });
    }

    updateOrCreateLiteral = async ({ reducerName, value, predicateIdForCreate }) => {
        const literalId = this.props.viewPaper[reducerName];

        if (literalId) {
            updateLiteral(literalId, value);
        } else {
            let newLiteralId = await this.createNewLiteral(this.props.viewPaper.paperResourceId, predicateIdForCreate, value);
            loadPaper[reducerName] = newLiteralId;
        }
    }

    createNewLiteral = async (resourceId, predicateId, label) => {
        let newLiteral = await createLiteral(label);
        await createLiteralStatement(resourceId, predicateId, newLiteral.id);
        return newLiteral.id;
    }

    updateAuthors = () => {
        // check which authors to remove
        for (let author of this.props.viewPaper.authors){
            let keepAuthor = false;
            for (let existingAuthor of this.state.authors) {
                if (existingAuthor.id === author.id) {
                    keepAuthor = true;
                }
            }   

            if (!keepAuthor) {
                console.log('remove author');
            }
        }

        // check which authors to add
        for (let author of this.state.authors){
            let authorExists = false;
            for (let existingAuthor of this.props.viewPaper.authors) {
                if (existingAuthor.id === author.id) {
                    authorExists = true;
                }
            }   

            if (!authorExists) {
                console.log('create author');
                this.createNewLiteral(this.props.viewPaper.paperResourceId, process.env.REACT_APP_PREDICATES_HAS_AUTHOR, author.label);
            }
        }
    }

    toggleItem = (type) => {
        this.setState(prevState => ({
            openItem: prevState.openItem !== type ? type : null,
        }));
    }

    handleAuthorsChange = (tags) => {
        console.log(tags);
        tags = tags ? tags : [];
        this.setState({
            authors: tags,
        });
    };

    render() {

        return (
            <>
                <Button
                    color="darkblue"
                    size="sm"
                    className="mb-4 mt-4 ml-2 float-right flex-shrink-0"
                    style={{ marginLeft: 'auto' }}
                    onClick={this.toggleDialog}
                >
                    Edit
                </Button>

                <Modal isOpen={this.state.showDialog} toggle={this.toggleDialog} size="lg">
                    <ModalHeader toggle={this.toggleDialog}>Edit general data</ModalHeader>
                    <ModalBody>
                        <ListGroup className="listGroupEnlarge">
                            <EditItem 
                                open={this.state.openItem === 'title'} 
                                label="Title"
                                type="text"
                                value={this.state.title}
                                onChange={(e) => this.handleChange(e, 'title')}
                                toggleItem={() => this.toggleItem('title')}
                            />
                            <EditItem 
                                open={this.state.openItem === 'month'} 
                                label="Publication month"
                                type="month"
                                value={this.state.publicationMonth}
                                onChange={(e) => this.handleChange(e, 'publicationMonth')}
                                toggleItem={() => this.toggleItem('month')}
                            />
                            <EditItem 
                                open={this.state.openItem === 'year'} 
                                label="Publication year"
                                type="year"
                                value={this.state.publicationYear}
                                onChange={(e) => this.handleChange(e, 'publicationYear')}
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
                                isLastItem={true} 
                                label="DOI"
                                type="text"
                                value={this.state.doi}
                                onChange={(e) => this.handleChange(e, 'doi')}
                                toggleItem={() => this.toggleItem('doi')}
                            />
                        </ListGroup>

                        <Button color="primary" className="float-right mt-2" onClick={this.handleSave}>Save</Button>
                    </ModalBody>
                </Modal>
            </>
        );
    }
}

EditPaperDialog.propTypes = {
    // match: PropTypes.shape({
    //     params: PropTypes.shape({
    //         resourceId: PropTypes.string,
    //         contributionId: PropTypes.string,
    //     }).isRequired,
    // }).isRequired,
    // resetStatementBrowser: PropTypes.func.isRequired,
    // location: PropTypes.object.isRequired,
}

const mapStateToProps = state => ({
    viewPaper: state.viewPaper,
});

const mapDispatchToProps = dispatch => ({
    loadPaper: (payload) => dispatch(loadPaper(payload)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EditPaperDialog);