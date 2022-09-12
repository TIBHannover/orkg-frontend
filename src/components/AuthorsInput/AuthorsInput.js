import { useState, useRef } from 'react';
import { FormGroup, Label, Button, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { sortableContainer, sortableElement, sortableHandle } from 'react-sortable-hoc';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner, faSort, faPen, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import REGEX from 'constants/regex';
import getPersonFullNameByORCID from 'services/ORCID/index';
import arrayMove from 'array-move';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { AuthorTag, AuthorTags, AddAuthor, StyledDragHandle, GlobalStyle } from './styled';

const SortableItem = sortableElement(({ author, index, authorIndex, editAuthor, removeAuthor, itemLabel }) => (
    <AuthorTag>
        <DragHandle />
        <div
            className="name"
            onClick={() => editAuthor(authorIndex)}
            onKeyDown={e => (e.key === 'Enter' ? editAuthor(authorIndex) : undefined)}
            role="button"
            tabIndex={0}
        >
            {author.label}
            {author.orcid && <Icon style={{ margin: '4px' }} icon={faOrcid} />}
        </div>
        <div
            style={{ padding: '8px' }}
            onClick={() => editAuthor(authorIndex)}
            onKeyDown={e => (e.key === 'Enter' ? editAuthor(authorIndex) : undefined)}
            role="button"
            tabIndex={0}
        >
            <Icon icon={faPen} />
        </div>
        <div
            title={`Delete ${itemLabel}`}
            className="delete"
            onClick={() => removeAuthor(author.id)}
            onKeyDown={e => (e.key === 'Enter' ? removeAuthor(author.id) : undefined)}
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

function AuthorsInput(props) {
    const [showAuthorForm, setShowAuthorForm] = useState(false);
    const [authorInput, setAuthorInput] = useState('');
    const [authorAutocompleteLabel, setAuthorAutocompleteLabel] = useState('');
    const [authorNameLoading, setAuthorNameLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editIndex, setEditIndex] = useState(0);
    const inputRef = useRef(null);

    const handleChange = selected => {
        let v;
        if (selected.__isNew__) {
            v = { ...selected, label: selected.value };
        } else {
            v = { ...selected, _class: ENTITIES.RESOURCE };
        }
        setAuthorInput(v);
    };

    const isORCID = value => Boolean(value && value.replaceAll('−', '-').match(REGEX.ORCID_URL));
    const saveAuthor = _authorInput => {
        if (_authorInput && _authorInput.label) {
            if (isORCID(_authorInput.label)) {
                setAuthorNameLoading(true);
                // Get the full name from ORCID API
                const orcid = _authorInput.label.replaceAll('−', '-').match(REGEX.ORCID)[0];
                getPersonFullNameByORCID(orcid)
                    .then(authorFullName => {
                        const newAuthor = {
                            label: authorFullName,
                            id: authorFullName,
                            orcid,
                            statementId:
                                editMode && props.value[editIndex] && props.value[editIndex].statementId ? props.value[editIndex].statementId : '',
                        };
                        if (editMode) {
                            props.handler([...props.value.slice(0, editIndex), newAuthor, ...props.value.slice(editIndex + 1)]);
                        } else {
                            props.handler([...props.value, newAuthor]);
                        }

                        setAuthorNameLoading(false);
                        setAuthorInput('');
                        setEditMode(false);
                        setShowAuthorForm(v => !v);
                    })
                    .catch(() => {
                        setAuthorNameLoading(false);
                        toast.error(`Invalid ORCID ID. Please enter the ${props.itemLabel} name`);
                    });
            } else {
                const newAuthor = {
                    ..._authorInput,
                    label: _authorInput.label,
                    id: _authorInput.id ? _authorInput.id : _authorInput.label, // ID if the Author resource Exist
                    orcid: '',
                    statementId: editMode && props.value[editIndex] && props.value[editIndex].statementId ? props.value[editIndex].statementId : '',
                };
                if (editMode) {
                    props.handler([...props.value.slice(0, editIndex), newAuthor, ...props.value.slice(editIndex + 1)]);
                } else {
                    props.handler([...props.value, newAuthor]);
                }
                setAuthorInput('');
                setEditMode(false);
                setShowAuthorForm(v => !v);
            }
        } else {
            toast.error(`Please enter the ${props.itemLabel} name`);
        }
    };

    const removeAuthor = key => {
        props.handler(props.value.filter(a => a.id !== key));
    };

    const editAuthor = key => {
        setEditIndex(key);
        setAuthorInput({ ...props.value[key], label: props.value[key].orcid ? props.value[key].orcid : props.value[key].label });
        setEditMode(true);
        setShowAuthorForm(v => !v);
    };

    const onSortEnd = ({ oldIndex, newIndex }) => {
        props.handler(arrayMove(props.value, oldIndex, newIndex));
    };

    return (
        <div className=" clearfix">
            <GlobalStyle />
            <div>
                {props.value.length > 0 && (
                    <SortableContainer
                        useDragHandle
                        helperClass="sortable-helper"
                        onSortEnd={onSortEnd}
                        className="clearfix"
                        onClick={props.value.length === 0 ? () => setShowAuthorForm(v => !v) : undefined}
                        lockAxis="y"
                    >
                        {props.value.map((author, index) => (
                            <SortableItem
                                key={`author-${index}`}
                                author={author}
                                index={index}
                                authorIndex={index}
                                itemLabel={props.itemLabel}
                                editAuthor={() => editAuthor(index)}
                                removeAuthor={() => removeAuthor(author.id)}
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
                        setAuthorNameLoading(false);
                        setAuthorInput('');
                        setEditMode(false);
                        setShowAuthorForm(v => !v);
                    }}
                >
                    <Icon icon={faPlus} className="me-2" /> Add {props.itemLabel}
                </AddAuthor>
            </div>
            <Modal onOpened={() => inputRef?.current?.focus()} isOpen={showAuthorForm} toggle={() => setShowAuthorForm(v => !v)}>
                <ModalHeader>{editMode ? `Edit ${props.itemLabel}` : `Add ${props.itemLabel}`}</ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label for="authorInput">
                            Enter {props.itemLabel} name <b>or</b> ORCID <Icon color="#A6CE39" icon={faOrcid} />
                        </Label>
                        <Autocomplete
                            entityType={ENTITIES.RESOURCE}
                            optionsClass={CLASSES.AUTHOR}
                            placeholder="Search for author or enter a new author..."
                            onChange={handleChange}
                            value={authorInput}
                            allowCreate={true}
                            autoLoadOption={false}
                            innerRef={inputRef}
                            inputId="authorInput"
                            onChangeInputValue={value => setAuthorAutocompleteLabel(value)}
                            ols={false}
                        />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="light" onClick={() => setShowAuthorForm(v => !v)}>
                        Cancel
                    </Button>
                    <Button
                        disabled={authorNameLoading}
                        color="primary"
                        onClick={() => saveAuthor(authorInput || { label: authorAutocompleteLabel })}
                    >
                        {!authorNameLoading && editMode && 'Save'}
                        {!authorNameLoading && !editMode && 'Add'}
                        {authorNameLoading && <Icon icon={faSpinner} spin />}
                    </Button>{' '}
                </ModalFooter>
            </Modal>
        </div>
    );
}

AuthorsInput.propTypes = {
    handler: PropTypes.func.isRequired,
    value: PropTypes.array.isRequired,
    itemLabel: PropTypes.string,
};

AuthorsInput.defaultProps = {
    itemLabel: 'author',
};

export default AuthorsInput;
