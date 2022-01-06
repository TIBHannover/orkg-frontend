import Confirm from 'components/Confirmation/Confirmation';
import DoiItem from 'components/CreatePaperModal/DoiItem';
import useCreatePaper from 'components/CreatePaperModal/hooks/useCreatePaper';
import TitleItem from 'components/CreatePaperModal/TitleItem';
import EditItem from 'components/ViewPaper/EditDialog/EditItem';
import REGEX from 'constants/regex';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { Button, ListGroup, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const CreatePaperModal = ({ isOpen, toggle, onCreatePaper, initialValue }) => {
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
    const [lookupOnMount, setLookupOnMount] = useState(false);

    useEffect(() => {
        if (!initialValue) {
            return;
        }

        const doi = initialValue.startsWith('http') ? initialValue.substring(initialValue.indexOf('10.')) : initialValue;
        if (REGEX.DOI.test(doi)) {
            setDoi(doi);
            setLookupOnMount(true);
        } else {
            setTitle(initialValue);
            setOpenItem('title');
        }
    }, [initialValue]);

    const handleCreate = async () => {
        const ids = await createPaper({
            title,
            month,
            year,
            authors,
            doi: REGEX.DOI.test(doi) ? doi : null,
            publishedIn,
            researchField,
            url,
            setOpenItem
        });
        if (ids) {
            onCreatePaper(ids);
        }
    };

    const FIELDS = {
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

    const handlePopulateMetadata = useCallback(
        paper => {
            setTitle(paper.title || title);
            setAuthors(paper.authors || authors);
            setMonth(paper.month || month);
            setYear(paper.year || year);
            setDoi(paper.doi || doi);
            setPublishedIn(paper.publishedIn || publishedIn);
            setUrl(paper.url || url);
        },
        [authors, doi, month, publishedIn, title, url, year]
    );

    const toggleItem = item => setOpenItem(openItem !== item ? item : null);

    const handleTitleClick = async paper => {
        if (authors.length > 0 || month || year || url || publishedIn) {
            const confirm = await Confirm({
                title: 'Overwrite data?',
                message: 'Do you want to overwrite the data you entered with the selected paper data?'
            });

            if (!confirm) {
                return;
            }
        }
        setTitle(paper.label || title);
        setAuthors(paper?.authors?.length > 0 ? paper.authors.map(author => ({ label: author.name })) : []);
        setYear(paper.year || '');
        setDoi(paper.externalIds?.DOI || '');
        setPublishedIn(paper.venue || '');
    };

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
                        lookupOnMount={lookupOnMount}
                    />
                    <TitleItem
                        toggleItem={() => toggleItem('title')}
                        isExpanded={openItem === 'title'}
                        value={title}
                        onChange={setTitle}
                        onOptionClick={handleTitleClick}
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
                <Button disabled={isLoading} color="primary" className="float-end" onClick={handleCreate}>
                    {!isLoading ? 'Create' : 'Loading...'}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

CreatePaperModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    onCreatePaper: PropTypes.func.isRequired,
    initialValue: PropTypes.string
};

CreatePaperModal.defaultProps = {
    initialValue: ''
};

export default CreatePaperModal;
