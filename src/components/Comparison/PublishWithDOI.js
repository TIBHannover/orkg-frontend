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
            //reference: '',
            comparisonId: '',
            //creator: '',
            subject: '',
            showPublishWithDOIDialog: false,
            //redirect: false,
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

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

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
                                </FormGroup>
                                <FormGroup>
                                    <Label for="persistent_link">DOI</Label>
                                    <Input value={this.state.doi} disabled />
                                </FormGroup>
                            </>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <div className="text-align-center mt-2">
                            {!this.state.doi && (
                                <Button color="danger" disabled={false} onClick={this.handleSubmit}>
                                    {this.state.isLoading && <span className="fa fa-spinner fa-spin" />} Register
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
    showPublishWithDOIDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
    //response_hash: PropTypes.string,
    comparisonId: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    creators: PropTypes.isRequired,
    subject: PropTypes.string
    //updateComparisonMetadata: PropTypes.func.isRequired
};

export default connect()(PublishWithDOI);
