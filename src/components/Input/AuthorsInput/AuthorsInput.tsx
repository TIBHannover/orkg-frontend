import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import arrayMove from 'array-move';
import { FC, useRef, useState } from 'react';
import { SingleValue } from 'react-select';
import { toast } from 'react-toastify';
import { Button, Form, FormGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import SortableAuthorItem from '@/components/Input/AuthorsInput/SortableAuthorItem';
import { AddAuthor, AuthorTags, GlobalStyle } from '@/components/Input/AuthorsInput/styled';
import { CLASSES, ENTITIES, PREDICATES } from '@/constants/graphSettings';
import REGEX from '@/constants/regex';
import { getStatements } from '@/services/backend/statements';
import { Author } from '@/services/backend/types';
import getPersonFullNameByORCID from '@/services/ORCID/index';

type AuthorInputProps = {
    itemLabel?: string;
    buttonId?: string;
    handler: (value: Author[]) => void;
    isDisabled?: boolean;
    value: Author[];
};

const AuthorsInput: FC<AuthorInputProps> = ({ itemLabel = 'author', buttonId = undefined, handler, isDisabled, value }) => {
    const [showAuthorForm, setShowAuthorForm] = useState(false);
    const [authorInput, setAuthorInput] = useState<OptionType | null>(null);
    const [authorNameLoading, setAuthorNameLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editIndex, setEditIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (selected: SingleValue<OptionType>) => {
        setAuthorInput(selected);
    };

    const isORCID = (_value: string) => Boolean(_value && _value.replaceAll('−', '-').match(REGEX.ORCID_URL));

    const saveAuthor = async (_authorInput: OptionType | null) => {
        if (_authorInput && _authorInput.label) {
            if (isORCID(_authorInput.label)) {
                setAuthorNameLoading(true);
                // Get the full name from ORCID API
                const orcid = _authorInput.label?.replaceAll('−', '-').match(REGEX.ORCID)?.[0];
                if (orcid) {
                    getPersonFullNameByORCID(orcid)
                        .then((authorFullName) => {
                            const newAuthor = {
                                id: null,
                                name: authorFullName,
                                identifiers: {
                                    orcid: [orcid],
                                },
                            };
                            if (editMode) {
                                handler([...value.slice(0, editIndex), newAuthor, ...value.slice(editIndex + 1)]);
                            } else {
                                handler([...value, newAuthor]);
                            }
                            setAuthorNameLoading(false);
                            setAuthorInput(null);
                            setEditMode(false);
                            setShowAuthorForm((v) => !v);
                        })
                        .catch(() => {
                            setAuthorNameLoading(false);
                            toast.error(`Invalid ORCID ID. Please enter the ${itemLabel} name`);
                        });
                }
            } else {
                let orcids: string[] = [];
                if (_authorInput.id && !_authorInput.__isNew__) {
                    orcids = (
                        await getStatements({ subjectClasses: [CLASSES.AUTHOR], subjectId: _authorInput.id, predicateId: PREDICATES.HAS_ORCID })
                    ).map((statement) => statement.object.label);
                }
                const newAuthor = {
                    id: _authorInput.__isNew__ ? null : _authorInput.id,
                    name: _authorInput.label,
                    ...(orcids.length > 0 ? { identifiers: { orcid: orcids } } : { identifiers: { orcid: [] } }),
                };
                if (editMode) {
                    handler([...value.slice(0, editIndex), newAuthor, ...value.slice(editIndex + 1)]);
                } else {
                    handler([...value, newAuthor]);
                }
                setAuthorInput(null);
                setEditMode(false);
                setShowAuthorForm((v) => !v);
            }
        } else {
            toast.error(`Please enter the ${itemLabel} name`);
        }
    };

    const removeAuthor = (indexToRemove: number) => {
        handler(value.filter((_, index) => index !== indexToRemove));
    };

    const editAuthor = (key: number) => {
        setEditIndex(key);
        setAuthorInput({
            ...value[key],
            label: value[key].identifiers?.orcid?.[0] ?? value[key].name,
            hideLink: true,
        } as OptionType);
        setEditMode(true);
        setShowAuthorForm((v) => !v);
    };

    const handleUpdate = ({ dragIndex, hoverIndex }: { dragIndex: number; hoverIndex: number }) => {
        handler(arrayMove(value, dragIndex, hoverIndex));
    };

    return (
        <div className=" clearfix">
            <GlobalStyle />
            <div>
                {value.length > 0 && (
                    <AuthorTags onClick={value.length === 0 && !isDisabled ? () => setShowAuthorForm((v) => !v) : undefined}>
                        {value.map((author, index) => (
                            <SortableAuthorItem
                                key={`author-${index}`}
                                author={author}
                                authorIndex={index}
                                itemLabel={itemLabel}
                                editAuthor={editAuthor}
                                removeAuthor={removeAuthor}
                                handleUpdate={handleUpdate}
                                isDisabled={isDisabled ?? false}
                            />
                        ))}
                    </AuthorTags>
                )}
            </div>
            <div>
                <AddAuthor
                    disabled={isDisabled}
                    id={buttonId}
                    color="light"
                    className="w-100"
                    onClick={() => {
                        setAuthorNameLoading(false);
                        setAuthorInput(null);
                        setEditMode(false);
                        setShowAuthorForm((v) => !v);
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} className="me-2" /> Add {itemLabel}
                </AddAuthor>
            </div>
            <Modal onOpened={() => inputRef?.current?.focus()} isOpen={showAuthorForm} toggle={() => setShowAuthorForm((v) => !v)}>
                <Form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); // in case this is a nested modal, stop the submit event propagation to the parent form
                    }}
                >
                    <ModalHeader>{editMode ? `Edit ${itemLabel}` : `Add ${itemLabel}`}</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label for="authorInput">
                                Enter {itemLabel} name <b>or</b> ORCID <FontAwesomeIcon color="#A6CE39" icon={faOrcid} />
                            </Label>
                            <Autocomplete
                                entityType={ENTITIES.RESOURCE}
                                includeClasses={[CLASSES.AUTHOR]}
                                placeholder="Search for author or enter a new author..."
                                onChange={handleChange}
                                value={authorInput}
                                allowCreate
                                inputId="authorInput"
                                enableExternalSources={false}
                                autoFocus
                            />
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="light" onClick={() => setShowAuthorForm((v) => !v)}>
                            Cancel
                        </Button>
                        <ButtonWithLoading type="submit" isLoading={authorNameLoading} color="primary" onClick={() => saveAuthor(authorInput)}>
                            {editMode && 'Save'}
                            {!editMode && 'Add'}
                        </ButtonWithLoading>
                    </ModalFooter>
                </Form>
            </Modal>
        </div>
    );
};

export default AuthorsInput;
