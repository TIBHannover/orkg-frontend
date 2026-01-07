import { useSelector } from 'react-redux';
import useSWR from 'swr';

import { getPaper, papersUrl } from '@/services/backend/papers';
import { RootStore } from '@/slices/types';

const useImportedPapers = (annotationId: string) => {
    const importedPapers = useSelector(
        (state: RootStore) => state.pdfAnnotation.annotations.find((annotation) => annotation.id === annotationId)?.importedPapers,
    );
    const { data: papers, isLoading } = useSWR(
        importedPapers && importedPapers.length > 0 ? [importedPapers, papersUrl, 'getPaper'] : null,
        ([params]) => Promise.all(params.map((id) => getPaper(id))),
    );
    return { papers, isLoading };
};

export default useImportedPapers;
