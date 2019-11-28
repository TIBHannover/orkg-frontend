import React, { Component } from 'react';
import { FormGroup, Label, Input, Button, Modal, ModalBody, ModalHeader, ModalFooter, FormFeedback } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import styled, { withTheme } from 'styled-components';
import { get_error_message } from 'utils';
import PropTypes from 'prop-types';

const AuthorTags = styled.div`
    align-items: center;
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    padding: 2px 8px 2px 8px;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    background-color: #f7f7f7;
    background-clip: padding-box;
    border: 2px solid#ced4da;
    border-top-left-radius: 12px;
    border-bottom-left-radius: 12px;
    cursor: default;
`;

const AuthorTag = styled.div`
    background-color: rgb(232, 97, 97);
    border-radius: 999px;
    display: flex;
    margin: 0 0 2px 2px;
    min-width: 0;
    box-sizing: border-box;
    color: #fff;
    font-size: 90%;
    border-radius: 2px;
    color: #fff;
    border-radius: 999px;

    .name {
        border-radius: 2px;
        color: rgb(255, 255, 255);
        font-size: 85%;
        overflow: hidden;
        padding: 2px 2px 2px 6px;
        text-overflow: ellipsis;
        white-space: nowrap;
        box-sizing: border-box;
    }
    .name:hover {
        background-color: #ffbdad;
        color: #de350b;
        border-bottom-left-radius: 999px;
        border-top-left-radius: 999px;
    }
    .delete {
        margin-left: 5px;
        align-items: center;
        border-radius: 0 999px 999px 0;
        display: inline-block;
        padding-left: 4px;
        padding-right: 5px;
        box-sizing: border-box;
        margin-left: 2px;
        cursor: pointer;
    }

    .delete:hover {
        background-color: #ffbdad;
        color: #de350b;
    }
`;

class AuthorsInput extends Component {
    constructor(props) {
        super(props);

        this.state = {
            authors: [],
            inputValue: '',
            showAuthorForm: false,
            authorName: '',
            authorORCID: '',
            errors: null,
            editMode: false,
            editIndex: 0
        };
    }

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type]
        }));
    };

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    validateForm = () => {
        /** Regular expression to check whether an input string is a valid ORCID id.  */
        let ORCID_REGEX = '^\\s*(?:(?:https?://)?orcid.org/)?([0-9]{4})-?([0-9]{4})-?([0-9]{4})-?([0-9]{4})\\s*$';
        let supportedORCID = new RegExp(ORCID_REGEX);
        let errors = [];
        if (this.state.authorORCID && !this.state.authorORCID.match(supportedORCID)) {
            errors.push({ field: 'authorORCID', message: 'Invalid ORCID ID' });
        }
        if (!this.state.authorName) {
            errors.push({ field: 'authorName', message: 'Please enter the author name' });
        }
        return errors;
    };

    addAuthor = () => {
        let errors = this.validateForm();
        if (errors.length === 0) {
            const newAuthor = {
                label: this.state.authorName,
                id: this.state.authorName,
                orcid: this.state.authorORCID
            };
            this.setState({ authorName: '', authorORCID: '', errors: null, editMode: false });
            this.props.handler([...this.props.value, newAuthor]);
            this.toggle('showAuthorForm');
        } else {
            this.setState({ errors: { errors: errors } });
        }
    };

    saveAuthor = () => {
        let errors = this.validateForm();
        if (errors.length === 0) {
            const updatedAuthor = {
                label: this.state.authorName,
                id: this.state.authorName,
                orcid: this.state.authorORCID
            };
            this.setState({ authorName: '', authorORCID: '', errors: null, editMode: false });
            this.props.handler([
                ...this.props.value.slice(0, this.state.editIndex),
                updatedAuthor,
                ...this.props.value.slice(this.state.editIndex + 1)
            ]);
            this.toggle('showAuthorForm');
        } else {
            this.setState({ errors: { errors: errors } });
        }
    };

    removeAuthor = key => {
        this.props.handler(
            this.props.value.filter(a => {
                return a.id !== key;
            })
        );
    };

    editAuthor = key => {
        this.setState({
            editIndex: key,
            authorName: this.props.value[key].label,
            authorORCID: this.props.value[key].orcid,
            errors: null,
            editMode: true
        });
        this.toggle('showAuthorForm');
    };

    render() {
        return (
            <div className={' clearfix'}>
                <div className="input-group mb-3">
                    <AuthorTags className={'clearfix'} onClick={this.props.value.length === 0 ? () => this.toggle('showAuthorForm') : undefined}>
                        {this.props.value.length > 0 ? (
                            this.props.value.map((author, index) => {
                                return (
                                    <AuthorTag>
                                        <div className={'name'} onClick={e => this.editAuthor(index)}>
                                            {author.label}
                                            {author.orcid && <Icon style={{ margin: '2px' }} icon={faOrcid} />}
                                        </div>
                                        <div className={'delete'} onClick={e => this.removeAuthor(author.id)}>
                                            <Icon icon={faTimes} />
                                        </div>
                                    </AuthorTag>
                                );
                            })
                        ) : (
                            <div>{this.state.editMode ? 'Edit author' : 'Add author'}</div>
                        )}
                    </AuthorTags>

                    <div className="input-group-append">
                        <button
                            className="btn btn-outline-primary"
                            type="button"
                            id="button-addon2"
                            onClick={() => {
                                this.setState({ authorName: '', authorORCID: '', errors: null, editMode: false });
                                this.toggle('showAuthorForm');
                            }}
                        >
                            Add author
                        </button>
                    </div>
                </div>

                <Modal isOpen={this.state.showAuthorForm} toggle={() => this.toggle('showAuthorForm')}>
                    <ModalHeader toggle={this.toggleVideoDialog}>{this.state.editMode ? 'Edit author' : 'Add author'}</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label for="authorName">Name</Label>
                            <Input
                                onChange={this.handleChange}
                                type="text"
                                name="authorName"
                                id="authorName"
                                placeholder="Enter author name"
                                value={this.state.authorName}
                                invalid={Boolean(get_error_message(this.state.errors, 'authorName'))}
                            />
                            {Boolean(get_error_message(this.state.errors, 'authorName')) && (
                                <FormFeedback>{get_error_message(this.state.errors, 'authorName')}</FormFeedback>
                            )}
                        </FormGroup>
                        <FormGroup>
                            <Label for="authorORCID">ORCID (optional)</Label>
                            <Input
                                onChange={this.handleChange}
                                type="text"
                                name="authorORCID"
                                id="authorORCID"
                                placeholder="Enter author ORCID"
                                value={this.state.authorORCID}
                                invalid={Boolean(get_error_message(this.state.errors, 'authorORCID'))}
                            />
                            {Boolean(get_error_message(this.state.errors, 'authorORCID')) && (
                                <FormFeedback>{get_error_message(this.state.errors, 'authorORCID')}</FormFeedback>
                            )}
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => (this.state.editMode ? this.saveAuthor() : this.addAuthor())}>
                            {this.state.editMode ? 'Save' : 'Add'}
                        </Button>{' '}
                        <Button color="secondary" onClick={() => this.toggle('showAuthorForm')}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

AuthorsInput.propTypes = {
    handler: PropTypes.func.isRequired,
    value: PropTypes.array.isRequired,
    theme: PropTypes.object.isRequired
};

export default withTheme(AuthorsInput);
