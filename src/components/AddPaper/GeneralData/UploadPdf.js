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
import { getPredicates } from 'services/backend/predicates';

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
            let objective;
            let result;
            let conclusion;
            let researchProblem;
            let method;
            let authors;
            let title;
            let error;
            let resourceUri;
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
                    objective = processedPdf.querySelector('objective')?.textContent;
                    result = processedPdf.querySelector('result')?.textContent;
                    conclusion = processedPdf.querySelector('conclusion')?.textContent;
                    researchProblem = processedPdf.querySelector('researchproblem')?.textContent;
                    method = processedPdf.querySelector('method')?.textContent;
                    title = processedPdf.querySelector('hasTitle')?.textContent;
                    authors = [...processedPdf.querySelectorAll('hasAuthor')].map(auth => auth.textContent);
                    error = processedPdf.querySelector('error')?.textContent;
                    const rdfDescription = processedPdf.querySelector('Description');
                    resourceUri = rdfDescription?.getAttribute('rdf:about');
                    console.log('show files', processedPdf);
                    console.log({
                        extractedResearchField,
                        researchField,
                        objective,
                        result,
                        conclusion,
                        researchProblem,
                        method,
                        title,
                        authors,
                        error,
                        resourceUri,
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
                    showLookupTable: true,
                    title: title || titleGrobid,
                    authors: authorsGrobid || authors,
                    doi,
                    entry: doi,
                    abstract,
                    extractedResearchField: extractedResearchField || researchField,
                    objective,
                    result,
                    conclusion,
                    researchProblem,
                    method,
                    predicateError: error,
                    resourceUri,
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
