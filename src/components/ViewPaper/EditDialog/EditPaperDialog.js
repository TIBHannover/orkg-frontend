import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import EditItem from 'components/ViewPaper/EditDialog/EditItem';
import useEditPaper from 'components/ViewPaper/EditDialog/hooks/useEditPaper';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import LoadingOverlay from 'react-loading-overlay';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Input, ListGroup, Modal, ModalBody, ModalHeader, FormGroup, Label } from 'reactstrap';

const EditPaperDialog = ({ paperData, isOpen, toggle, afterUpdate, showPaperLink, additionalFields = {} }) => {
    const [openItem, setOpenItem] = useState('title');
    const [title, setTitle] = useState('');
    const [month, setMonth] = useState(0);
    const [year, setYear] = useState(0);
    const [authors, setAuthors] = useState([]);
    const [doi, setDoi] = useState('');
    const [publishedIn, setPublishedIn] = useState('');
    const [researchField, setResearchField] = useState('');
    const [url, setUrl] = useState('');
    const [isVerified, setIsVerified] = useState(false);

    const { editPaper, isLoadingEdit } = useEditPaper();
    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        if (!paperData) {
            return;
        }
        setTitle(paperData.paper?.label);
        setMonth(paperData.month?.label);
        setYear(paperData.year?.label);
        setAuthors(paperData.authors ?? []);
        setDoi(paperData.doi?.label);
        setPublishedIn(paperData.publishedIn);
        setResearchField(paperData.researchField);
        setUrl(paperData.url?.label);
        setIsVerified(!!paperData.isVerified);
    }, [paperData]);

    const handleSave = async () => {
        // merge the local state labels with the props 'paperData'
        const updatedData = await editPaper({
            paper: {
                ...paperData.paper,
                label: title,
            },
            month: {
                ...paperData.month,
                label: month,
            },
            year: {
                ...paperData.year,
                label: year,
            },
            authors,
            prevAuthors: paperData.authors,
            doi: {
                ...paperData.doi,
                label: doi,
            },
            publishedIn,
            researchField,
            url: {
                ...paperData.url,
                label: url,
            },
            isVerified,
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
            onChange: e => setTitle(e.target.value),
        },
        researchField: {
            label: 'Research field',
            type: 'researchField',
            value: researchField,
            onChange: value =>
                setResearchField({
                    ...value,
                    statementId: researchField?.statementId ?? '',
                }),
        },
        month: {
            label: 'Publication month',
            type: 'month',
            value: month,
            onChange: e => setMonth(e.target.value),
        },
        year: {
            label: 'Publication year',
            type: 'year',
            value: year,
            onChange: e => setYear(e.target.value),
        },
        authors: {
            label: 'Authors',
            type: 'authors',
            value: authors,
            onChange: setAuthors,
        },
        doi: {
            label: 'DOI',
            type: 'text',
            value: doi,
            onChange: e => setDoi(e.target.value),
        },
        publishedIn: {
            label: 'Published in',
            type: 'publishedIn',
            value: publishedIn,
            onChange: value =>
                setPublishedIn({
                    ...value,
                    statementId: publishedIn?.statementId ?? '',
                }),
        },
        paperUrl: {
            label: 'Paper URL',
            type: 'text',
            value: url,
            onChange: e => setUrl(e.target.value),
        },
        ...additionalFields,
    };

    const toggleItem = item => setOpenItem(openItem !== item ? item : null);
    // show loading indicator if: 1) is loading, 2) paperData is not yet available
    const isLoading = isLoadingEdit || !paperData;

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <LoadingOverlay
                active={isLoading}
                spinner
                text="Loading..."
                styles={{
                    overlay: base => ({
                        ...base,
                        borderRadius: 7,
                        overflow: 'hidden',
                        background: 'rgba(215, 215, 215, 0.7)',
                        color: '#282828',
                        '& svg circle': {
                            stroke: '#282828',
                        },
                    }),
                }}
            >
                <ModalHeader toggle={toggle}>
                    Edit paper
                    {showPaperLink && (
                        <Link
                            style={{ right: 45, position: 'absolute', top: 12 }}
                            className="ms-2"
                            to={reverse(ROUTES.VIEW_PAPER, { resourceId: paperData?.paper?.id })}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button color="link" className="p-0">
                                Open paper <Icon icon={faExternalLinkAlt} className="me-1" />
                            </Button>
                        </Link>
                    )}
                </ModalHeader>
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
                            <FormGroup check className="mt-2 me-2 pt-2">
                                <Tippy content="Mark this meta-data as verified">
                                    <span>
                                        <Input
                                            type="checkbox"
                                            id="replaceTitles"
                                            name="verified"
                                            onChange={e => setIsVerified(e.target.checked)}
                                            checked={isVerified}
                                        />{' '}
                                        <Label check for="replaceTitles" className="mb-0">
                                            Verified
                                        </Label>{' '}
                                    </span>
                                </Tippy>
                            </FormGroup>
                        )}

                        <Button disabled={isLoading} color="primary" className=" mt-2 mb-2" onClick={handleSave}>
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
        isVerified: PropTypes.bool,
    }),
    afterUpdate: PropTypes.func,
    showPaperLink: PropTypes.bool,
    additionalFields: PropTypes.object,
};

EditPaperDialog.defaultProps = {
    afterUpdate: null,
    id: null,
    showPaperLink: false,
};

export default EditPaperDialog;
