import { isEqual } from 'lodash';
import { reverse } from 'named-urls';
import { env } from 'next-runtime-env';
import { FC, useContext, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { Alert } from 'reactstrap';

import EmbeddedComparison from '@/components/Comparison/EmbeddedComparison/EmbeddedComparison';
import { reviewContext } from '@/components/Review/context/ReviewContext';
import useReview from '@/components/Review/hooks/useReview';
import ROUTES from '@/constants/routes';
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
        const paperIds = contributions.map((contribution) => contribution.paper_id);
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

    // full URL needed for printing view
    const url = env('NEXT_PUBLIC_URL') + reverse(ROUTES.COMPARISON, { comparisonId: id });

    return (
        <>
            <Alert color="info" fade={false} className="d-none d-print-block">
                Comparison available via <a href={url}>{url}</a>
            </Alert>
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
