import React, { Component } from 'react';
import { FormGroup, Label, Input, Button, Modal, ModalBody, ModalHeader, ModalFooter, FormFeedback } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import styled, { withTheme } from 'styled-components';
import { submitGetRequest } from 'network';
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
            showAuthorForm: false,
            authorInput: '',
            authorNameLoading: false,
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

    isORCID = value => {
        /** Regular expression to check whether an input string is a valid ORCID id.  */
        let ORCID_REGEX = '^\\s*(?:(?:https?://)?orcid.org/)?([0-9]{4})-?([0-9]{4})-?([0-9]{4})-?([0-9]{4})\\s*$';
        let supportedORCID = new RegExp(ORCID_REGEX);
        return Boolean(value && value.match(supportedORCID));
    };

    getFullname = name => {
        let fullName = name['family-name'] && name['family-name'].value ? name['family-name'].value : '';
        fullName = name['given-names'] && name['given-names'].value ? `${name['given-names'].value} ${fullName}` : fullName;
        return fullName.trim();
    };

    saveAuthor = () => {
        if (this.state.authorInput) {
            if (this.isORCID(this.state.authorInput)) {
                this.setState({ authorNameLoading: true });
                // Get the full name from ORCID API
                let orcid = this.state.authorInput.match(/([0-9]{4})-?([0-9]{4})-?([0-9]{4})-?([0-9]{4})/g)[0];
                let ORCIDLink = 'https://pub.orcid.org/v2.0/' + orcid + '/person';
                submitGetRequest(ORCIDLink, { Accept: 'application/orcid+json' })
                    .then(response => {
                        let authorName = this.getFullname(response.name);
                        const newAuthor = {
                            label: authorName,
                            id: authorName,
                            orcid: orcid,
                            statementId:
                                this.state.editMode && this.props.value[this.state.editIndex] && this.props.value[this.state.editIndex].statementId
                                    ? this.props.value[this.state.editIndex].statementId
                                    : ''
                        };
                        if (this.state.editMode) {
                            this.props.handler([
                                ...this.props.value.slice(0, this.state.editIndex),
                                newAuthor,
                                ...this.props.value.slice(this.state.editIndex + 1)
                            ]);
                        } else {
                            this.props.handler([...this.props.value, newAuthor]);
                        }
                        this.setState({
                            authorNameLoading: false,
                            authorInput: '',
                            errors: null,
                            editMode: false
                        });
                        this.toggle('showAuthorForm');
                    })
                    .catch(e => {
                        this.setState({
                            authorNameLoading: false,
                            errors: { errors: [{ field: 'authorInput', message: 'Invalid ORCID ID. Please enter the author name' }] }
                        });
                    });
            } else {
                const newAuthor = {
                    label: this.state.authorInput,
                    id: this.state.authorInput,
                    orcid: '',
                    statementId:
                        this.state.editMode && this.props.value[this.state.editIndex] && this.props.value[this.state.editIndex].statementId
                            ? this.props.value[this.state.editIndex].statementId
                            : ''
                };
                if (this.state.editMode) {
                    this.props.handler([
                        ...this.props.value.slice(0, this.state.editIndex),
                        newAuthor,
                        ...this.props.value.slice(this.state.editIndex + 1)
                    ]);
                } else {
                    this.props.handler([...this.props.value, newAuthor]);
                }
                this.setState({ authorInput: '', errors: null, editMode: false });
                this.toggle('showAuthorForm');
            }
        } else {
            this.setState({ errors: { errors: [{ field: 'authorInput', message: 'Please enter the author name' }] } });
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
            authorInput: this.props.value[key].orcid ? this.props.value[key].orcid : this.props.value[key].label,
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
                                    <AuthorTag key={`author-${index}`}>
                                        <div className={'name'} onClick={e => this.editAuthor(index)}>
                                            {author.label}
                                            {author.orcid && <Icon style={{ margin: '4px 2px 0' }} icon={faOrcid} />}
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
                            <Label for="authorInput">
                                Name <b>or</b> ORCID <Icon color={'#A6CE39'} icon={faOrcid} />
                            </Label>
                            <Input
                                onChange={this.handleChange}
                                type="text"
                                name="authorInput"
                                id="authorInput"
                                placeholder="Enter author name or ORCID"
                                value={this.state.authorInput}
                                invalid={Boolean(get_error_message(this.state.errors, 'authorInput'))}
                            />
                            {Boolean(get_error_message(this.state.errors, 'authorInput')) && (
                                <FormFeedback>{get_error_message(this.state.errors, 'authorInput')}</FormFeedback>
                            )}
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button disabled={this.state.authorNameLoading} color="primary" onClick={() => this.saveAuthor()}>
                            {!this.state.authorNameLoading ? this.state.editMode ? 'Save' : 'Add' : <Icon icon={faSpinner} spin />}
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
