import DragUploadPdf from 'components/DragUploadPdf/DragUploadPdf';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Alert, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { getResource, getResourcesByClass } from 'services/backend/resources';
import processPdf from 'services/grobid';
import convertExtractData2ContributionsStatements from 'components/ViewPaper/UploadPdfModal/helpers';

const UploadPdfModal = ({ toggle, onUpdateData }) => {
    const handleOnDrop = async files => {
        try {
            // metadata extraction via embedded XML
            const reader = new FileReader();

            reader.onload = async () => {
                let researchField;
                let authors;
                let title;
                let extractedResearchField;
                let extractedContributionData;
                const collectedContribution = [];
                let resourceURI = [];
                let metadata;

                // read the contents of the file
                const docStr = reader?.result;
                const sciKGMetadata = '/Type /SciKGMetadata';
                const metadataPatterns = new RegExp(`(${sciKGMetadata}.*?)stream(.*?)endstream`, 'gs');
                const matches = docStr.matchAll(metadataPatterns);
                for (const match of matches) {
                    const header = match[1];
                    const data = match[2];
                    if (header.includes('/Type /SciKGMetadata')) {
                        metadata = data.toString('utf-8').trim();
                    }
                }
                if (metadata) {
                    const processedPdf = new window.DOMParser().parseFromString(metadata, 'text/xml');
                    // you might want to replace 'querySelector' with 'querySelectorAll' to get all the values if there are multiple annotations of the same type
                    researchField = processedPdf.querySelector('hasResearchField')?.textContent;
                    try {
                        const field = (await getResourcesByClass({ id: CLASSES.RESEARCH_FIELD, q: researchField, exact: true })).content.find(
                            rf => rf.label === researchField,
                        );
                        extractedResearchField = field
                            ? {
                                  id: field.id,
                                  label: field.label,
                              }
                            : null;
                    } catch (e) {
                        console.error(e);
                    }

                    title = processedPdf.querySelector('hasTitle')?.textContent;

                    authors = [...processedPdf.querySelectorAll('hasAuthor')].map(author => ({
                        label: author.textContent,
                        id: author.textContent,
                        orcid: author.querySelector('Description')?.getAttribute('rdf:about')?.split('/').pop() ?? null,
                    }));

                    resourceURI = [...processedPdf.querySelectorAll('ResearchContribution Description')].map(description =>
                        description.getAttribute('rdf:about'),
                    );
                    const resourcePromises = resourceURI.map(resource => getResource(resource.split('/').pop()));
                    const apiResourceCalls = await Promise.all(resourcePromises).catch(() => []);
                    for (const contribution of processedPdf.querySelectorAll('ResearchContribution')) {
                        const properties = contribution.querySelectorAll(':scope > *');
                        const propertyData = [...properties]?.map((property, index) => {
                            const textContent = property?.textContent;
                            const uri = [];

                            property.querySelectorAll('Description').forEach(description => {
                                uri.push(description.getAttribute('rdf:about'));
                            });
                            const urlId = uri.map(u => u.split('/').pop());
                            const label = apiResourceCalls.filter(a => a.id === urlId[0])?.[0]?.label ?? '';
                            return {
                                localName: property.localName,
                                resourceURI: label ? urlId : [],
                                index: index + 1,
                                textContent,
                                label,
                            };
                        });

                        collectedContribution.push({ data: propertyData });
                    }
                    extractedContributionData = await convertExtractData2ContributionsStatements(collectedContribution);
                }

                // metadata extraction via Grobid
                const processedPdf = await new window.DOMParser().parseFromString(await processPdf({ pdf: files[0] }), 'text/xml');
                const titleGrobid = processedPdf.querySelector('fileDesc titleStmt title')?.textContent;
                const authorsGrobid = [...processedPdf.querySelectorAll('fileDesc biblStruct author')].map(author => ({
                    label: [...author.querySelectorAll('forename, surname')].map(name => name?.textContent).join(' '),
                    orcid: author.querySelector('idno[type="ORCID"]')?.textContent ?? undefined,
                }));
                const doi = processedPdf.querySelector('fileDesc biblStruct idno[type="DOI"]')?.textContent ?? '';

                if (onUpdateData) {
                    onUpdateData({
                        extractedContributionData,
                        researchField: extractedResearchField,
                        title: title || titleGrobid,
                        authors: authors || authorsGrobid,
                        doi,
                    });
                }
                toggle();
            };

            // file in binary format
            reader.readAsBinaryString(files[0]);
        } catch (e) {
            toast.error('Something went wrong while parsing the PDF', e);
        }
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
