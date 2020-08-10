import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Input, Button, Label, FormGroup, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { generateDOIForComparison } from 'network';
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
            showPublishWithDOIDialog: false,
            redirect: false,
            doi: '',
            values: [{ creator: '', ORCID: '' }],
            isLoading: false
        };
    }

    componentDidUpdate = prevProps => {
        if (prevProps.title !== this.props.title) {
            this.setState({ title: this.props.title });
        }

        if (prevProps.description !== this.props.description) {
            this.setState({ description: this.props.description });
        }
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

                    <Col style={{ paddingLeft: '30px', marginTop: '39px' }} md={1}>
                        <div onClick={this.handleRemoveCreator.bind(this, i)}>
                            <Tippy content="Delete creator">
                                <span style={{ marginLeft: '10px' }}>
                                    <Icon size="xs" icon={faMinus} />
                                </span>
                            </Tippy>
                        </div>
                    </Col>
                    <Col style={{ marginTop: '39px' }} md={1}>
                        <div style={{}} onClick={this.handleAddCreator.bind(this)}>
                            <Tippy content="Add creator">
                                <span style={{ marginLeft: '10px' }}>
                                    <Icon className="icon" size="sm" icon={faPlus} />
                                </span>
                            </Tippy>
                        </div>
                    </Col>
                </Row>
            </div>
        ));
    }

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
        if (values.length > 1) {
            values.splice(i, 1);
            this.setState({ values });
        }
    };

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    // handleSubmit = async e => {
    //     this.setState({ isLoading: true });
    //     try {
    //         if (this.state.title && this.state.title.trim() !== '' && this.state.description && this.state.description.trim() !== '') {
    //             await generateDOIForComparison(
    //                 this.props.comparisonId,
    //                 this.state.title,
    //                 this.state.subject,
    //                 this.state.description,
    //                 getContributionIdsFromUrl(this.props.location),
    //                 this.state.values,
    //                 this.props.url
    //             );
    //             toast.success('DOI has been registered successfully');
    //             this.navigateToComparison();
    //         } else {
    //             throw Error('Please enter a title and a description');
    //         }
    //     } catch (error) {
    //         console.error(error);
    //         toast.error(`Error publishing a comparison : ${error.message}`);
    //         this.setState({ isLoading: false });
    //     }
    //     e.preventDefault();
    // };

    handleSubmit = async e => {
        this.setState({ isLoading: true });
        try {
            if (this.props.title && this.props.title.trim() !== '' && this.props.description && this.props.description.trim() !== '') {
                console.log(this.props.url);
                console.log(this.props.location);
                const response = await generateDOIForComparison(
                    this.props.comparisonId,
                    this.props.title,
                    this.props.subject,
                    this.props.description,
                    getContributionIdsFromUrl(this.props.location),
                    this.props.creators,
                    this.props.url
                );
                this.setState({ isLoading: false, doi: response.data.attributes.doi });
                toast.success('DOI has been registered successfully');
                //this.navigateToComparison();
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

    navigateToComparison = () => {
        window.location.reload(false);
    };

    render() {
        return (
            <div style={{ width: '150%' }}>
                <Modal isOpen={this.props.showPublishWithDOIDialog} toggle={() => this.props.toggle}>
                    <ModalHeader toggle={() => this.props.toggle}>Publish comparison</ModalHeader>
                    <ModalBody>
                        <Alert color="info">
                            A DOI {process.env.REACT_APP_DATACITE_TEST_DOI}/{this.props.comparisonId} will be assigned to published comparison and it
                            cannot be changed in future. Pressing <i>Register </i> will publish the DOI.
                        </Alert>
                        {this.state.doi && (
                            <>
                                <FormGroup>
                                    <Label for="persistent_link">Comparison link</Label>
                                    <Input value={this.props.url} disabled />
                                    {/* <Input value="" disabled />  */}
                                </FormGroup>
                                <FormGroup>
                                    <Label for="persistent_link">DOI</Label>
                                    <Input value={this.state.doi} disabled />
                                    {/* <Input value="" disabled />  */}
                                </FormGroup>
                            </>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <div className="text-align-center mt-2">
                            {/* <div> */} {/* {console.log(this.state.isPublishedComparison)} */}
                            {!this.state.doi && (
                                <Button color="danger" disabled={false} onClick={this.handleSubmit}>
                                    {this.state.isLoading && <span className="fa fa-spinner fa-spin" />} Register
                                </Button>
                            )}
                        </div>
                    </ModalFooter>
                </Modal>
                {/* <Modal size="lg" isOpen={this.props.showDialog} toggle={this.props.toggle}>
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
                            {this.renderCreatorsInput()}
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
                </Modal> */}
            </div>
        );
    }
}

PublishWithDOI.propTypes = {
    showPublishWithDOIDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
    response_hash: PropTypes.string,
    comparisonId: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    creators: PropTypes.isRequired,
    subject: PropTypes.string,
    updateComparisonMetadata: PropTypes.func.isRequired
};

export default connect()(PublishWithDOI);
