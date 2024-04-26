import ViewVisualizationModal from 'components/ViewVisualizationModal/ViewVisualizationModal';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import styled from 'styled-components';

export const VisualizationCard = styled.div`
    cursor: pointer;
    border: ${(props) => (!props.isHovered ? '1px solid rgb(219,221,229)' : '1px solid #e8616169')};
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

const SingleVisualizationComponent = (props) => {
    const [isOpenViewModal, setIsOpenViewModal] = useState(false);
    const [renderingData, setRenderingData] = useState(undefined);
    const [selfVisModel] = useState(new SelfVisDataModel());

    const { visMethod } = props.input.reconstructionModel.data;
    const { customizationState } = props.input.reconstructionModel.data.reconstructionData;
    useEffect(() => {
        // we need to check if the data input for this component has changed iff then apply reconstructionModel)
        const _renderingData = selfVisModel.applyReconstructionModel(props.input.reconstructionModel);
        setRenderingData(_renderingData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.input.reconstructionModel.orkgOrigin]);

    const handleEditVisualization = () => {
        selfVisModel.applyReconstructionModel(props.input.reconstructionModel);
        props.expandVisualization(true);
    };

    return (
        <VisualizationCard onClick={() => setIsOpenViewModal(true)} id={`#Vis${props.input.reconstructionModel.orkgOrigin}`} className="mx-1">
            <div className="pe-none">
                {renderingData && (
                    <StyledChart
                        chartType={visMethod}
                        data={renderingData}
                        width="100%"
                        height="100px"
                        options={{
                            width: '100%',
                            chartArea: { height: '50%' },
                            showRowNumber: true,
                            hAxis: {
                                title: visMethod === 'BarChart' ? customizationState.yAxisLabel : customizationState.xAxisLabel,
                            },
                            vAxis: {
                                title: visMethod === 'BarChart' ? customizationState.xAxisLabel : customizationState.yAxisLabel,
                            },
                        }}
                    />
                )}
            </div>

            {isOpenViewModal && (
                <ViewVisualizationModal
                    isOpen={isOpenViewModal}
                    toggle={() => setIsOpenViewModal((v) => !v)}
                    data={props.input}
                    onEditVisualization={handleEditVisualization}
                />
            )}
        </VisualizationCard>
    );
};

SingleVisualizationComponent.propTypes = {
    input: PropTypes.object,
    itemIndex: PropTypes.number,
    expandVisualization: PropTypes.func,
};

export default SingleVisualizationComponent;
