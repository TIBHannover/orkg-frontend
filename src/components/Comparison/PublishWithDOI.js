import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Button, Label, FormGroup, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { generateDOIForComparison } from 'network';
import { getContributionIdsFromUrl } from 'utils';

class PublishWithDOI extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showPublishWithDOIDialog: false,
            doi: '',
            isLoading: false,
            DOIToggle: ''
        };
        this.toggle = this.toggle.bind(this);
    }

    componentDidUpdate = prevProps => {
        if (prevProps.showPublishWithDOIDialog !== this.props.showPublishWithDOIDialog) {
            this.setState({ showPublishWithDOIDialog: true });
        }
    };

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleSubmit = async e => {
        this.setState({ isLoading: true });
        try {
            if (this.props.title && this.props.title.trim() !== '' && this.props.description && this.props.description.trim() !== '') {
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
                this.props.updateDOIState(response.data.attributes.doi);
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

    toggle = () => {
        this.setState({
            showPublishWithDOIDialog: !this.state.showPublishWithDOIDialog
        });
    };

    render() {
        return (
            <Modal isOpen={this.state.showPublishWithDOIDialog} toggle={this.toggle}>
                <ModalHeader toggle={() => this.toggle}>Publish comparison</ModalHeader>
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
                                <Input value={`https://${this.state.doi}`} disabled />
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
                        )}{' '}
                        <Button color="secondary" onClick={this.toggle}>
                            Close
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
        );
    }
}

PublishWithDOI.propTypes = {
    showPublishWithDOIDialog: PropTypes.bool.isRequired,
    DOIToggle: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
    comparisonId: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    creators: PropTypes.isRequired,
    subject: PropTypes.string,
    updateDOIState: PropTypes.func.isRequired
};

export default connect()(PublishWithDOI);
