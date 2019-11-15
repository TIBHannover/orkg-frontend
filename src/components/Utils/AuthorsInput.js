import React, { Component } from 'react';
import { FormGroup, Label, Input, Button, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import styled, { withTheme } from 'styled-components'
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
    background-color:#F7F7F7;
    background-clip: padding-box;
    border: 2px solid#ced4da;
    border-top-left-radius: 12px;
    border-bottom-left-radius: 12px;
    cursor: default;
`

const AuthorTag = styled.div`
    background-color:rgb(232,97,97);
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

    .name{
        border-radius: 2px;
        color:rgb(255, 255, 255);
        font-size: 85%;
        overflow: hidden;
        padding: 2px 2px 2px 6px;
        text-overflow: ellipsis;
        white-space: nowrap;
        box-sizing: border-box;
    }
    .delete{
        margin-left:5px;
        align-items: center;
        border-radius: 0 999px 999px 0;
        display: inline-block;
        padding-left: 4px;
        padding-right: 5px;
        box-sizing: border-box;
        margin-left: 2px;
        cursor: pointer;
    }

    .delete:hover{
        background-color:#FFBDAD;
        color:#DE350B;
    }
`


class AuthorsInput extends Component {

    constructor(props) {
        super(props)

        this.state = {
            authors: [],
            inputValue: '',
            showAuthorForm: false,
            authorName: '',
            authorORCID: ''
        }
    }

    toggle = (type) => {
        this.setState((prevState) => ({
            [type]: !prevState[type],
        }));
    };

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    }

    addAuthor = () => {
        const newAuthor = {
            label: this.state.authorName,
            id: this.state.authorName,
            orcid: this.state.authorORCID
        };
        this.setState({ authorName: '', authorORCID: '', });
        this.props.handler([...this.props.value, newAuthor])
        this.toggle('showAuthorForm')

    };

    removeAuthor = (key) => {
        this.props.handler(this.props.value.filter(a => {
            return a.id !== key;
        }))
    };

    render() {

        return (
            <div className={' clearfix'}>

                <div className="input-group mb-3">
                    <AuthorTags className={'clearfix'} onClick={this.props.value.length === 0 ? () => this.toggle('showAuthorForm') : undefined}>
                        {this.props.value.length > 0 ?
                            this.props.value.map((author) => {
                                return (
                                    <AuthorTag>
                                        <div className={'name'}>{author.label}</div>
                                        <div className={'delete'} onClick={(e) => this.removeAuthor(author.id)}>
                                            <Icon icon={faTimes} />
                                        </div>
                                    </AuthorTag>
                                )
                            })
                            : <div >Add author</div>
                        }
                    </AuthorTags>

                    <div className="input-group-append">
                        <button className="btn btn-outline-primary" type="button" id="button-addon2" onClick={() => this.toggle('showAuthorForm')}>Add author</button>
                    </div>
                </div>

                <Modal isOpen={this.state.showAuthorForm} toggle={() => this.toggle('showAuthorForm')}>
                    <ModalHeader toggle={this.toggleVideoDialog}>Add author</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label for="authorName">Name</Label>
                            <Input onChange={this.handleChange} type="text" name="authorName" id="authorName" placeholder="Enter author name" />
                        </FormGroup>
                        <FormGroup>
                            <Label for="authorORCID">ORCID (optional)</Label>
                            <Input onChange={this.handleChange} type="text" name="authorORCID" id="authorORCID" placeholder="Enter author ORCID" />
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => this.addAuthor()}>Add</Button>{' '}
                        <Button color="secondary" onClick={() => this.toggle('showAuthorForm')}>Cancel</Button>
                    </ModalFooter>
                </Modal>

            </div>
        );

    }
}

AuthorsInput.propTypes = {
    handler: PropTypes.func.isRequired,
    value: PropTypes.array.isRequired,
    theme: PropTypes.object.isRequired,
}

export default withTheme(AuthorsInput);