import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Row, Col, Button, Label, FormGroup, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import ROUTES from '../../constants/routes.js';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { createResource, createLiteralStatement, createLiteral, getComparison, generateDOIForComparison } from 'network';
import { getContributionIdsFromUrl, filterObjectOfStatementsByPredicate } from 'utils';
import PublishWithDOI from 'components/Comparison/PublishWithDOI';
import Tippy from '@tippy.js/react';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../Utils/Tooltip';
import queryString from 'query-string';
import { reverse } from 'named-urls';
import { PREDICATES, CLASSES } from 'constants/graphSettings';

class Publish extends Component {
    constructor(props) {
        super(props);

        this.state = {
            title: '',
            description: '',
            reference: '',
            isWarningModalOpen: false,
            showPublishWithDOIDialog: false,
            creator: '',
            subject: this.props.subject,
            redirect: false,
            creators: [{ creator: '', ORCID: '' }],
            doi: '',
            comparisonLink: '',
            comparisonId: '',
            isPublishedComparison: false,
            isCreatingDOI: false,
            isLoading: false,
            hasCreator: false
        };
    }

    componentWillReceiveProps(props) {
        if (this.state.comparisonId === '') {
            this.setState({ comparisonId: props.comparisonId, comparisonLink: props.url });
        }
    }

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleSubmit = async e => {
        this.setState({ isLoading: true });
        try {
            if (this.state.title && this.state.title.trim() !== '' && this.state.description && this.state.description.trim() !== '') {
                const contributionIds = getContributionIdsFromUrl(this.props.url.substring(this.props.url.indexOf('?')));
                const comparison = await getComparison({ contributionIds: contributionIds, save_response: true });
                const titleResponse = await createResource(this.state.title, [CLASSES.COMPARISON]);
                const resourceId = titleResponse.id;
                const descriptionResponse = await createLiteral(this.state.description);
                await createLiteralStatement(resourceId, PREDICATES.DESCRIPTION, descriptionResponse.id);
                if (this.state.reference && this.state.reference.trim() !== '') {
                    const referenceResponse = await createLiteral(this.state.reference);
                    await createLiteralStatement(resourceId, PREDICATES.REFERENCE, referenceResponse.id);
                }

                await this.saveCreators(this.state.creators, resourceId);
                let link = queryString.parse(this.props.url).response_hash
                    ? this.props.url
                    : this.props.url + `${this.props.url.indexOf('?') !== -1 ? '&response_hash=' : '?response_hash='}${comparison.response_hash}`;
                link = link.substring(link.indexOf('?'));
                const urlResponse = await createLiteral(link);
                await createLiteralStatement(resourceId, PREDICATES.URL, urlResponse.id);

                toast.success('Comparison saved successfully');
                const comparisonLink = `${window.location.protocol}//${window.location.host}${window.location.pathname
                    .replace(reverse(ROUTES.COMPARISON, { comparisonId: this.props.comparisonId }), '')
                    .replace(/\/$/, '')}${reverse(ROUTES.COMPARISON, { comparisonId: resourceId })}`;
                this.setState({
                    isLoading: false,
                    comparisonId: resourceId,
                    comparisonLink: comparisonLink,
                    isPublishedComparison: true,
                    hasCreator: true
                });
                this.props.updateComparisonMetadata(
                    this.state.title,
                    this.state.description,
                    this.state.reference,
                    this.state.subject,
                    this.state.creators,
                    this.state.comparisonLink
                );
            } else {
                throw Error('Please enter a title and a description');
            }
        } catch (error) {
            toast.error(`Error publishing a comparison : ${error.message}`);
            this.setState({ isLoading: false });
        }
        e.preventDefault();
    };

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type]
        }));
    };

    publishComparison = async e => {
        this.setState({ isCreatingDOI: true });
        try {
            if (this.state.comparisonId && this.props.authors.length === 0) {
                await this.saveCreators(this.state.creators, this.state.comparisonId);
            }
            this.toggle('showPublishWithDOIDialog');
        } catch (error) {
            toast.error(`Error publishing a comparison : ${error.message}`);
            this.setState({ isCreatingDOI: false });
        }
        e.preventDefault();
    };

    saveCreators = async (creators, resourceId) => {
        creators.map(async c => {
            const creator = await createResource(c.creator, [process.env.REACT_APP_CLASSES_AUTHOR]);
            await createLiteralStatement(resourceId, process.env.REACT_APP_PREDICATES_HAS_AUTHOR, creator.id);
            if (c.ORCID !== '') {
                const ORCID = await createLiteral(c.ORCID);
                await createLiteralStatement(creator.id, process.env.REACT_APP_PREDICATES_HAS_ORCID, ORCID.id);
            }
        });
    };

    navigateToComparison = () => {
        window.location.reload(false);
    };

    handleChangeCreator = (event, i) => {
        const creators = [...this.state.creators];
        const { name, value } = event.target;
        creators[i][name] = value;
        this.setState({ creators });
    };

    handleAddCreator = () => {
        this.setState(prevState => ({ creators: [...prevState.creators, { creator: '', ORCID: '' }] }));
    };

    handleRemoveCreator = i => {
        const creators = [...this.state.creators];
        creators.splice(i, 1);
        this.setState({ creators });
    };

    handleAddButton = () => {
        return (
            <Row>
                <Col md={6}>
                    <Button style={{ fontSize: '14px' }} color="primary" disabled={this.state.isLoading} onClick={() => this.handleAddCreator(this)}>
                        Add creator
                    </Button>
                </Col>
            </Row>
        );
    };

    renderCreatorsInput() {
        return this.state.creators.map((el, i) => (
            <div key={i}>
                <Row form>
                    <Col md={5}>
                        <FormGroup>
                            <Label for="Creator">
                                <Tooltip message="Name of the creator">Creator</Tooltip>
                            </Label>
                            <Input type="text" value={el.creator || ''} name="creator" id="creator" onChange={e => this.handleChangeCreator(e, i)} />
                        </FormGroup>
                    </Col>
                    <Col md={5}>
                        <FormGroup>
                            <Label for="ORCID">
                                <Tooltip message="ORCID of the creator">ORCID</Tooltip>
                            </Label>
                            <Input type="text" value={el.ORCID || ''} name="ORCID" id="ORCID" onChange={e => this.handleChangeCreator(e, i)} />
                        </FormGroup>
                    </Col>

                    {this.state.creators.length > 1 && (
                        <Col style={{ marginTop: '39px' }} md={2}>
                            <div onClick={() => this.handleRemoveCreator(i)}>
                                <Tippy content="Delete creator">
                                    <span style={{ marginLeft: '10px' }}>
                                        <Icon size="xs" icon={faWindowClose} />
                                    </span>
                                </Tippy>
                            </div>
                        </Col>
                    )}
                </Row>
            </div>
        ));
    }

    render() {
        const comparisonLink = `${window.location.protocol}//${window.location.host}${window.location.pathname
            .replace(reverse(ROUTES.COMPARISON, { comparisonId: this.props.comparisonId }), '')
            .replace(/\/$/, '')}${reverse(ROUTES.COMPARISON, { comparisonId: this.props.comparisonId || this.state.comparisonId })}`;

        return (
            <div style={{ width: '150%' }}>
                <Modal size="lg" isOpen={this.props.showDialog} toggle={this.props.toggle}>
                    <ModalHeader toggle={this.props.toggle}>Publish comparison</ModalHeader>
                    <ModalBody>
                        <Alert color="info">
                            A published comparison is made public to other users. The state of the comparison is saved and a persistent link is
                            created.
                        </Alert>
                        {!this.state.comparisonId && !this.state.doi && (
                            <>
                                {' '}
                                <FormGroup>
                                    <Label for="title">
                                        <Tooltip message="Enter the title of the comparison">Title</Tooltip>
                                    </Label>
                                    <Input type="text" name="title" id="title" onChange={this.handleChange} />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="description">
                                        <Tooltip message="Describe the goal and what is being compared">Description</Tooltip>
                                    </Label>
                                    <Input type="textarea" name="description" id="description" onChange={this.handleChange} />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="reference">
                                        <Tooltip message="Enter a reference to the paper from which the comparison is generated">
                                            Reference (optional)
                                        </Tooltip>
                                    </Label>
                                    <Input type="text" name="reference" id="reference" onChange={this.handleChange} />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="subject">
                                        <Tooltip message="Enter a subject of the comparison">Subject</Tooltip>
                                    </Label>
                                    <Input type="text" name="subject" id="subject" onChange={this.handleChange} />
                                </FormGroup>
                                {this.renderCreatorsInput()}
                                {this.handleAddButton()}
                            </>
                        )}
                        {this.state.comparisonId && !this.props.doi && this.props.authors.length === 0 && (
                            <>
                                {' '}
                                <FormGroup>
                                    <Label for="title">
                                        <Tooltip message="Enter the title of the comparison">Title</Tooltip>
                                    </Label>
                                    <Input type="text" value={this.props.title} disabled name="title" id="title" onChange={this.handleChange} />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="description">
                                        <Tooltip message="Describe the goal and what is being compared">Description</Tooltip>
                                    </Label>
                                    <Input
                                        type="textarea"
                                        name="description"
                                        value={this.props.description}
                                        disabled
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
                                {this.renderCreatorsInput()}
                                {this.handleAddButton()}
                            </>
                        )}
                        <>
                            {this.state.comparisonId && this.props.authors.length > 0 && (
                                <FormGroup>
                                    <Label for="persistent_link">Comparison link</Label>
                                    <Input value={comparisonLink} disabled />
                                </FormGroup>
                            )}
                            {this.props.doi && (
                                <FormGroup>
                                    <Label for="persistent_link">DOI</Label>
                                    <Input value={this.props.doi} disabled />
                                </FormGroup>
                            )}
                        </>
                    </ModalBody>
                    <ModalFooter>
                        <div>{this.state.comparisonId && !this.props.comparisonId && 'Comparison has been saved successfully in ORKG.'}</div>
                        <div className="text-align-center mt-2">
                            {!this.props.comparisonId && !this.state.comparisonId && (
                                <Button color="primary" disabled={this.state.isLoading} onClick={this.handleSubmit}>
                                    {this.state.isLoading && <span className="fa fa-spinner fa-spin" />} Save
                                </Button>
                            )}{' '}
                            {!this.state.doi && !this.props.doi && (
                                // <Button color="danger" disabled={!this.state.comparisonId} onClick={() => this.toggle('showPublishWithDOIDialog')}>
                                <Button color="danger" disabled={!this.state.comparisonId} onClick={this.publishComparison}>
                                    {this.state.isCreatingDOI && <span className="fa fa-spinner fa-spin" />} Publish
                                </Button>
                            )}
                        </div>
                    </ModalFooter>
                </Modal>

                <PublishWithDOI
                    showPublishWithDOIDialog={this.state.showPublishWithDOIDialog}
                    DOIToggle={() => this.toggle('showPublishWithDOIDialog')}
                    url={this.state.comparisonLink}
                    location={this.props.location}
                    response_hash={this.state.response_hash}
                    comparisonId={this.state.comparisonId}
                    title={this.props.title}
                    description={this.props.description}
                    creators={this.props.authors.length > 0 ? this.props.authors : this.state.creators}
                    subject={this.props.subject}
                    updateComparisonMetadata={this.updateComparisonMetadata}
                />
            </div>
        );
    }
}

Publish.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
    response_hash: PropTypes.string,
    comparisonId: PropTypes.string,
    title: PropTypes.string,
    subject: PropTypes.string,
    description: PropTypes.string,
    location: PropTypes.string.isRequired,
    authors: PropTypes.isRequired,
    doi: PropTypes.string,
    updateComparisonMetadata: PropTypes.func.isRequired
};

export default connect()(Publish);
