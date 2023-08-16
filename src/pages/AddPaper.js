import { faCode, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import PaperForm from 'components/PaperForm/PaperForm';
import useAddPaper from 'components/PaperForm/hooks/useAddPaper';
import useOverwriteValuesModal from 'components/PaperForm/hooks/useOverwriteValuesModal';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import TitleBar from 'components/TitleBar/TitleBar';
import BibTexModal from 'components/ViewPaper/BibTexModal/BibTexModal';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Container } from 'reactstrap';
import UploadPdfModal from 'components/ViewPaper/UploadPdfModal/UploadPdfModal';

const AddPaper = () => {
    const [isOpenPdfModal, setIsOpenPdfModal] = useState(false);
    const [isOpenBibTexModal, setIsOpenBibTexModal] = useState(false);
    const [isLoadingParsing, setIsLoadingParsing] = useState(false);
    const [isMetadataExpanded, setIsMetadataExpanded] = useState(false);
    const { shouldUpdateValues, OverwriteValuesModal } = useOverwriteValuesModal();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const onCreate = ({ paperId }) => {
        navigate({
            pathname: reverse(ROUTES.VIEW_PAPER, { resourceId: paperId }),
            search: '?isEditMode=true',
        });
    };

    const {
        doi,
        title,
        researchField,
        authors,
        publicationMonth,
        publicationYear,
        publishedIn,
        isLoading,
        url,
        abstract,
        setDoi,
        setTitle,
        setResearchField,
        setAuthors,
        setPublicationMonth,
        setPublicationYear,
        setPublishedIn,
        setUrl,
        setAbstract,
        setExtractedContributionData,
        ExistingPaperModels,
        handleSave,
        savePaper,
    } = useAddPaper({ onCreate });

    useEffect(() => {
        document.title = 'Add paper - ORKG';
        const entry = searchParams.get('entry');
        if (entry) {
            setDoi(entry);
        }
    }, [searchParams, setDoi]);

    const handleUpdateDataFromPdf = async newData => {
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

    const handleUpdateDataFromBibTex = async newData => {
        if (
            await shouldUpdateValues({
                currentData: {
                    doi,
                    title,
                    authors: authors.map(author => ({ label: author.label, orcid: author.orcid })),
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
        <div>
            <TitleBar
                buttonGroup={
                    <>
                        <Button color="secondary" size="sm" style={{ marginRight: 2 }} onClick={() => setIsOpenPdfModal(true)}>
                            <Icon icon={faUpload} className="me-1" /> Upload PDF
                        </Button>

                        <Button color="secondary" size="sm" style={{ marginRight: 2 }} onClick={() => setIsOpenBibTexModal(true)}>
                            <Icon icon={faCode} /> Enter BibTeX
                        </Button>
                    </>
                }
            >
                Add paper
            </TitleBar>
            <Container className="box rounded py-4 px-5">
                <PaperForm
                    isLoadingParsing={isLoadingParsing}
                    setIsLoadingParsing={setIsLoadingParsing}
                    doi={doi}
                    setDoi={setDoi}
                    title={title}
                    setTitle={setTitle}
                    researchField={researchField}
                    setResearchField={setResearchField}
                    authors={authors}
                    setAuthors={setAuthors}
                    publicationMonth={publicationMonth}
                    setPublicationMonth={setPublicationMonth}
                    publicationYear={publicationYear}
                    setPublicationYear={setPublicationYear}
                    publishedIn={publishedIn}
                    setPublishedIn={setPublishedIn}
                    url={url}
                    setUrl={setUrl}
                    abstract={abstract}
                    setAbstract={setAbstract}
                    isNewPaper
                    isMetadataExpanded={isMetadataExpanded}
                    setIsMetadataExpanded={setIsMetadataExpanded}
                />

                <hr />
                <div className="d-flex justify-content-end">
                    <span>
                        <span className="text-muted fst-italic me-4">After adding the paper, you will be able to add structured data</span>
                        <RequireAuthentication
                            component={ButtonWithLoading}
                            color="primary"
                            onClick={handleSave}
                            isDisabled={isLoadingParsing}
                            isLoading={isLoading}
                        >
                            Add paper
                        </RequireAuthentication>
                    </span>
                </div>
            </Container>
            <ExistingPaperModels onContinue={savePaper} />
            {isOpenPdfModal && <UploadPdfModal toggle={() => setIsOpenPdfModal(v => !v)} onUpdateData={handleUpdateDataFromPdf} />}
            {isOpenBibTexModal && <BibTexModal toggle={() => setIsOpenBibTexModal(v => !v)} onUpdateData={handleUpdateDataFromBibTex} />}
            <OverwriteValuesModal />
        </div>
    );
};

export default AddPaper;
