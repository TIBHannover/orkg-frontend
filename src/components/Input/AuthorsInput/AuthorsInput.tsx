import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Label, Modal, toast } from '@heroui/react';
import { FC, useCallback, useEffect, useState } from 'react';
import { SingleValue } from 'react-select';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import SortableAuthorItem, { isAuthorData } from '@/components/Input/AuthorsInput/SortableAuthorItem';
import { createInstanceId, createListMonitor, performReorder, type ReorderParams } from '@/components/shared/dnd/dragAndDropUtils';
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
    const [instanceId] = useState(() => createInstanceId('authors-input'));

    const handleChange = (selected: SingleValue<OptionType>) => {
        setAuthorInput(selected);
    };

    const isORCID = (_value: string) => Boolean(_value && _value.replaceAll('−', '-').match(REGEX.ORCID_URL));

    const saveAuthor = async (_authorInput: OptionType | null) => {
        if (_authorInput && _authorInput.label) {
            if (isORCID(_authorInput.label)) {
                setAuthorNameLoading(true);
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
                            toast.danger(`Invalid ORCID ID. Please enter the ${itemLabel} name`);
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
            toast.danger(`Please enter the ${itemLabel} name`);
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

    const reorderAuthors = useCallback(
        ({ startIndex, indexOfTarget, closestEdgeOfTarget }: ReorderParams) => {
            const reorderedAuthors = performReorder({
                items: value,
                startIndex,
                indexOfTarget,
                closestEdgeOfTarget,
                axis: 'vertical',
            });

            if (reorderedAuthors !== value) {
                handler(reorderedAuthors);
            }
        },
        [value, handler],
    );

    useEffect(() => {
        if (isDisabled) return undefined;

        const cleanup = createListMonitor({
            instanceId,
            items: value,
            isDragData: isAuthorData,
            onReorder: reorderAuthors,
            getItemId: (author) => author.id || author.name,
        });

        return () => {
            cleanup?.();
        };
    }, [instanceId, value, reorderAuthors, isDisabled]);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setShowAuthorForm(false);
        }
    };

    return (
        <div className="flow-root">
            {value.length > 0 && (
                <div className="flex flex-col relative overflow-hidden">
                    {value.map((author, index) => (
                        <SortableAuthorItem
                            key={`author-${author.id || author.name}-${index}`}
                            author={author}
                            authorIndex={index}
                            itemLabel={itemLabel}
                            editAuthor={editAuthor}
                            removeAuthor={removeAuthor}
                            instanceId={instanceId}
                            totalItems={value.length}
                            isDisabled={isDisabled ?? false}
                        />
                    ))}
                </div>
            )}
            <Button
                isDisabled={isDisabled}
                id={buttonId}
                variant="secondary"
                fullWidth
                className="mb-0.5"
                onPress={() => {
                    setAuthorNameLoading(false);
                    setAuthorInput(null);
                    setEditMode(false);
                    setShowAuthorForm((v) => !v);
                }}
            >
                <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add {itemLabel}
            </Button>
            {showAuthorForm && (
                <Modal.Backdrop isOpen onOpenChange={handleOpenChange}>
                    <Modal.Container>
                        <Modal.Dialog>
                            <Modal.Header className="flex-row items-center justify-between gap-3">
                                <Modal.Heading>{editMode ? `Edit ${itemLabel}` : `Add ${itemLabel}`}</Modal.Heading>
                                <Modal.CloseTrigger className="static" />
                            </Modal.Header>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                <Modal.Body className="pt-4 pb-2 px-1 flex flex-col gap-2">
                                    <Label htmlFor="authorInput">
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
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onPress={() => setShowAuthorForm((v) => !v)}>
                                        Cancel
                                    </Button>
                                    <ButtonWithLoading type="submit" isLoading={authorNameLoading} onPress={() => saveAuthor(authorInput)}>
                                        {editMode ? 'Save' : 'Add'}
                                    </ButtonWithLoading>
                                </Modal.Footer>
                            </form>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            )}
        </div>
    );
};

export default AuthorsInput;
