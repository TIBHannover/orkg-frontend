import { reverse } from 'named-urls';
import Link from 'next/link';
import React from 'react';
import { useSelector } from 'react-redux';
import { Spinner } from 'reactstrap';

import PaperCard from '@/components/Cards/PaperCard/PaperCard';
import useImportedPapers from '@/components/PdfAnnotation/hooks/useImportedPapers';
import Button from '@/components/Ui/Button/Button';
import ListGroup from '@/components/Ui/List/ListGroup';
import ROUTES from '@/constants/routes';
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
        ? `${reverse(ROUTES.COMPARISON_NOT_PUBLISHED)}?contributions=${annotation.importedContributions.join(',')}`
        : null;
    return (
        <div>
            {isLoading && <Spinner />}
            {!isLoading && papers && papers.length > 0 && (
                <>
                    <div className="mb-3">
                        The imported papers can be viewed in the grid editor or in a comparison view.
                        <br />
                        <Button size="sm" tag={Link} href={gridEditorUrl} target="_blank" color="primary" className="mt-3 me-2">
                            Grid editor
                        </Button>
                        <Button size="sm" tag={Link} href={comparisonUrl} target="_blank" color="primary" className="mt-3">
                            View comparison
                        </Button>
                    </div>
                    <ListGroup>
                        {papers.map((paper: Paper) => (
                            <PaperCard key={paper.id} paper={paper} />
                        ))}
                    </ListGroup>
                </>
            )}
        </div>
    );
};

export default ImportedPapers;
