import { useCallback, useState } from 'react';

import ExistingPaperModal from '@/components/ExistingPaperModal/ExistingPaperModal';
import getExistingPaper from '@/helpers/getExistingPaper';
import { Paper } from '@/services/backend/types';

const useExistingPaper = () => {
    const [existingPaper, setExistingPaper] = useState<Paper | null>(null);
    const [isOpenExistingModal, setIsOpenExistingModal] = useState(false);

    const checkIfPaperExists = async ({ doi, title }: { doi: string; title: string }) => {
        const paper = await getExistingPaper({ doi, title });
        if (paper) {
            setExistingPaper(paper);
            setIsOpenExistingModal(true);
            return true;
        }
        setExistingPaper(null);
        return false;
    };

    const ExistingPaperModels = useCallback(
        () => isOpenExistingModal && existingPaper && <ExistingPaperModal toggle={() => setIsOpenExistingModal(false)} paper={existingPaper} />,
        [isOpenExistingModal, existingPaper],
    );

    return { checkIfPaperExists, ExistingPaperModels };
};

export default useExistingPaper;
