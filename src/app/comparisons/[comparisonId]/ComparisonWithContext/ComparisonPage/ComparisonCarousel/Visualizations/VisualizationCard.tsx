import { useState } from 'react';
import { Chart } from 'react-google-charts';
import styled from 'styled-components';

import VisualizationPreview from '@/components/Resource/Tabs/Preview/VisualizationPreview/VisualizationPreview';
import ViewVisualizationModal from '@/components/ViewVisualizationModal/ViewVisualizationModal';

export const VisualizationCardStyled = styled.div`
    cursor: pointer;
    border: 1px solid var(--border);
    border-radius: 5px;
    width: 100%;
    height: 122px;
    padding: 5px;
`;

export const StyledChart = styled(Chart)`
    & .google-visualization-table > div {
        overflow: hidden !important;
        width: 220px !important;
    }
`;

const VisualizationCard = ({ id }: { id: string }) => {
    const [isOpenViewModal, setIsOpenViewModal] = useState(false);

    return (
        <VisualizationCardStyled onClick={() => setIsOpenViewModal(true)} id={`#Vis${id}`} className="mx-1">
            <div className="pointer-events-none">
                <VisualizationPreview id={id} width="100%" height="100px" />
            </div>
            {isOpenViewModal && <ViewVisualizationModal isOpen={isOpenViewModal} toggle={() => setIsOpenViewModal((v) => !v)} id={id} />}
        </VisualizationCardStyled>
    );
};

export default VisualizationCard;
