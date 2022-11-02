import { faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import DragUploadPdf from 'components/DragUploadPdf/DragUploadPdf';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Alert, Button } from 'reactstrap';
import processPdf from 'services/grobid';
import { updateGeneralData } from 'slices/addPaperSlice';

const UploadPdf = () => {
    const { pdfName } = useSelector(state => state.addPaper);

    const dispatch = useDispatch();

    const handleOnDrop = async files => {
        try {
            const processedPdf = await new window.DOMParser().parseFromString(await processPdf({ pdf: files[0] }), 'text/xml');
            const title = processedPdf.querySelector('fileDesc titleStmt title')?.textContent;
            const authors = [...processedPdf.querySelectorAll('fileDesc biblStruct author')].map(author => ({
                label: [...author.querySelectorAll('forename, surname')].map(name => name?.textContent).join(' '),
                orcid: author.querySelector('idno[type="ORCID"]')?.textContent ?? undefined,
            }));
            const doi = processedPdf.querySelector('fileDesc biblStruct idno[type="DOI"]')?.textContent ?? '';
            const abstract = processedPdf.querySelector('profileDesc abstract')?.textContent;

            dispatch(
                updateGeneralData({
                    pdfName: files?.[0]?.name,
                    showLookupTable: true,
                    title,
                    authors,
                    doi,
                    entry: doi,
                    abstract,
                }),
            );
            toast.success('PDF parsed successfully');
        } catch (e) {
            toast.success('Something went wrong while parsing the PDF');
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
                The uploaded PDF file will not be stored on our servers and is only used to extract (meta)data
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
