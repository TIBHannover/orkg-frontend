import Tippy from '@tippyjs/react';
import useEditPaper from 'components/ViewPaper/EditDialog/hooks/useEditPaper';
import PropTypes from 'prop-types';
import { useState } from 'react';
import LoadingOverlay from 'react-loading-overlay';
import { useSelector } from 'react-redux';
import { Button, CustomInput, ListGroup, Modal, ModalBody, ModalHeader } from 'reactstrap';
import EditItem from 'components/ViewPaper/EditDialog/EditItem';

const EditPaperDialog = ({ paperData, isOpen, toggle, afterUpdate }) => {
    const [openItem, setOpenItem] = useState('title');
    const [title, setTitle] = useState(paperData.paper?.label);
    const [month, setMonth] = useState(paperData.month?.label);
    const [year, setYear] = useState(paperData.year?.label);
    const [authors, setAuthors] = useState(paperData.authors ?? []);
    const [doi, setDoi] = useState(paperData.doi?.label);
    const [publishedIn, setPublishedIn] = useState(paperData.publishedIn);
    const [researchField, setResearchField] = useState(paperData.researchField);
    const [url, setUrl] = useState(paperData.url?.label);
    const [isVerified, setIsVerified] = useState(!!paperData.isVerified);
    const { editPaper, isLoadingEdit } = useEditPaper();
    const user = useSelector(state => state.auth.user);

    const handleSave = async () => {
        // merge the local state labels with the props 'paperData'
        const updatedData = await editPaper({
            paper: {
                ...paperData.paper,
                label: title
            },
            month: {
                ...paperData.month,
                label: month
            },
            year: {
                ...paperData.year,
                label: year
            },
            authors,
            prevAuthors: paperData.authors,
            doi: {
                ...paperData.doi,
                label: doi
            },
            publishedIn,
            researchField,
            url: {
                ...paperData.url,
                label: url
            },
            isVerified
        });

        if (updatedData && afterUpdate) {
            afterUpdate(updatedData);
        }
    };

    const FIELDS = {
        title: {
            label: 'Title',
            type: 'text',
            value: title,
            onChange: e => setTitle(e.target.value)
        },
        researchField: {
            label: 'Research Field',
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
        doi: {
            label: 'DOI',
            type: 'text',
            value: doi,
            onChange: e => setDoi(e.target.value)
        },
        publishedIn: {
            label: 'Published in',
            type: 'publishedIn',
            value: publishedIn,
            onChange: value =>
                setPublishedIn({
                    ...value,
                    statementId: publishedIn?.statementId ?? ''
                })
        },
        paperUrl: {
            label: 'Paper URL',
            type: 'text',
            value: url,
            onChange: e => setUrl(e.target.value)
        }
    };

    const toggleItem = item => setOpenItem(openItem !== item ? item : null);

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <LoadingOverlay
                active={isLoadingEdit}
                spinner
                text="Saving..."
                styles={{
                    overlay: base => ({
                        ...base,
                        borderRadius: 7,
                        overflow: 'hidden',
                        background: 'rgba(215, 215, 215, 0.7)',
                        color: '#282828',
                        '& svg circle': {
                            stroke: '#282828'
                        }
                    })
                }}
            >
                <ModalHeader toggle={toggle}>Edit general data</ModalHeader>
                <ModalBody>
                    <ListGroup className="listGroupEnlarge">
                        {Object.entries(FIELDS).map(([itemName, item], index) => (
                            <EditItem
                                key={itemName}
                                open={openItem === itemName}
                                label={item.label}
                                type={item.type}
                                value={item.value}
                                onChange={item.onChange}
                                toggleItem={() => toggleItem(itemName)}
                                isLastItem={Object.entries(FIELDS).length === index + 1}
                            />
                        ))}
                    </ListGroup>
                    <div className="d-flex" style={{ justifyContent: 'flex-end' }}>
                        {!!user && user.isCurationAllowed && (
                            <Tippy content="Mark this meta-data as verified">
                                <span>
                                    <CustomInput
                                        className="mt-2 mr-2 pt-2"
                                        type="checkbox"
                                        id="replaceTitles"
                                        label="Verified"
                                        name="verified"
                                        onChange={e => setIsVerified(e.target.checked)}
                                        checked={isVerified}
                                    />
                                </span>
                            </Tippy>
                        )}

                        <Button disabled={isLoadingEdit} color="primary" className=" mt-2 mb-2" onClick={handleSave}>
                            Save
                        </Button>
                    </div>
                </ModalBody>
            </LoadingOverlay>
        </Modal>
    );
};

EditPaperDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    paperData: PropTypes.shape({
        paper: PropTypes.object,
        month: PropTypes.object,
        year: PropTypes.object,
        authors: PropTypes.array,
        doi: PropTypes.object,
        publishedIn: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
        researchField: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
        url: PropTypes.object,
        isVerified: PropTypes.bool
    }),
    afterUpdate: PropTypes.func
};

EditPaperDialog.defaultProps = {
    afterUpdate: null,
    id: null
};

export default EditPaperDialog;
