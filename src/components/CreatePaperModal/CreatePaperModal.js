import DoiItem from 'components/CreatePaperModal/DoiItem';
import useCreatePaper from 'components/CreatePaperModal/hooks/useCreatePaper';
import EditItem from 'components/ViewPaper/EditDialog/EditItem';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Button, ListGroup, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const CreatePaperModal = ({ isOpen, toggle, onCreatePaper }) => {
    const { isLoading, createPaper } = useCreatePaper();
    const [openItem, setOpenItem] = useState('doi');
    const [title, setTitle] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [authors, setAuthors] = useState([]);
    const [doi, setDoi] = useState('');
    const [publishedIn, setPublishedIn] = useState('');
    const [researchField, setResearchField] = useState(null);
    const [url, setUrl] = useState('');

    const handleCreate = async () => {
        const contributionId = await createPaper({
            title,
            month,
            year,
            authors,
            doi,
            publishedIn,
            researchField,
            url,
            setOpenItem
        });

        if (contributionId) {
            onCreatePaper(contributionId);
        }
    };

    const FIELDS = {
        title: {
            label: 'Title *',
            type: 'text',
            value: title,
            onChange: e => setTitle(e.target.value)
        },
        researchField: {
            label: 'Research Field *',
            type: 'researchField',
            value: researchField,
            onChange: setResearchField
        },
        month: {
            label: 'Publication month',
            type: 'month',
            value: month,
            onChange: e => setMonth(e.target.value)
        },
        year: {
            label: 'Publication year',
            type: 'year',
            value: year,
            onChange: e => setYear(e.target.value)
        },
        authors: {
            label: 'Authors',
            type: 'authors',
            value: authors,
            onChange: setAuthors
        },
        publishedIn: {
            label: 'Published in',
            type: 'text', // TODO: replace with 'publishedIn', but currently the "papers" endpoint doesn't accept a resource for the 'publishedIn' key
            value: publishedIn,
            onChange: e => setPublishedIn(e.target.value)
        },
        paperUrl: {
            label: 'Paper URL',
            type: 'text',
            value: url,
            onChange: e => setUrl(e.target.value)
        }
    };

    const handlePopulateMetadata = paper => {
        setTitle(paper.title || title);
        setAuthors(paper.authors || authors);
        setMonth(paper.month || month);
        setYear(paper.year || year);
        setDoi(paper.doi || doi);
        setPublishedIn(paper.publishedIn || publishedIn);
    };

    const toggleItem = item => setOpenItem(openItem !== item ? item : null);

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Create new paper</ModalHeader>
            <ModalBody>
                <ListGroup className="listGroupEnlarge">
                    <DoiItem
                        toggleItem={() => toggleItem('doi')}
                        isExpanded={openItem === 'doi'}
                        onPopulateMetadata={handlePopulateMetadata}
                        value={doi}
                        onChange={value => setDoi(value)}
                    />
                    {Object.entries(FIELDS).map(([itemName, item], index) => (
                        <EditItem
                            key={itemName}
                            open={openItem === itemName}
                            label={item.label}
                            type={item.type}
                            value={item.value}
                            onChange={payload => item.onChange(payload)}
                            toggleItem={() => toggleItem(itemName)}
                            isLastItem={Object.entries(FIELDS).length === index + 1}
                        />
                    ))}
                </ListGroup>
            </ModalBody>
            <ModalFooter className="d-flex">
                <Button disabled={isLoading} color="primary" className="float-right" onClick={handleCreate}>
                    {!isLoading ? 'Create' : 'Loading...'}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

CreatePaperModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    onCreatePaper: PropTypes.func.isRequired
};

export default CreatePaperModal;
