import { createRef, Component } from 'react';
import { FormGroup, Label, Button, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { sortableContainer, sortableElement, sortableHandle } from 'react-sortable-hoc';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner, faSort, faPen, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import styled, { withTheme, createGlobalStyle } from 'styled-components';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import { getPersonFullNameByORCID } from 'services/ORCID/index';
import arrayMove from 'array-move';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

const AuthorTags = styled.div`
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    flex-direction: column;
    position: relative;
    overflow: hidden;
`;

const AddAuthor = styled(Button)`
    margin: 0 0 2px 0;
    &:hover {
        background-color: #e9ecef;
        color: ${props => props.theme.secondaryDarker};
    }
`;

const StyledDragHandle = styled.div`
    padding: 8px 10px;
    cursor: move;
`;

const AuthorTag = styled.div`
    background-color: #e9ecef;
    display: flex;
    margin: 0 0 4px 0;
    box-sizing: border-box;
    color: rgb(147, 147, 147);
    cursor: pointer;
    border-radius: 12px;
    overflow: hidden;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    &:hover {
        background-color: #ffbdad;
        color: #de350b;
    }

    .name {
        padding: 8px 10px;
        color: #495057;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        box-sizing: border-box;
        flex: 1;
        display: flex;
    }

    .delete {
        padding: 8px 10px;
        align-items: center;
        display: inline-block;
        box-sizing: border-box;
        margin-left: 2px;
        cursor: pointer;
    }

    .delete:hover {
        background-color: #e9ecef;
        color: #de350b;
    }
`;

const GlobalStyle = createGlobalStyle`
    .sortable-helper{
        z-index: 10000 !important;
    }
`;

const SortableItem = sortableElement(({ author, index, authorIndex, editAuthor, removeAuthor, itemLabel }) => (
    <AuthorTag>
        <DragHandle />
        <div
            className="name"
            onClick={e => editAuthor(authorIndex)}
            onKeyDown={e => (e.keyCode === 13 ? editAuthor(authorIndex) : undefined)}
            role="button"
            tabIndex={0}
        >
            {author.label}
            {author.orcid && <Icon style={{ margin: '4px' }} icon={faOrcid} />}
        </div>
        <div
            style={{ padding: '8px' }}
            onClick={e => editAuthor(authorIndex)}
            onKeyDown={e => (e.keyCode === 13 ? editAuthor(authorIndex) : undefined)}
            role="button"
            tabIndex={0}
        >
            <Icon icon={faPen} />
        </div>
        <div
            title={`Delete ${itemLabel}`}
            className="delete"
            onClick={e => removeAuthor(author.id)}
            onKeyDown={e => (e.keyCode === 13 ? removeAuthor(author.id) : undefined)}
            role="button"
            tabIndex={0}
        >
            <Icon icon={faTimes} />
        </div>
    </AuthorTag>
));

const DragHandle = sortableHandle(() => (
    <StyledDragHandle className="ms-2 me-2">
        <Icon icon={faSort} />
    </StyledDragHandle>
));

const SortableContainer = sortableContainer(({ children }) => <AuthorTags>{children}</AuthorTags>);

class AuthorsInput extends Component {
    constructor(props) {
        super(props);

        this.inputRef = createRef();

        this.state = {
            showAuthorForm: false,
            authorInput: '',
            authorAutocompleteLabel: '',
            authorNameLoading: false,
            editMode: false,
            editIndex: 0,
        };
    }

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type],
        }));
    };

    handleChange = selected => {
        if (selected.__isNew__) {
            selected = { ...selected, label: selected.value };
        } else {
            selected = { ...selected, _class: ENTITIES.RESOURCE };
        }
        this.setState({ authorInput: selected });
    };

    isORCID = value => {
        /** Regular expression to check whether an input string is a valid ORCID id.  */
        const ORCID_REGEX = '^\\s*(?:(?:https?://)?orcid.org/)?([0-9]{4})-?([0-9]{4})-?([0-9]{4})-?(([0-9]{4})|([0-9]{3}X))\\s*$';
        const supportedORCID = new RegExp(ORCID_REGEX);
        return Boolean(value && value.replaceAll('−', '-').match(supportedORCID));
    };

    saveAuthor = authorInput => {
        if (authorInput && authorInput.label) {
            if (this.isORCID(authorInput.label)) {
                this.setState({ authorNameLoading: true });
                // Get the full name from ORCID API
                const orcid = authorInput.label.replaceAll('−', '-').match(/([0-9]{4})-?([0-9]{4})-?([0-9]{4})-?(([0-9]{4})|([0-9]{3}X))/g)[0];
                getPersonFullNameByORCID(orcid)
                    .then(authorFullName => {
                        const newAuthor = {
                            label: authorFullName,
                            id: authorFullName,
                            orcid,
                            statementId:
                                this.state.editMode && this.props.value[this.state.editIndex] && this.props.value[this.state.editIndex].statementId
                                    ? this.props.value[this.state.editIndex].statementId
                                    : '',
                        };
                        if (this.state.editMode) {
                            this.props.handler([
                                ...this.props.value.slice(0, this.state.editIndex),
                                newAuthor,
                                ...this.props.value.slice(this.state.editIndex + 1),
                            ]);
                        } else {
                            this.props.handler([...this.props.value, newAuthor]);
                        }
                        this.setState({
                            authorNameLoading: false,
                            authorInput: '',
                            editMode: false,
                        });
                        this.toggle('showAuthorForm');
                    })
                    .catch(e => {
                        this.setState({
                            authorNameLoading: false,
                        });
                        toast.error(`Invalid ORCID ID. Please enter the ${this.props.itemLabel} name`);
                    });
            } else {
                const newAuthor = {
                    ...authorInput,
                    label: authorInput.label,
                    id: authorInput.id ? authorInput.id : authorInput.label, // ID if the Author resource Exist
                    orcid: '',
                    statementId:
                        this.state.editMode && this.props.value[this.state.editIndex] && this.props.value[this.state.editIndex].statementId
                            ? this.props.value[this.state.editIndex].statementId
                            : '',
                };
                if (this.state.editMode) {
                    this.props.handler([
                        ...this.props.value.slice(0, this.state.editIndex),
                        newAuthor,
                        ...this.props.value.slice(this.state.editIndex + 1),
                    ]);
                } else {
                    this.props.handler([...this.props.value, newAuthor]);
                }
                this.setState({ authorInput: '', editMode: false });
                this.toggle('showAuthorForm');
            }
        } else {
            toast.error(`Please enter the ${this.props.itemLabel} name`);
        }
    };

    removeAuthor = key => {
        this.props.handler(this.props.value.filter(a => a.id !== key));
    };

    editAuthor = key => {
        this.setState({
            editIndex: key,
            authorInput: { ...this.props.value[key], label: this.props.value[key].orcid ? this.props.value[key].orcid : this.props.value[key].label },
            editMode: true,
        });
        this.toggle('showAuthorForm');
    };

    onSortEnd = ({ oldIndex, newIndex }) => {
        this.props.handler(arrayMove(this.props.value, oldIndex, newIndex));
    };

    render() {
        return (
            <div className=" clearfix">
                <GlobalStyle />
                <div>
                    {this.props.value.length > 0 && (
                        <SortableContainer
                            useDragHandle
                            helperClass="sortable-helper"
                            onSortEnd={this.onSortEnd}
                            className="clearfix"
                            onClick={this.props.value.length === 0 ? () => this.toggle('showAuthorForm') : undefined}
                            lockAxis="y"
                        >
                            {this.props.value.map((author, index) => (
                                <SortableItem
                                    key={`author-${index}`}
                                    author={author}
                                    index={index}
                                    authorIndex={index}
                                    itemLabel={this.props.itemLabel}
                                    editAuthor={() => this.editAuthor(index)}
                                    removeAuthor={() => this.removeAuthor(author.id)}
                                />
                            ))}
                        </SortableContainer>
                    )}
                </div>
                <div>
                    <AddAuthor
                        id="button-addon2"
                        color="light"
                        className="w-100"
                        onClick={() => {
                            this.setState({ authorNameLoading: false, authorInput: '', editMode: false });
                            this.toggle('showAuthorForm');
                        }}
                    >
                        <Icon icon={faPlus} className="me-2" /> Add {this.props.itemLabel}
                    </AddAuthor>
                </div>
                <Modal onOpened={() => this.inputRef.current.focus()} isOpen={this.state.showAuthorForm} toggle={() => this.toggle('showAuthorForm')}>
                    <ModalHeader toggle={this.toggleVideoDialog}>
                        {this.state.editMode ? `Edit ${this.props.itemLabel}` : `Add ${this.props.itemLabel}`}
                    </ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label for="authorInput">
                                Enter {this.props.itemLabel} name <b>or</b> ORCID <Icon color="#A6CE39" icon={faOrcid} />
                            </Label>
                            <Autocomplete
                                entityType={ENTITIES.RESOURCE}
                                optionsClass={CLASSES.AUTHOR}
                                placeholder="Search for author or enter a new author..."
                                onChange={this.handleChange}
                                value={this.state.authorInput}
                                allowCreate={true}
                                autoLoadOption={false}
                                innerRef={ref => (this.inputRef.current = ref)}
                                inputId="authorInput"
                                onChangeInputValue={value => this.setState({ authorAutocompleteLabel: value })}
                            />
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="light" onClick={() => this.toggle('showAuthorForm')}>
                            Cancel
                        </Button>
                        <Button
                            disabled={this.state.authorNameLoading}
                            color="primary"
                            onClick={() =>
                                this.saveAuthor(this.state.authorInput ? this.state.authorInput : { label: this.state.authorAutocompleteLabel })
                            }
                        >
                            {!this.state.authorNameLoading ? this.state.editMode ? 'Save' : 'Add' : <Icon icon={faSpinner} spin />}
                        </Button>{' '}
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
    itemLabel: PropTypes.string,
};

AuthorsInput.defaultProps = {
    itemLabel: 'author',
};

export default withTheme(AuthorsInput);
