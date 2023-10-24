import DragUploadPdf from 'components/DragUploadPdf/DragUploadPdf';
import PropTypes from 'prop-types';
import { Alert, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { getResource } from 'services/backend/resources';
import processPdf from 'services/grobid';
import { extractMetadataPdf } from 'services/orkgNlp';

const UploadPdfModal = ({ toggle, onUpdateData }) => {
    const handleOnDrop = async files => {
        let title = '';
        let authors = [];
        let extractedContributionData = [];
        let researchField = null;
        let doi = null;
        try {
            const processedPdf = await new window.DOMParser().parseFromString(await processPdf({ pdf: files[0] }), 'text/xml');
            title = processedPdf.querySelector('fileDesc titleStmt title')?.textContent;
            authors = [...processedPdf.querySelectorAll('fileDesc biblStruct author')].map(author => ({
                label: [...author.querySelectorAll('forename, surname')].map(name => name?.textContent).join(' '),
                orcid: author.querySelector('idno[type="ORCID"]')?.textContent ?? undefined,
            }));
            doi = processedPdf.querySelector('fileDesc biblStruct idno[type="DOI"]')?.textContent ?? '';
        } catch (e) {
            console.error(e);
        }

        try {
            // Create a new FormData object
            const form = new FormData();

            // Append the PDF file to the FormData object
            form.append('file', files[0]);

            // Make the POST request
            const responseData = await extractMetadataPdf(form);

            // extract ResearchField label
            const extractedResearchField = await getResource(responseData.payload.paper.researchField);
            title = responseData.payload.paper.title;
            authors = responseData.payload.paper.authors.map(author => author);
            extractedContributionData = responseData.payload.paper.contributions;
            researchField = extractedResearchField;
        } catch (error) {
            // Handle errors related to the PDF handling and API request as needed.
            console.error('Something went wrong while parsing the PDF', error);
        }
        onUpdateData({
            extractedContributionData,
            researchField,
            title,
            authors,
            doi,
        });
        toggle();
    };

    return (
        <Modal size="lg" isOpen toggle={toggle}>
            <ModalHeader toggle={toggle}>Upload PDF</ModalHeader>
            <ModalBody>
                <Alert color="info" fade={false}>
                    The uploaded PDF file will not be stored on our servers and is only used to extract (meta)data. If the paper was annotated with{' '}
                    <a href="https://orkg.org/about/33/SciKGTeX" target="_blank" rel="noopener noreferrer">
                        SciKGTeX
                    </a>{' '}
                    the annotation will be imported automatically.
                </Alert>
                <div className="my-4 d-flex justify-content-center">
                    <DragUploadPdf onDrop={handleOnDrop} />
                </div>
            </ModalBody>
        </Modal>
    );
};

UploadPdfModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    onUpdateData: PropTypes.func.isRequired,
};

export default UploadPdfModal;
