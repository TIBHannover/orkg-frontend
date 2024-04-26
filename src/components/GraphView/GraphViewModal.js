import PropTypes from 'prop-types';
import { Suspense, lazy } from 'react';

const GraphViewModal = (props) => {
    const LazyGraphViewModal = lazy(() => import('components/GraphView/LazyGraphViewModal'));

    return (
        <Suspense fallback={<div className="text-center my-5">Loading...</div>}>
            <LazyGraphViewModal {...props} />
        </Suspense>
    );
};

GraphViewModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    resourceId: PropTypes.string,
};

export default GraphViewModal;
