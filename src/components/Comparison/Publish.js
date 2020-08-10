import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Row, Col, Button, Label, FormGroup, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ROUTES from '../../constants/routes.js';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { createResource, createLiteralStatement, createLiteral, getComparison, generateDOIForComparison } from 'network';
import { getContributionIdsFromUrl } from 'utils';
import PublishWithDOI from 'components/Comparison/PublishWithDOI';
import Tippy from '@tippy.js/react';
import { faPlus, faWindowClose } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../Utils/Tooltip';
import queryString from 'query-string';
import { reverse } from 'named-urls';
import { PREDICATES, CLASSES } from 'constants/graphSettings';
import { property } from 'lodash';

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
            values: [{ creator: '', ORCID: '' }],
            doi: '',
            comparisonLink: '',
            //comparisonId: this.props.comparisonId,
            comparisonId: '',
            isPublishedComparison: false,
            isCreatingDOI: false,
            isLoading: false
        };
        //console.log(props.title);
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

                await this.saveCreators(this.state.values, resourceId);
                console.log(this.state.values);
                let link = queryString.parse(this.props.url).response_hash
                    ? this.props.url
                    : this.props.url + `${this.props.url.indexOf('?') !== -1 ? '&response_hash=' : '?response_hash='}${comparison.response_hash}`;
                link = link.substring(link.indexOf('?'));
                const urlResponse = await createLiteral(link);
                console.log(this.props.url);
                await createLiteralStatement(resourceId, PREDICATES.URL, urlResponse.id);

                //console.log(urlResponse.id);
                toast.success('Comparison saved successfully');
                //this.setState({ isLoading: false, comparisonId: resourceId, isPublishedComparison: true });
                const comparisonLink = `${window.location.protocol}//${window.location.host}${window.location.pathname
                    .replace(reverse(ROUTES.COMPARISON, { comparisonId: this.props.comparisonId }), '')
                    .replace(/\/$/, '')}${reverse(ROUTES.COMPARISON, { comparisonId: resourceId })}`;
                this.setState({ isLoading: false, comparisonId: resourceId, comparisonLink: comparisonLink, isPublishedComparison: true });
                //this.props.url=comparisonLink;
                console.log(comparisonLink);
                this.props.updateComparisonMetadata(
                    this.state.title,
                    this.state.description,
                    this.state.reference,
                    this.state.subject,
                    this.state.values,
                    this.state.comparisonLink
                );
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

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type]
        }));
    };

    handlePublishComparison = async e => {
        this.setState({ isCreatingDOI: true });
        try {
            console.log(this.state.comparisonId);
            if (this.state.comparisonId) {
                //console.log(this.props.title);
                if (this.props.title && this.props.title.trim() !== '' && this.props.description && this.props.description.trim() !== '') {
                    const response = await generateDOIForComparison(
                        this.state.comparisonId,
                        this.props.title,
                        this.props.subject,
                        this.props.description,
                        getContributionIdsFromUrl(this.props.url),
                        this.state.values,
                        this.props.url
                    );
                    //console.log(response);
                    this.setState({ isCreatingDOI: false, doi: response.data.attributes.doi });
                    toast.success('DOI has been registered successfully');
                } else {
                    toast.error(`Please enter a title and a description`);
                }
            } else {
                throw Error('Comparison has not been saved in ORKG yet');
            }
        } catch (error) {
            //console.error(error);
            toast.error(`Error publishing a comparison : ${error.message}`);
            this.setState({ isLoading: false });
        }
        e.preventDefault();
    };

    saveCreators = async (creators, resourceId) => {
        creators.map(async c => {
            const creator = await createResource(c.creator, [process.env.REACT_APP_CLASSES_AUTHOR]);
            await createLiteralStatement(resourceId, process.env.REACT_APP_PREDICATES_HAS_AUTHOR, creator.id);
            //console.log(c.creator + ' ' + c.ORCID);
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
        const values = [...this.state.values];
        const { name, value } = event.target;
        values[i][name] = value;
        this.setState({ values });
    };

    handleAddCreator = () => {
        this.setState(prevState => ({ values: [...prevState.values, { creator: '', ORCID: '' }] }));
    };

    handleRemoveCreator = i => {
        const values = [...this.state.values];
        values.splice(i, 1);
        this.setState({ values });
    };

    handleAddButton = () => {
        return (
            <Row>
                <Col md={6}>
                    <Button style={{ fontSize: '14px' }} color="primary" disabled={this.state.isLoading} onClick={this.handleAddCreator.bind(this)}>
                        Add creator
                    </Button>
                </Col>
            </Row>
        );
    };

    renderCreatorsInput() {
        return this.state.values.map((el, i) => (
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

                    {this.state.values.length > 1 && (
                        <Col style={{ marginTop: '39px' }} md={2}>
                            <div onClick={this.handleRemoveCreator.bind(this, i)}>
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
                        {/* {!this.props.comparisonId && !this.state.comparisonId && !this.state.doi && ( */}
                        {console.log(this.state.comparisonId)}
                        {!this.state.comparisonId && !this.state.doi ? (
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
                        ) : (
                            <>
                                <FormGroup>
                                    <Label for="persistent_link">Comparison link</Label>
                                    <Input value={comparisonLink} disabled />
                                </FormGroup>
                            </>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <div>
                            {this.state.comparisonId && 'Comparison has been saved successfully in ORKG.'}
                            {/* <div> */}
                        </div>
                        <div className="text-align-center mt-2">
                            {!this.props.comparisonId && !this.state.comparisonId && (
                                <Button color="primary" disabled={this.state.isLoading} onClick={this.handleSubmit}>
                                    {this.state.isLoading && <span className="fa fa-spinner fa-spin" />} Save
                                </Button>
                            )}{' '}
                            {!this.state.doi && (
                                <Button color="danger" disabled={!this.state.comparisonId} onClick={() => this.toggle('showPublishWithDOIDialog')}>
                                    {this.state.isCreatingDOI && <span className="fa fa-spinner fa-spin" />} Publish
                                </Button>
                            )}
                        </div>
                    </ModalFooter>
                </Modal>

                <PublishWithDOI
                    showPublishWithDOIDialog={this.state.showPublishWithDOIDialog}
                    toggle={() => this.toggle('showPublishWithDOIDialog')}
                    url={this.state.comparisonLink}
                    location={this.props.location}
                    response_hash={this.state.response_hash}
                    comparisonId={this.state.comparisonId}
                    title={this.props.title}
                    description={this.props.description}
                    creators={this.props.authors}
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
    updateComparisonMetadata: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    //viewPaper: state.viewPaper,
});

export default connect()(Publish);
