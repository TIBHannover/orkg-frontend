import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { addListEntry } from 'actions/literatureList';
import Cite from 'citation-js';
import CreatePaperModal from 'components/CreatePaperModal/CreatePaperModal';
import useLiteratureList from 'components/LiteratureList/hooks/useLiteratureList';
import { MISC } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Textarea from 'react-textarea-autosize';
import { toast } from 'react-toastify';
import { Button, FormGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { getPaperByDOI } from 'services/backend/misc';
import { saveFullPaper } from 'services/backend/papers';
import { parseCiteResult } from 'utils';

const AddEntryModal = ({ sectionId, isOpen, setIsOpen }) => {
    const [isOpenCreatePaper, setIsOpenCreatePaper] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [value, setValue] = useState('');
    const dispatch = useDispatch();
    const { getPaperData } = useLiteratureList();

    const getPaperIdByDoi = async doi => {
        try {
            const paper = await getPaperByDOI(doi);
            return paper.id;
        } catch (e) {
            return null;
        }
    };

    const handleAdd = async () => {
        setIsLoading(true);
        let entryParsed = value.trim();
        if (value.startsWith('http')) {
            entryParsed = value.substring(value.indexOf('10.'));
        }

        let paperId;
        if (entryParsed.includes('10.') && entryParsed.startsWith('10.')) {
            paperId = await getPaperIdByDoi(entryParsed);
        }

        if (!paperId) {
            try {
                const papers = await Cite.async(entryParsed);
                if (!papers) {
                    toast.error('An error occurred');
                    setIsLoading(false);
                    return;
                }
                for (const paper of papers.data) {
                    paperId = null; // reset because of the loop
                    const { paperTitle, paperAuthors, paperPublicationMonth, paperPublicationYear, doi, publishedIn } = parseCiteResult({
                        data: [paper]
                    });

                    if (doi) {
                        paperId = await getPaperIdByDoi(doi);
                    }

                    if (!paperId) {
                        const savedPaper = await saveFullPaper(
                            {
                                paper: {
                                    title: paperTitle,
                                    researchField: MISC.RESEARCH_FIELD_MAIN,
                                    authors: paperAuthors.length
                                        ? paperAuthors.map(author => ({ label: author.label, ...(author.orcid ? { orcid: author.orcid } : {}) }))
                                        : null,
                                    publicationMonth: paperPublicationMonth || undefined,
                                    publicationYear: paperPublicationYear || undefined,
                                    doi: doi || undefined,
                                    publishedIn: publishedIn || undefined,
                                    contributions: [
                                        {
                                            name: 'Contribution'
                                        }
                                    ]
                                }
                            },
                            true
                        );
                        paperId = savedPaper.id;
                    }
                    await addPaperToList(paperId);
                }
                toast.success(`Successfully added ${papers.data?.length} entries`);
            } catch (e) {
                const validationMessages = {
                    'This format is not supported or recognized':
                        "This format is not supported or recognized. Please enter a valid DOI or Bibtex or select 'Manual entry' to enter the paper details yourself",
                    'Server responded with status code 404': 'No paper has been found',
                    default: 'An error occurred, reload the page and try again'
                };
                toast.error(validationMessages[e.message] || validationMessages['default']);
                setIsLoading(false);
                return;
            }
        } else {
            await addPaperToList(paperId);
            toast.success('The entry has been added successfully');
        }
    };

    const handleCreatePaper = async ({ paperId }) => {
        setIsLoading(true);
        await addPaperToList(paperId);
        setIsOpenCreatePaper(false);
    };

    const addPaperToList = async paperId => {
        const paperData = await getPaperData(paperId);
        dispatch(
            addListEntry({
                paperData,
                sectionId
            })
        );
        setIsOpen(false);
    };

    return (
        <>
            <Modal isOpen={isOpen} toggle={v => setIsOpen(!v)}>
                <ModalHeader toggle={v => setIsOpen(!v)}>Add entries</ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label for="paper-value">Enter DOI or BibTeX</Label>
                        <Textarea id="paper-value" value={value} minRows="1" className="form-control" onChange={e => setValue(e.target.value)} />
                    </FormGroup>
                </ModalBody>
                <ModalFooter className="d-flex">
                    <div className="flex-grow-1">
                        <Button color="light" onClick={() => setIsOpenCreatePaper(true)}>
                            Manual entry
                        </Button>
                    </div>
                    <Button color="primary" className="float-right" onClick={handleAdd}>
                        {!isLoading ? 'Add entries' : <Icon icon={faSpinner} spin />}
                    </Button>
                </ModalFooter>
            </Modal>
            {isOpenCreatePaper && (
                <CreatePaperModal isOpen onCreatePaper={handleCreatePaper} toggle={() => setIsOpenCreatePaper(v => !v)} initialValue={value} />
            )}
        </>
    );
};

AddEntryModal.propTypes = {
    sectionId: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired
};

export default AddEntryModal;
