import PropTypes from 'prop-types';
import { lazy, Suspense } from 'react';

const GraphViewModal = (props) => {
    const LazyGraphViewModal = lazy(() => import('@/components/GraphView/LazyGraphViewModal'));

    return (
        <Suspense>
            <LazyGraphViewModal {...props} />
        </Suspense>
    );
};

GraphViewModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    resourceId: PropTypes.string,
};

export default GraphViewModal;
