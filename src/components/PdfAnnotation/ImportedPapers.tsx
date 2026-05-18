import { Button, Spinner } from '@heroui/react';
import Link from 'next/link';
import { AnchorHTMLAttributes } from 'react';
import { useSelector } from 'react-redux';

import PaperCard from '@/components/Cards/PaperCard/PaperCard';
import useImportedPapers from '@/components/PdfAnnotation/hooks/useImportedPapers';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Paper } from '@/services/backend/types';
import { RootStore } from '@/slices/types';

type ImportedPapersProps = {
    annotationId: string;
};

const ImportedPapers = ({ annotationId }: ImportedPapersProps) => {
    const { papers, isLoading } = useImportedPapers(annotationId);
    const annotation = useSelector((state: RootStore) => state.pdfAnnotation.annotations.find((an) => an.id === annotationId));

    const gridEditorUrl = annotation?.importedContributions
        ? `${reverse(ROUTES.GRID_EDITOR)}?entityIds=${annotation.importedContributions.map((entry) => entry)}`
        : null;
    const comparisonUrl = annotation?.importedContributions
        ? `${reverse(ROUTES.CREATE_COMPARISON)}&sourceIds=${annotation.importedContributions.join(',')}`
        : null;

    return (
        <div>
            {isLoading && <Spinner />}
            {!isLoading && papers && papers.length > 0 && (
                <>
                    <div className="mb-4">
                        The imported papers can be viewed in the grid editor or a new comparison can be created with them.
                        <br />
                        <div className="mt-4 flex gap-2">
                            <Button
                                size="sm"
                                variant="primary"
                                render={(props) => (
                                    <Link {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)} href={gridEditorUrl ?? ''} target="_blank" />
                                )}
                            >
                                Grid editor
                            </Button>
                            <Button
                                size="sm"
                                variant="primary"
                                render={(props) => (
                                    <Link {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)} href={comparisonUrl ?? ''} target="_blank" />
                                )}
                            >
                                Create comparison
                            </Button>
                        </div>
                    </div>
                    <ul className="divide-y divide-border rounded-md border border-border">
                        {papers.map((paper: Paper) => (
                            <PaperCard key={paper.id} paper={paper} />
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default ImportedPapers;
