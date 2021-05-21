import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { createReference as createReferenceAction, deleteReference, updateReference as updateReferenceAction } from 'actions/smartReview';
import Cite from 'citation-js';
import ReferenceModal from 'components/SmartReview/References/ReferenceModal';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Alert, Badge, Button, ListGroup, ListGroupItem, Modal, ModalBody, ModalHeader } from 'reactstrap';
import Confirm from 'reactstrap-confirm';

const ReferencesModal = ({ show, toggle }) => {
    const [isOpenReferenceModal, setIsOpenReferenceModal] = useState(false);
    const [editReference, setEditReference] = useState(false);
    const [referencesSorted, setReferencesSorted] = useState([]);
    const references = useSelector(state => state.smartReview.references);
    const contributionId = useSelector(state => state.smartReview.contributionId);

    useEffect(() => {
        setReferencesSorted(
            references.sort((a, b) => a?.parsedReference?.author?.[0]?.family.localeCompare(b?.parsedReference?.author?.[0]?.family))
        );
    }, [references]);

    const dispatch = useDispatch();

    const handleSaveReference = ({ bibtex, literalId }) => {
        if (!literalId) {
            createReference(bibtex);
        } else {
            updateReference({ bibtex, literalId });
        }
        setIsOpenReferenceModal(false);
    };

    const updateReference = async ({ bibtex, literalId }) => {
        const parsedReference = await parseBibtex({ bibtex, checkForDuplicate: false });
        if (parsedReference) {
            dispatch(
                updateReferenceAction({
                    bibtex,
                    literalId,
                    parsedReference
                })
            );
        }
    };

    const createReference = async bibtex => {
        const parsedReference = await parseBibtex({ bibtex, checkForDuplicate: true });

        if (!parsedReference) {
            return;
        }

        dispatch(
            createReferenceAction({
                contributionId,
                bibtex,
                parsedReference
            })
        );
    };

    const parseBibtex = async ({ bibtex, checkForDuplicate }) => {
        try {
            let parsedReference = await Cite.async(bibtex);
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

            return parsedReference;
        } catch (e) {
            console.log(e);
            toast.error(e.name === 'Error' ? e.message : 'An error occurred while parsing the BibTeX');
        }
        return null;
    };

    const handleDelete = async statementId => {
        const isConfirmed = await Confirm({
            title: 'Are you sure?',
            message: `Do you want to remove this reference? `,
            cancelColor: 'light'
        });

        if (isConfirmed) {
            dispatch(deleteReference(statementId));
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
                    Use references with content sections using the command <em>[@citationKey]</em>
                </Alert>

                <ListGroup>
                    {referencesSorted.map(reference => {
                        return (
                            <ListGroupItem key={reference.literal.id} action className="d-flex align-items-start pr-2">
                                <div>
                                    <Badge color="light">@{reference.parsedReference['citation-label']}</Badge>{' '}
                                    {reference.parsedReference.author?.[0]?.family} {reference.parsedReference.author?.length > 1 && 'et al.'}{' '}
                                    <em>{reference.parsedReference.title}</em>
                                </div>
                                <div className="d-flex flex-shrink-0">
                                    <Button color="link" className="mr-1 px-1 py-0 text-secondary" onClick={() => handleEdit(reference)}>
                                        <Icon icon={faPen} />
                                    </Button>
                                    <Button
                                        color="link"
                                        className="px-1 py-0 text-danger"
                                        style={{ fontSize: '120%' }}
                                        onClick={() => handleDelete(reference.statementId)}
                                    >
                                        <Icon icon={faTimes} />
                                    </Button>
                                </div>
                            </ListGroupItem>
                        );
                    })}
                    {referencesSorted.length === 0 && <div className="text-center mt-3">No references added yet</div>}
                </ListGroup>
                <Button size="sm" onClick={handleAdd} className="mt-4">
                    Add BibTeX
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
