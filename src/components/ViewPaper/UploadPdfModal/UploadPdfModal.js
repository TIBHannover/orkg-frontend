import DragUploadPdf from 'components/DragUploadPdf/DragUploadPdf';
import PropTypes from 'prop-types';
import { Alert, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { getResource } from 'services/backend/resources';
import processPdf from 'services/grobid';
import { extractMetadataPdf } from 'services/orkgNlp';

const UploadPdfModal = ({ toggle, onUpdateData }) => {
    const handleOnDrop = async (files) => {
        let title = '';
        let authors = [];
        let extractedContributionData = null;
        let researchField = null;
        let doi = null;
        let hasSciKGTeXAnnotations = false;

        try {
            const form = new FormData();
            form.append('file', files[0]);
            const responseData = await extractMetadataPdf(form);
            const extractedResearchField = await getResource(responseData.payload.research_fields?.[0]);
            title = responseData.payload.title;
            authors = responseData.payload.authors;
            extractedContributionData = responseData.payload.contents;
            researchField = extractedResearchField;

            hasSciKGTeXAnnotations = true;
        } catch (error) {
            console.error('Something went wrong while parsing the PDF', error);
        }

        if (!hasSciKGTeXAnnotations) {
            try {
                const processedPdf = await new window.DOMParser().parseFromString(await processPdf({ pdf: files[0] }), 'text/xml');
                title = processedPdf.querySelector('fileDesc titleStmt title')?.textContent;
                authors = [...processedPdf.querySelectorAll('fileDesc biblStruct author')].map((author) => ({
                    name: [...author.querySelectorAll('forename, surname')].map((name) => name?.textContent).join(' '),
                    identifiers: {
                        orcid: author.querySelector('idno[type="ORCID"]')?.textContent
                            ? [author.querySelector('idno[type="ORCID"]')?.textContent]
                            : [],
                    },
                }));
                doi = processedPdf.querySelector('fileDesc biblStruct idno[type="DOI"]')?.textContent ?? '';
            } catch (e) {
                console.error(e);
            }
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
