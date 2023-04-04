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
            let researchProblemLink;

            let researchContributionURI;
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
                    resourceUri = [...processedPdf.querySelectorAll('ResearchContribution researchproblem')]?.map(
                        description => description.querySelector('Description')?.getAttribute('rdf:about') || null,
                    );

                    researchProblemLink = processedPdf.querySelector('Description label')?.textContent;

                    researchContributionURI = [...processedPdf.querySelectorAll('ResearchContribution')].map(contribution =>
                        contribution.getAttribute('rdf:about'),
                    );
                    researchProblem = [...processedPdf.querySelectorAll('ResearchContribution')].map(
                        researchProblems => researchProblems?.querySelector('researchproblem')?.textContent || null,
                    );
                    method = [...processedPdf.querySelectorAll('ResearchContribution')].map(
                        methods => methods?.querySelector('method')?.textContent || null,
                    );

                    result = [...processedPdf.querySelectorAll('ResearchContribution')].map(
                        results => results?.querySelector('result')?.textContent || null,
                    );

                    objective = [...processedPdf.querySelectorAll('ResearchContribution')].map(
                        objectives => objectives?.querySelector('objective')?.textContent || null,
                    );

                    error = [...processedPdf.querySelectorAll('ResearchContribution')].map(
                        errors => errors?.querySelector('error')?.textContent || null,
                    );
                    conclusion = [...processedPdf.querySelectorAll('ResearchContribution')].map(
                        conclusions => conclusions?.querySelector('conclusion')?.textContent || null,
                    );

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
                        researchProblemLink,
                        researchContributionURI,
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
                    error,
                    resourceUri,
                    researchProblemLink,
                    researchContributionURI,
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
