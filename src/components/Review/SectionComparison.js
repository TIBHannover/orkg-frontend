import { setComparisonData, setUsedReferences } from 'slices/reviewSlice';
import PropTypes from 'prop-types';
import EmbeddedComparison from 'components/Comparison/EmbeddedComparison/EmbeddedComparison';
import { useState, useEffect } from 'react';
import configureStore from 'store';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { isEqual } from 'lodash';
import { Alert } from 'reactstrap';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import env from 'components/NextJsMigration/env';

const SectionComparison = ({ id, sectionId }) => {
    const references = useSelector((state) => state.review.references);
    const usedReferences = useSelector((state) => state.review.usedReferences);
    const dispatch = useDispatch();
    const [store, setStore] = useState(null);

    const setComparisonDataCallBack = (data) => {
        if (Object.keys(data).length === 0) {
            return;
        }
        dispatch(
            setComparisonData({
                id,
                data,
            }),
        );
    };

    const updateReferences = (contributions) => {
        const paperIds = contributions.map((contribution) => contribution.paper_id);
        if (paperIds.length === 0) {
            return;
        }
        const _usedReferences = paperIds.map((paperId) => references.find((reference) => reference?.parsedReference?.id === paperId));
        if (!isEqual(_usedReferences, usedReferences[sectionId])) {
            dispatch(setUsedReferences({ references: _usedReferences, sectionId }));
        }
    };

    useEffect(() => {
        const { store } = configureStore();
        setStore(store);
    }, []);

    const url = env('NEXT_PUBLIC_URL') + reverse(ROUTES.COMPARISON, { comparisonId: id });

    return (
        <>
            <Alert color="info" fade={false} className="d-none d-print-block">
                Comparison available via <a href={url}>{url}</a>
            </Alert>
            <div className="d-print-none">
                {store && id && (
                    <Provider store={store}>
                        <EmbeddedComparison id={id} updateReferences={updateReferences} setComparisonDataCallBack={setComparisonDataCallBack} />
                    </Provider>
                )}
            </div>
        </>
    );
};

SectionComparison.propTypes = {
    id: PropTypes.string.isRequired,
    sectionId: PropTypes.string.isRequired,
};

export default SectionComparison;
