import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Button, Label, FormGroup, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { getStatementsByObject, getStatementsBySubjectAndPredicate, generateDOIForComparison } from 'network';
import Tippy from '@tippy.js/react';
import { getContributionIdsFromUrl } from 'utils';
import Tooltip from '../Utils/Tooltip';

class PublishWithDOI extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            description: '',
            reference: '',
            comparisonId: '',
            creator: '',
            subject: '',
            values: [{ creator: '', ORCID: '' }],
            isLoading: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {}

    componentDidUpdate = prevProps => {
        if (prevProps.title !== this.props.title) {
            this.setState({ title: this.props.title });
        }

        if (prevProps.description !== this.props.description) {
            this.setState({ description: this.props.description });
        }
    };

    createUI() {
        return this.state.values.slice(1).map((el, i) => (
            <div key={i + 1}>
                <br />
                <FormGroup>
                    <Label style={{ float: 'left' }} for="Creator">
                        <Tooltip message="Name of the creator">Creator</Tooltip>
                    </Label>
                    <Input
                        style={{ width: '35%', float: 'left', marginLeft: '10px' }}
                        type="text"
                        value={el.creator || ''}
                        name="creator"
                        id="creator"
                        onChange={e => this.handleChange1(e, i + 1)}
                    />
                </FormGroup>
                <FormGroup>
                    <Label style={{ float: 'left', marginLeft: '25px', marginTop: '-7px' }} for="ORCID">
                        <Tooltip message="ORCID of the creator">ORCID</Tooltip>
                    </Label>
                    <Input
                        style={{ width: '35%', float: 'left', marginLeft: '10px', marginTop: '-15px' }}
                        type="text"
                        value={el.ORCID || ''}
                        name="ORCID"
                        id="ORCID"
                        onChange={e => this.handleChange1(e, i + 1)}
                    />
                </FormGroup>
                <div style={{}} onClick={this.removeClick.bind(this, i)}>
                    <Tippy content="delete contribution">
                        <span style={{ marginLeft: '10px' }}>
                            <Icon size="xs" icon={faMinus} />
                        </span>
                    </Tippy>
                </div>
            </div>
        ));
    }

    handleChange1 = (event, i) => {
        const values = [...this.state.values];
        const { name, value } = event.target;
        values[i][name] = value;
        this.setState({ values });
    };

    handleChange2 = (event, i) => {
        const ORCID = [...this.state.ORCID];
        ORCID[i] = event.target.value;
        this.setState({ ORCID });
    };

    addClick() {
        this.setState(prevState => ({ values: [...prevState.values, { creator: '', ORCID: '' }] }));
    }

    removeClick(i) {
        const values = [...this.state.values];
        values.splice(i, 1);
        this.setState({ values });
    }

    handleSubmit(event) {
        alert('A name was submitted: ' + this.state.values.join(', '));
        event.preventDefault();
    }

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleSubmit = async e => {
        this.setState({ isLoading: true });
        try {
            if (this.state.title && this.state.title.trim() !== '' && this.state.description && this.state.description.trim() !== '') {
                //const contributionIds = getContributionIdsFromUrl(this.props.location.substring(this.props.location.indexOf('?')));
                const relatedIdentifiers = await this.getDOIs(getContributionIdsFromUrl(this.props.location));
                this.createXml(this.state.title, this.state.description, this.state.subject, this.state.values, relatedIdentifiers);
            } else {
                throw Error('Please enter a title and a description');
            }
        } catch (error) {
            console.error(error);
            toast.error(`Error publishing a comparison : ${error.message}`);
            this.setState({ isLoading: false });
        }
        e.preventDefault();
    };

    getDOIs = async contributionIds => {
        let DOIsList = '';
        await Promise.all(
            contributionIds.map(async o => {
                const data = await getStatementsByObject({ id: o });
                const data_1 = await getStatementsBySubjectAndPredicate({
                    subjectId: data[0].subject.id,
                    predicateId: process.env.REACT_APP_PREDICATES_HAS_DOI
                });
                DOIsList = DOIsList.concat(
                    `<relatedIdentifier relationType="IsDerivedFrom" relatedIdentifierType="DOI">${data_1[0].object.label}</relatedIdentifier>\n`
                );
            })
        );

        return DOIsList;
    };

    createXml = (title, description, subject, authors, relatedIdentifiers) => {
        let creators = ``;
        authors.map(author => {
            creators =
                creators +
                `<creator>
                <creatorName nameType="Personal">${author.creator}</creatorName>
                <nameIdentifier schemeURI="http://orcid.org/" nameIdentifierScheme="ORCID">${author.ORCID}</nameIdentifier>
            </creator>`;
        });

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
                   <resource xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://datacite.org/schema/kernel-4" xsi:schemaLocation="http://datacite.org/schema/kernel-4 http://schema.datacite.org/meta/kernel-4.3/metadata.xsd">
                   <identifier identifierType="DOI">${process.env.REACT_APP_DATACITE_TEST_DOI}/${this.props.comparisonId}</identifier>
            <creators>
                ${creators}
            </creators>
            <titles>
                <title xml:lang="en">${title}</title>
            </titles>
            <publisher xml:lang="en">Open Research Knowledge Graph</publisher>
            <publicationYear>${new Date().getFullYear()}</publicationYear>
            <subjects>
                <subject xml:lang="en">${subject}</subject>
            </subjects>
            <language>en</language>
            <resourceType resourceTypeGeneral="Dataset">Comparison</resourceType>
            <relatedIdentifiers>
                ${relatedIdentifiers}
            </relatedIdentifiers>
            <rightsList>
	            <rights rightsURI="https://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License.</rights>
            </rightsList>
            <descriptions>
                <description descriptionType="Abstract">${description}</description>
            </descriptions>
            </resource>`;
        const base64Xml = Buffer.from(xml, 'utf8').toString('base64');
        generateDOIForComparison(this.props.comparisonId, base64Xml, this.props.url);
    };

    render() {
        return (
            <div style={{ width: '150%' }}>
                <Modal size="lg" isOpen={this.props.showDialog} toggle={this.props.toggle}>
                    <ModalHeader toggle={this.props.toggle}>Publish comparison With DOI</ModalHeader>
                    <ModalBody>
                        <Alert color="info">A DOI will be assigned to published comparison and it cannot be changed in future.</Alert>
                        <>
                            {' '}
                            <FormGroup>
                                <Label for="title">
                                    <Tooltip message="Enter the title of the comparison">Title</Tooltip>
                                </Label>
                                <Input type="text" value={this.state.title} name="title" id="title" onChange={this.handleChange} />
                            </FormGroup>
                            <FormGroup>
                                <Label for="description">
                                    <Tooltip message="Describe the goal and what is being compared">Description</Tooltip>
                                </Label>
                                <Input
                                    type="textarea"
                                    value={this.state.description}
                                    name="description"
                                    id="description"
                                    onChange={this.handleChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="subject">
                                    <Tooltip message="Enter a subject of the comparison">Subject</Tooltip>
                                </Label>
                                <Input type="text" name="subject" id="subject" onChange={this.handleChange} />
                            </FormGroup>
                            <FormGroup>
                                <Label style={{ float: 'left' }} for="Creator">
                                    <Tooltip message="Name of the creator">Creator</Tooltip>
                                </Label>
                                <Input
                                    style={{ width: '35%', float: 'left', marginLeft: '10px' }}
                                    type="text"
                                    name="creator"
                                    id="creator"
                                    onChange={e => this.handleChange1(e, 0)}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label style={{ float: 'left', marginLeft: '25px' }} for="ORCID">
                                    <Tooltip message="ORCID of the creator">ORCID</Tooltip>
                                </Label>
                                <Input
                                    style={{ width: '35%', float: 'left', marginLeft: '10px' }}
                                    type="text"
                                    name="ORCID"
                                    id="ORCID"
                                    onChange={e => this.handleChange1(e, 0)}
                                />
                            </FormGroup>
                            <br />
                            {this.createUI()}
                            <div style={{ marginTop: '-22px', float: 'right' }} onClick={this.addClick.bind(this)}>
                                <Tippy content="add contribution">
                                    <span style={{ marginLeft: '30px' }}>
                                        <Icon size="xs" icon={faPlus} />
                                    </span>
                                </Tippy>
                            </div>
                        </>
                    </ModalBody>
                    <ModalFooter>
                        <div className="text-align-center mt-2">
                            {this.props.comparisonId && (
                                <Button color="primary" disabled={this.state.isLoading} onClick={this.handleSubmit}>
                                    {this.state.isLoading && <span className="fa fa-spinner fa-spin" />} Publish
                                </Button>
                            )}
                        </div>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

PublishWithDOI.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
    response_hash: PropTypes.string,
    comparisonId: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    updateComparisonMetadata: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    //viewPaper: state.viewPaper,
});

export default connect(mapStateToProps)(PublishWithDOI);
