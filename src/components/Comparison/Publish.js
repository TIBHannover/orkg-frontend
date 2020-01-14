import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Button, Label, FormGroup, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ROUTES from '../../constants/routes.js';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { createResource, createLiteralStatement, createLiteral } from 'network';
import Tooltip from '../Utils/Tooltip';
import queryString from 'query-string';
import { reverse } from 'named-urls';

class Publish extends Component {
    constructor(props) {
        super(props);

        this.state = {
            title: '',
            description: '',
            comparisonId: '',
            isLoading: false,
            redirect: false
        };
    }

    componentDidMount() {}

    componentDidUpdate = prevProps => {};

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleSubmit = async e => {
        this.setState({ isLoading: true });

        try {
            const titleResponse = await createResource(this.state.title, [process.env.REACT_APP_CLASSES_COMPARISON]);
            const resourceId = titleResponse.id;
            const descriptionResponse = await createLiteral(this.state.description);
            const link = queryString.parse(this.props.url).response_hash
                ? this.props.url
                : this.props.url + `${this.props.url.indexOf('?') !== -1 ? '&response_hash=' : '?response_hash='}${this.props.response_hash}`;
            const urlResponse = await createLiteral(link);
            await createLiteralStatement(resourceId, process.env.REACT_APP_PREDICATES_DESCRIPTION, descriptionResponse.id);
            await createLiteralStatement(resourceId, process.env.REACT_APP_PREDICATES_URL, urlResponse.id);
            toast.success('Comparison saved successfully');
            this.setState({ isLoading: false, comparisonId: resourceId });
            this.props.updateComparisonMetadata(this.state.title, this.state.description);
        } catch (error) {
            console.error(error);
            toast.error(`Error publishing a comparison : ${error.message}`);
            this.setState({ isLoading: false });
        }
        e.preventDefault();
    };

    render() {
        const comparisonLink = `${window.location.protocol}//${window.location.host}${reverse(ROUTES.COMPARISON, {
            comparisonId: this.props.comparisonId || this.state.comparisonId
        })}`;

        return (
            <Modal isOpen={this.props.showDialog} toggle={this.props.toggle}>
                <ModalHeader toggle={this.props.toggle}>Publish comparison</ModalHeader>
                <ModalBody>
                    <Alert color="info">
                        A published comparison is made public to other users. The state of the comparison is saved and a persistent link is created.
                    </Alert>
                    {!this.props.comparisonId && !this.state.comparisonId ? (
                        <>
                            {' '}
                            <FormGroup>
                                <Label for="title">
                                    <Tooltip message={'Enter the title of the comparison'}>Title</Tooltip>
                                </Label>
                                <Input type="text" name="title" id="title" onChange={this.handleChange} />
                            </FormGroup>
                            <FormGroup>
                                <Label for="description">
                                    <Tooltip message={'Describe the goal and what is being compared'}>Description</Tooltip>
                                </Label>
                                <Input type="textarea" name="description" id="description" onChange={this.handleChange} />
                            </FormGroup>
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
                    <div className="text-align-center mt-2">
                        {!this.props.comparisonId && !this.state.comparisonId ? (
                            <Button color="primary" disabled={this.state.isLoading} onClick={this.handleSubmit}>
                                {this.state.isLoading && <span className="fa fa-spinner fa-spin" />} Publish
                            </Button>
                        ) : (
                            <CopyToClipboard
                                id="copyToClipboardLatex"
                                text={comparisonLink}
                                onCopy={() => {
                                    this.setState({ showTooltipCopiedLatex: true });
                                }}
                            >
                                <Button color="primary" className="pl-3 pr-3 float-right" size="sm">
                                    <Icon icon={faClipboard} /> Copy to clipboard {/* TODO: show a success message after copy */}
                                </Button>
                            </CopyToClipboard>
                        )}
                    </div>
                </ModalFooter>
            </Modal>
        );
    }
}

Publish.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
    response_hash: PropTypes.string,
    comparisonId: PropTypes.string,
    updateComparisonMetadata: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    //viewPaper: state.viewPaper,
});

export default connect(mapStateToProps)(Publish);
