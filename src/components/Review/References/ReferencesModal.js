import { faPen, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { createReference as createReferenceAction, deleteReference, updateReference as updateReferenceAction } from 'slices/reviewSlice';
import Cite from 'citation-js';
import ReferenceModal from 'components/Review/References/ReferenceModal';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { uniq } from 'lodash';
import { Alert, Badge, Button, ListGroup, ListGroupItem, Modal, ModalBody, ModalHeader } from 'reactstrap';
import Confirm from 'components/Confirmation/Confirmation';

const ReferencesModal = ({ show, toggle }) => {
    const [isOpenReferenceModal, setIsOpenReferenceModal] = useState(false);
    const [editReference, setEditReference] = useState(null);
    const [referencesSorted, setReferencesSorted] = useState([]);
    const references = useSelector(state => state.review.references);
    const contributionId = useSelector(state => state.review.contributionId);
    const [isParsingBibtex, setIsParsingBibtex] = useState(false);
    const [isDeletingIDs, setIsDeletingIDs] = useState([]);

    useEffect(() => {
        setReferencesSorted(
            [...references].sort((a, b) => a?.parsedReference?.author?.[0]?.family?.localeCompare(b?.parsedReference?.author?.[0]?.family))
        );
    }, [references]);

    const dispatch = useDispatch();

    const parseBibtex = useCallback(
        ({ bibtex, checkForDuplicate }) => {
            return Cite.async(bibtex)
                .then(parsedReference => {
                    const hasMultipleCitations = parsedReference.data.length > 1;
                    parsedReference = parsedReference.data[0];

                    if (checkForDuplicate) {
                        const isKeyExisting = references.filter(reference => reference.parsedReference.id === parsedReference.id).length;
                        if (isKeyExisting) {
                            throw new Error('Duplicate citation key');
                        }
                    }
                    if (hasMultipleCitations) {
                        toast.warning('BibTeX contains multiple citations, only the first citation is added');
                    }

                    setIsOpenReferenceModal(false);
                    return parsedReference;
                })
                .catch(e => {
                    console.log(e);
                    toast.error(e.name === 'Error' ? e.message : 'An error occurred while parsing the BibTeX');
                    return null;
                });
        },
        [references]
    );

    const updateReference = useCallback(
        ({ bibtex, literalId }) => {
            setIsParsingBibtex(true);

            parseBibtex({ bibtex, checkForDuplicate: false })
                .then(parsedReference => {
                    if (parsedReference) {
                        return dispatch(
                            updateReferenceAction({
                                bibtex,
                                literalId,
                                parsedReference
                            })
                        ).then(() => setIsParsingBibtex(false));
                    }
                })
                .catch(() => {
                    setIsParsingBibtex(false);
                });
        },
        [dispatch, parseBibtex]
    );

    const createReference = useCallback(
        bibtex => {
            setIsParsingBibtex(true);

            parseBibtex({ bibtex, checkForDuplicate: true })
                .then(parsedReference => {
                    if (!parsedReference) {
                        setIsParsingBibtex(false);
                        return;
                    }
                    return dispatch(
                        createReferenceAction({
                            contributionId,
                            bibtex,
                            parsedReference
                        })
                    ).then(() => setIsParsingBibtex(false));
                })
                .catch(() => {
                    setIsParsingBibtex(false);
                });
        },
        [contributionId, dispatch, parseBibtex]
    );

    const handleSaveReference = useCallback(
        ({ bibtex, literalId }) => {
            if (!literalId) {
                createReference(bibtex);
            } else {
                updateReference({ bibtex, literalId });
            }
        },
        [createReference, updateReference]
    );

    const handleDelete = async statementId => {
        const isConfirmed = await Confirm({
            title: 'Are you sure?',
            message: `Do you want to remove this reference? `
        });

        if (isConfirmed) {
            setIsDeletingIDs(prevIDs => uniq([...prevIDs, statementId]));
            return dispatch(deleteReference(statementId)).then(() => {
                setIsDeletingIDs(prevIDs => prevIDs.filter(id => id !== statementId));
            });
        }
    };

    const handleEdit = reference => {
        setEditReference(reference);
        setIsOpenReferenceModal(true);
    };

    const handleAdd = () => {
        setEditReference(null);
        setIsOpenReferenceModal(true);
    };

    return (
        <Modal isOpen={show} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Manage references</ModalHeader>
            <ModalBody>
                <Alert color="info">
                    Use references within content sections using the command <em>[@citationKey]</em>, or use a DOI as citation key (for example,{' '}
                    <em>[@10.1145/3360901.3364435]</em>)
                </Alert>

                <ListGroup>
                    {referencesSorted.map(reference => {
                        return (
                            <ListGroupItem key={reference.literal.id} className="d-flex align-items-start pe-2">
                                <div className="flex-grow-1">
                                    <Badge color="light">@{reference.parsedReference['citation-label']}</Badge>{' '}
                                    {reference.parsedReference.author?.[0]?.family} {reference.parsedReference.author?.length > 1 && 'et al.'}{' '}
                                    <em>{reference.parsedReference.title}</em>
                                </div>
                                <div className="d-flex flex-shrink-0">
                                    <Button color="link" className="me-1 px-1 py-0 text-secondary" onClick={() => handleEdit(reference)}>
                                        <Icon icon={faPen} />
                                    </Button>
                                    <Button
                                        color="link"
                                        disabled={isDeletingIDs?.includes(reference.statementId)}
                                        className="px-1 py-0 text-danger"
                                        style={{ fontSize: '120%' }}
                                        onClick={() => handleDelete(reference.statementId)}
                                    >
                                        {isDeletingIDs?.includes(reference.statementId) ? <Icon icon={faSpinner} spin /> : <Icon icon={faTimes} />}
                                    </Button>
                                </div>
                            </ListGroupItem>
                        );
                    })}
                    {referencesSorted.length === 0 && <div className="text-center mt-3">No references added yet</div>}
                </ListGroup>
                <Button size="sm" disabled={isParsingBibtex} onClick={handleAdd} className="mt-4">
                    {isParsingBibtex ? (
                        <>
                            <Icon icon={faSpinner} spin /> Parsing BibTeX
                        </>
                    ) : (
                        'Add BibTeX'
                    )}
                </Button>
            </ModalBody>

            {isOpenReferenceModal && (
                <ReferenceModal toggle={() => setIsOpenReferenceModal(v => !v)} onSave={handleSaveReference} show reference={editReference} />
            )}
        </Modal>
    );
};

ReferencesModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired
};

export default ReferencesModal;
