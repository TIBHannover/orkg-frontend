import { faCode, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import useOverwriteValuesModal from 'components/PaperForm/hooks/useOverwriteValuesModal';
import BibTexModal from 'components/ViewPaper/BibTexModal/BibTexModal';
import UploadPdfModal from 'components/ViewPaper/UploadPdfModal/UploadPdfModal';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, ButtonGroup } from 'reactstrap';

const AddPaperAdditionalButtons = ({
    doi,
    title,
    authors,
    publicationMonth,
    publicationYear,
    publishedIn,
    url,
    setDoi,
    setTitle,
    setResearchField,
    setAuthors,
    setPublicationMonth,
    setPublicationYear,
    setPublishedIn,
    setUrl,
    setIsMetadataExpanded,
    setExtractedContributionData,
}) => {
    const [isOpenPdfModal, setIsOpenPdfModal] = useState(false);
    const [isOpenBibTexModal, setIsOpenBibTexModal] = useState(false);
    const { shouldUpdateValues, OverwriteValuesModal } = useOverwriteValuesModal();

    const handleUpdateDataFromPdf = async (newData) => {
        if (
            await shouldUpdateValues({
                currentData: {
                    title,
                    doi,
                    authors,
                    researchField: newData.researchField,
                },
                newData: {
                    title: newData.title,
                    doi: newData.doi,
                    authors: newData.authors,
                    researchField: newData.researchField,
                },
            })
        ) {
            setDoi(newData.doi);
            setTitle(newData.title);
            setAuthors(newData.authors || []);
            setResearchField(newData.researchField);
            toast.success('Data successfully inserted');

            if (newData?.extractedContributionData?.length > 0) {
                setExtractedContributionData(newData.extractedContributionData);
                toast.success('SciKGTeX contribution data is extracted and will be added to the paper');
            }
            setIsMetadataExpanded(true);
        }
    };

    const handleUpdateDataFromBibTex = async (newData) => {
        if (
            await shouldUpdateValues({
                currentData: {
                    doi,
                    title,
                    authors: authors.map((author) => ({ label: author.label, orcid: author.orcid })),
                    publicationMonth: parseInt(publicationMonth, 10),
                    publicationYear: parseInt(publicationYear, 10),
                    publishedIn: publishedIn?.label,
                    url,
                },
                newData,
            })
        ) {
            setDoi(newData.doi);
            setTitle(newData.title);
            setAuthors(newData.authors);
            setPublicationMonth(newData.publicationMonth);
            setPublicationYear(newData.publicationYear);
            setPublishedIn(newData.publishedIn);
            setUrl(newData.url);
            setIsOpenBibTexModal(false);
            setIsMetadataExpanded(true);
            toast.success('Data successfully inserted');
        }
    };

    return (
        <ButtonGroup>
            <Button color="secondary" size="sm" style={{ marginRight: 2 }} onClick={() => setIsOpenPdfModal(true)}>
                <Icon icon={faUpload} className="me-1" /> Upload PDF
            </Button>

            <Button color="secondary" size="sm" style={{ marginRight: 2 }} onClick={() => setIsOpenBibTexModal(true)}>
                <Icon icon={faCode} /> Enter BibTeX
            </Button>

            {isOpenPdfModal && <UploadPdfModal toggle={() => setIsOpenPdfModal((v) => !v)} onUpdateData={handleUpdateDataFromPdf} />}
            {isOpenBibTexModal && <BibTexModal toggle={() => setIsOpenBibTexModal((v) => !v)} onUpdateData={handleUpdateDataFromBibTex} />}
            <OverwriteValuesModal />
        </ButtonGroup>
    );
};

AddPaperAdditionalButtons.propTypes = {
    doi: PropTypes.string,
    title: PropTypes.string,
    authors: PropTypes.array,
    publicationMonth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    publicationYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    publishedIn: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    url: PropTypes.string,
    setDoi: PropTypes.func.isRequired,
    setTitle: PropTypes.func.isRequired,
    setResearchField: PropTypes.func.isRequired,
    setAuthors: PropTypes.func.isRequired,
    setPublicationMonth: PropTypes.func.isRequired,
    setPublicationYear: PropTypes.func.isRequired,
    setPublishedIn: PropTypes.func.isRequired,
    setUrl: PropTypes.func.isRequired,
    setIsMetadataExpanded: PropTypes.func.isRequired,
    setExtractedContributionData: PropTypes.func.isRequired,
};

export default AddPaperAdditionalButtons;
