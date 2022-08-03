import ExistingDoiModal from 'components/ExistingPaperModal/ExistingDoiModal';
import ExistingTitleModal from 'components/ExistingPaperModal/ExistingTitleModal';
import { useCallback, useState } from 'react';
import { getPaperByDOI, getPaperByTitle } from 'services/backend/misc';
import { getStatementsBySubject } from 'services/backend/statements';
import { getPaperData } from 'utils';

const useExistingPaper = () => {
    const [existingPaperDoi, setExistingPaperDoi] = useState(null);
    const [existingPaperTitle, setExistingPaperTitle] = useState(null);
    const [isOpenExistingDoiModal, setIsOpenExistingDoiModal] = useState(false);
    const [isOpenExistingTitleModal, setIsOpenExistingTitleModal] = useState(false);
    const [continueNextStep, setContinueNextStep] = useState(false);

    const checkIfPaperExists = async ({ doi, title, continueNext = false }) => {
        // check if DOI exists
        if (doi && doi.includes('10.') && doi.startsWith('10.')) {
            try {
                const paperData = await getPaperByDOI(doi);
                const statements = await getStatementsBySubject({ id: paperData.id });
                setExistingPaperDoi({ ...getPaperData(paperData, statements), title: paperData.title });
                setIsOpenExistingDoiModal(true);
                return true;
            } catch (e) {
                setExistingPaperDoi(null);
            }
        }
        if (title) {
            // check if title exists
            try {
                const paperData = await getPaperByTitle(title);
                const statements = await getStatementsBySubject({ id: paperData.id });
                setExistingPaperTitle({ ...getPaperData(paperData, statements), title: paperData.title });
                setIsOpenExistingTitleModal(true);
                setContinueNextStep(continueNext);

                return true;
            } catch (e) {
                setExistingPaperTitle(null);
            }
        }

        return false;
    };

    const ExistingPaperModels = useCallback(
        ({ onContinue }) => (
            <>
                {isOpenExistingDoiModal && existingPaperDoi && (
                    <ExistingDoiModal toggle={() => setIsOpenExistingDoiModal(false)} existingPaper={existingPaperDoi} />
                )}
                {isOpenExistingTitleModal && existingPaperTitle && (
                    <ExistingTitleModal
                        isOpen={isOpenExistingTitleModal}
                        toggle={() => setIsOpenExistingTitleModal(v => !v)}
                        existingPaper={existingPaperTitle}
                        onContinue={() => (continueNextStep ? onContinue() : undefined)}
                    />
                )}
            </>
        ),
        [isOpenExistingDoiModal, existingPaperDoi, isOpenExistingTitleModal, existingPaperTitle, continueNextStep],
    );

    return { checkIfPaperExists, ExistingPaperModels };
};

export default useExistingPaper;
