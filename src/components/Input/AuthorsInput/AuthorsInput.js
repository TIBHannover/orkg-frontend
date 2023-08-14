import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import arrayMove from 'array-move';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import SortableAuthorItem from 'components/Input/AuthorsInput/SortableAuthorItem';
import { AddAuthor, AuthorTags, GlobalStyle } from 'components/Input/AuthorsInput/styled';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import REGEX from 'constants/regex';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, FormGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import getPersonFullNameByORCID from 'services/ORCID/index';

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
                    ...(!_authorInput.id ? { __isNew__: true } : {}),
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

    const handleUpdate = ({ dragIndex, hoverIndex }) => {
        props.handler(arrayMove(props.value, dragIndex, hoverIndex));
    };

    return (
        <div className=" clearfix">
            <GlobalStyle />
            <div>
                {props.value.length > 0 && (
                    <AuthorTags onClick={props.value.length === 0 && !props.isDisabled ? () => setShowAuthorForm(v => !v) : undefined}>
                        {props.value.map((author, index) => (
                            <SortableAuthorItem
                                key={`author-${index}`}
                                author={author}
                                authorIndex={index}
                                itemLabel={props.itemLabel}
                                editAuthor={() => editAuthor(index)}
                                removeAuthor={() => removeAuthor(author.id)}
                                handleUpdate={handleUpdate}
                                isDisabled={props.isDisabled}
                            />
                        ))}
                    </AuthorTags>
                )}
            </div>
            <div>
                <AddAuthor
                    disabled={props.isDisabled}
                    id={props.buttonId}
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
                    <ButtonWithLoading isLoading={authorNameLoading} color="primary" onClick={() => saveAuthor(authorInput)}>
                        {editMode && 'Save'}
                        {!editMode && 'Add'}
                    </ButtonWithLoading>
                </ModalFooter>
            </Modal>
        </div>
    );
}

AuthorsInput.propTypes = {
    handler: PropTypes.func.isRequired,
    value: PropTypes.array.isRequired,
    itemLabel: PropTypes.string,
    buttonId: PropTypes.string,
    isDisabled: PropTypes.bool,
};

AuthorsInput.defaultProps = {
    itemLabel: 'author',
    buttonId: null,
};

export default AuthorsInput;
