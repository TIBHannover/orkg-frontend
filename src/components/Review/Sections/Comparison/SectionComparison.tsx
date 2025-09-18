import { isEqual, uniq } from 'lodash';
import { FC, useContext, useEffect, useState } from 'react';
import { Provider } from 'react-redux';

import EmbeddedComparison from '@/components/Comparison/EmbeddedComparison/EmbeddedComparison';
import { reviewContext } from '@/components/Review/context/ReviewContext';
import useReview from '@/components/Review/hooks/useReview';
import PrintView from '@/components/Review/Sections/Comparison/PrintView/PrintView';
import { ReviewSection } from '@/services/backend/types';
import { setupStore } from '@/store';

type SectionComparisonProps = {
    section: ReviewSection;
};

const SectionComparison: FC<SectionComparisonProps> = ({ section }) => {
    const { parsedReferences } = useReview();
    const [store, setStore] = useState(null);
    const { usedReferences, setUsedReferences } = useContext(reviewContext);
    const id = section.comparison?.id;

    const updateReferences = (contributions: { paper_id: string }[]) => {
        const paperIds = uniq(contributions.map((contribution) => contribution.paper_id));
        if (paperIds.length === 0) {
            return;
        }
        const _usedReferences = paperIds.map(
            (paperId) => parsedReferences.find((reference) => reference?.parsedReference?.id === paperId)?.rawReference ?? '',
        );

        if (_usedReferences && !isEqual(_usedReferences, usedReferences[section.id])) {
            setUsedReferences((prev) => ({
                ...prev,
                [section.id]: _usedReferences,
            }));
        }
    };

    useEffect(() => {
        const { store: _store } = setupStore();
        // @ts-expect-error awaiting migration away from redux
        setStore(_store);
    }, []);

    return (
        <>
            <PrintView comparisonId={id} />

            <div className="d-print-none">
                {store && id && (
                    <Provider store={store}>
                        <EmbeddedComparison id={id} updateReferences={updateReferences} />
                    </Provider>
                )}
            </div>
        </>
    );
};

export default SectionComparison;
