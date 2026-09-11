import { Modal } from '@heroui/react';
import PropTypes from 'prop-types';
import { lazy, Suspense } from 'react';

import GraphLoadingIndicator from '@/components/GraphView/GraphLoadingIndicator';
import GraphViewModalShell from '@/components/GraphView/GraphViewModalShell';

const LazyGraphViewModal = lazy(() => import('@/components/GraphView/LazyGraphViewModal'));

const GraphViewModal = ({ toggle, resourceId }) => (
    <Suspense
        fallback={
            <GraphViewModalShell toggle={toggle}>
                <Modal.CloseTrigger />
                <Modal.Header className="relative shrink-0 border-b border-border px-6 pt-4 pb-3">
                    <Modal.Heading className="pe-10">View graph</Modal.Heading>
                </Modal.Header>
                <Modal.Body className="relative mt-0 min-h-0 flex-1 overflow-hidden p-0">
                    <GraphLoadingIndicator message="Preparing graph view..." />
                </Modal.Body>
            </GraphViewModalShell>
        }
    >
        <LazyGraphViewModal toggle={toggle} resourceId={resourceId} />
    </Suspense>
);

GraphViewModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    resourceId: PropTypes.string,
};

export default GraphViewModal;
