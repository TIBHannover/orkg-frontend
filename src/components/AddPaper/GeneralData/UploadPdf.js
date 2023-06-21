import { faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import DragUploadPdf from 'components/DragUploadPdf/DragUploadPdf';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Alert, Button } from 'reactstrap';
import processPdf from 'services/grobid';
import { updateGeneralData } from 'slices/addPaperSlice';
import { getResource, getResourcesByClass } from 'services/backend/resources';
import { CLASSES } from 'constants/graphSettings';
import convertExtractData2ContributionsStatements from './helpers';

const UploadPdf = () => {
    const { pdfName } = useSelector(state => state.addPaper);

    const dispatch = useDispatch();

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
                        console.log(e);
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
                const abstract = processedPdf.querySelector('profileDesc abstract')?.textContent.trim();

                dispatch(
                    updateGeneralData({
                        pdfName: files?.[0]?.name,
                        extractedContributionData,
                        showLookupTable: true,
                        extractedResearchField,
                        title: title || titleGrobid,
                        authors: authors || authorsGrobid,
                        doi,
                        entry: doi,
                        abstract,
                    }),
                );
                toast.success('PDF parsed successfully');
            };

            // file in binary format
            reader.readAsBinaryString(files[0]);
        } catch (e) {
            toast.error('Something went wrong while parsing the PDF', e);
        }
    };

    const handleReset = () =>
        dispatch(
            updateGeneralData({
                pdfName: null,
                extractedContributionData: [],
                showLookupTable: false,
                extractedResearchField: null,
                title: '',
                authors: [],
                doi: '',
                abstract: '',
            }),
        );

    return (
        <div id="pdfUploader">
            <Alert color="info" className="mt-4" fade={false}>
                The uploaded PDF file will not be stored on our servers and is only used to extract (meta)data. If the paper was annotated with{' '}
                <a href="https://orkg.org/about/33/SciKGTeX" target="_blank" rel="noopener noreferrer">
                    SciKGTeX
                </a>{' '}
                in compatiblity mode the annotation will be imported automatically.
            </Alert>
            {pdfName && (
                <div className="border rounded p-2 d-flex align-items-center">
                    <Icon icon={faFile} className="text-primary" style={{ fontSize: '140%' }} />
                    <strong className="ms-2 me-1 d-inline-block">File:</strong>
                    {pdfName}
                    <Button outline size="sm" onClick={handleReset} className="ms-2">
                        Reset
                    </Button>
                </div>
            )}
            {!pdfName && (
                <div className="mt-4 d-flex justify-content-center">
                    <DragUploadPdf onDrop={handleOnDrop} />
                </div>
            )}
        </div>
    );
};

export default UploadPdf;
