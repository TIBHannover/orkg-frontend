import { Alert, Modal } from '@heroui/react';

import DragUploadPdf from '@/components/DragUploadPdf/DragUploadPdf';
import { Author } from '@/components/PaperForm/types';
import { getResource } from '@/services/backend/resources';
import { Node } from '@/services/backend/types';
import processPdf from '@/services/grobid';
import { extractMetadataPdf } from '@/services/orkgNlp';

type UploadResult = {
    extractedContributionData: unknown;
    researchField: Node | null;
    title: string;
    authors: Author[];
    doi?: string;
};

type UploadPdfModalProps = {
    toggle: () => void;
    onUpdateData: (data: UploadResult) => void;
};

const UploadPdfModal = ({ toggle, onUpdateData }: UploadPdfModalProps) => {
    const handleOnDrop = async (files: File[]) => {
        let title = '';
        let authors: Author[] = [];
        let extractedContributionData: unknown = null;
        let researchField: Node | null = null;
        let doi: string | undefined;
        let hasSciKGTeXAnnotations = false;

        try {
            const form = new FormData();
            form.append('file', files[0]);
            const responseData = await extractMetadataPdf(form);
            let extractedResearchField: Node | null = null;
            if (responseData.payload.research_fields?.[0]) {
                extractedResearchField = await getResource(responseData.payload.research_fields?.[0]);
            }
            title = responseData.payload.title;
            authors = (responseData.payload.authors ?? []).map((a: { name: string; identifiers?: { orcid?: string[] } }) => ({
                id: null,
                name: a.name,
                identifiers: a.identifiers ?? {},
            }));
            extractedContributionData = responseData.payload.contents;
            researchField = extractedResearchField;

            hasSciKGTeXAnnotations = true;
        } catch {
            // No SciKGTeX annotations found — fall back to GROBID extraction below.
        }

        if (!hasSciKGTeXAnnotations) {
            try {
                const processedPdf = await new window.DOMParser().parseFromString(await processPdf({ pdf: files[0] }), 'text/xml');
                title = processedPdf.querySelector('fileDesc titleStmt title')?.textContent ?? '';
                authors = [...processedPdf.querySelectorAll('fileDesc biblStruct author')].map((author) => {
                    const orcid = author.querySelector('idno[type="ORCID"]')?.textContent;
                    return {
                        id: null,
                        name: [...author.querySelectorAll('forename, surname')].map((name) => name?.textContent).join(' '),
                        identifiers: { orcid: orcid ? [orcid] : [] },
                    };
                });
                doi = processedPdf.querySelector('fileDesc biblStruct idno[type="DOI"]')?.textContent ?? undefined;
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
        <Modal.Backdrop
            isOpen
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
        >
            <Modal.Container size="lg">
                <Modal.Dialog>
                    <Modal.CloseTrigger className="!top-3 !right-3" />
                    <Modal.Header>
                        <Modal.Heading>Upload PDF</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="p-1">
                        <Alert status="accent">
                            <Alert.Indicator />
                            <Alert.Content>
                                <Alert.Title>We don't store your PDF</Alert.Title>
                                <Alert.Description>
                                    The file is processed on our servers only to extract metadata, and is not retained afterwards. If the paper was
                                    annotated with{' '}
                                    <a href="https://orkg.org/about/33/SciKGTeX" target="_blank" rel="noopener noreferrer" className="underline">
                                        SciKGTeX
                                    </a>
                                    , the annotation will be imported automatically.
                                </Alert.Description>
                            </Alert.Content>
                        </Alert>
                        <div className="mt-6 mb-2 flex justify-center">
                            <DragUploadPdf onDrop={handleOnDrop} />
                        </div>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default UploadPdfModal;
