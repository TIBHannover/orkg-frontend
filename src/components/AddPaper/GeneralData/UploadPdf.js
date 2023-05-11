/* eslint-disable no-unused-vars */
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import DragUploadPdf from 'components/DragUploadPdf/DragUploadPdf';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Alert, Button } from 'reactstrap';
import processPdf from 'services/grobid';
import { updateGeneralData } from 'slices/addPaperSlice';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';
import { getResource } from 'services/backend/resources';

const UploadPdf = () => {
    const { pdfName } = useSelector(state => state.addPaper);

    const dispatch = useDispatch();

    const handleOnDrop = async files => {
        try {
            // metadata extraction via embedded XML
            GlobalWorkerOptions.workerSrc = pdfjsWorker;

            const reader = new FileReader();
            let extractedResearchField;
            let researchField;
            let authors;
            let title;
            let properties;
            let propertyData;
            const collectProperties = [];
            const resourceURI = [];

            reader.onload = async () => {
                const data = new Uint8Array(reader?.result);
                const loadingTask = getDocument({ data });
                const pdf = await loadingTask.promise;
                const metadata = await pdf.getMetadata();

                if (metadata?.metadata?._data) {
                    const processedPdf = new window.DOMParser().parseFromString(metadata.metadata._data, 'text/xml');
                    // you might want to replace 'querySelector' with 'querySelectorAll' to get all the values if there are multiple annotations of the same type
                    extractedResearchField = processedPdf.querySelector('hasResearchField label')?.textContent;
                    researchField = processedPdf.querySelector('hasResearchField')?.textContent;

                    title = processedPdf.querySelector('hasTitle')?.textContent;
                    authors = [...processedPdf.querySelectorAll('hasAuthor')].map(auth => auth.textContent);
                    [...processedPdf.querySelectorAll('ResearchContribution Description')].forEach(description => {
                        resourceURI.push(description.getAttribute('rdf:about'));
                    });
                    const res = [];

                    resourceURI?.forEach((a, i) => {
                        res.push(getResource(resourceURI[i].split('/').pop()));
                    });

                    const apiResourceCalls = await Promise.all(res);

                    [...processedPdf.querySelectorAll('ResearchContribution')].map(contribution => {
                        properties = contribution.querySelectorAll(':scope > *');

                        propertyData = [...properties]?.map((property, index) => {
                            const textContent = property?.textContent;

                            const uri = [];

                            property.querySelectorAll('Description').forEach(description => {
                                uri.push(description.getAttribute('rdf:about'));
                            });
                            const urlId = uri.map((u, i) => u.split('/').pop());
                            const label = apiResourceCalls.filter(a => a.id === urlId[0])?.[0]?.label ?? '';
                            return {
                                localName: property.localName,
                                resourceURI: urlId,
                                index: index + 1,
                                textContent,
                                label,
                            };
                        });

                        collectProperties.push({ contribution: [...propertyData] });
                        return true;
                    });
                }
            };

            reader.readAsArrayBuffer(files[0]);

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
                    propertyData: collectProperties,
                    showLookupTable: true,
                    title: title || titleGrobid,
                    authors: authorsGrobid || authors,
                    doi,
                    entry: doi,
                    abstract,
                    extractedResearchField: extractedResearchField || researchField,
                    resourceURI,
                }),
            );
            toast.success('PDF parsed successfully');
        } catch (e) {
            toast.error('Something went wrong while parsing the PDF', e);
        }
    };

    const handleReset = () =>
        dispatch(
            updateGeneralData({
                pdfName: null,
            }),
        );

    return (
        <div>
            <Alert color="info" className="mt-4" fade={false}>
                The uploaded PDF file will not be stored on our servers and is only used to extract (meta)data. If the paper was annotated with{' '}
                <a href="https://orkg.org/about/33/SciKGTeX" target="_blank" rel="noopener noreferrer">
                    SciKGTeX
                </a>{' '}
                the annotation will be imported automatically.
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
