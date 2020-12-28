import React, { Component } from 'react';
import { Chart } from 'react-google-charts';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import PropTypes from 'prop-types';

const VisualizationCard = styled.div`
    margin: 0 2px;
    cursor: pointer;
    border: ${props => (!props.isHovered ? '1px solid rgb(219,221,229)' : '1px solid #e8616169')};
    border-radius: 5px;
    width: 220px;
`;

const DescriptionHeader = styled.div`
    color: white;
    background: ${props => props.theme.primary};
    padding: 5px;
    text-overflow: ellipsis;
    height: 32px;
`;

class SingleVisualizationComponent extends Component {
    constructor(props) {
        super(props);
        // get window dimensions to set the fullWidget into the center of the screen.
        const width = this.getAvailableWidth();
        this.state = {
            isHovering: false,
            renderingData: undefined,
            windowHeight: 0.5 * window.innerHeight,
            windowWidth: 0.8 * width
        };

        this.selfVisModel = new SelfVisDataModel();
    }

    componentDidMount() {
        const renderingData = this.selfVisModel.applyReconstructionModel(this.props.input.reconstructionModel);
        this.setState({ renderingData: renderingData });
    }

    componentDidUpdate = prevProps => {
        if (this.props.input.reconstructionModel.orkgOrigin !== prevProps.input.reconstructionModel.orkgOrigin) {
            // we need to check if the data input for this component has changed iff then apply reconstructionModel)
            const renderingData = this.selfVisModel.applyReconstructionModel(this.props.input.reconstructionModel);
            this.setState({ renderingData: renderingData });
        }
        // ensure on hovering that the scrollarea state is always correct
        this.props.propagateUpdate();
    };

    getAvailableWidth = () => {
        const item = document.getElementById('PreviewCarouselContainer');
        return item?.clientWidth;
    };

    /** hover over a preview card handler -- currently disabled **/
    handleMouseEnter = () => {
        // get window dimensions to set the fullWidget into the center of the screen.
        const width = this.getAvailableWidth();
        this.setState({ isHovering: true, windowHeight: 0.4 * window.innerHeight, windowWidth: 0.8 * width });
    };
    handleMouseLeave = () => {
        this.setState({ isHovering: false });
    };

    /** component rendering entrance point **/
    render() {
        const visMethod = this.props.input.reconstructionModel.data.visMethod;
        return (
            <>
                <Tippy
                    onShow={this.handleMouseEnter}
                    onHide={this.handleMouseLeave}
                    interactive={true}
                    placement="bottom"
                    theme="visualizationPreview"
                    maxWidth={this.state.windowWidth}
                    content={
                        <div
                            index={this.props.itemIndex}
                            style={{
                                overflow: 'hidden',
                                borderRadius: '4px',
                                width: this.state.windowWidth - 20 + 'px',
                                height: this.state.windowHeight + 'px'
                            }}
                        >
                            <DescriptionHeader>
                                {this.props.input.label.length > 0 ? 'Title: ' + this.props.input.label + ' | ' : ''}
                                {this.props.input.description.length > 0 ? 'Description: ' + this.props.input.description : ''}
                                {this.props.input.description.length === 0 &&
                                    this.props.input.label.length === 0 &&
                                    'No title and no description available'}
                            </DescriptionHeader>
                            {this.state.isHovering && (
                                <Chart
                                    chartType={visMethod}
                                    data={this.state.renderingData}
                                    width={this.state.windowWidth - 20 + 'px'}
                                    height={this.state.windowHeight + 'px'}
                                    options={{
                                        showRowNumber: true,
                                        width: '100%'
                                    }}
                                />
                            )}
                            {!this.state.isHovering && (
                                <div style={{ width: this.state.windowWidth - 20 + 'px', height: this.state.windowHeight - 50 + 'px' }} />
                            )}
                        </div>
                    }
                >
                    <VisualizationCard
                        onClick={() => {
                            this.selfVisModel.applyReconstructionModel(this.props.input.reconstructionModel);
                            this.props.expandVisualization(true);
                        }}
                        isHovered={this.state.isHovering}
                    >
                        <div style={{ padding: '5px', pointerEvents: 'none', minWidth: '200px', minHeight: '100px' }}>
                            {this.state.renderingData && (
                                <Chart
                                    chartType={visMethod}
                                    data={this.state.renderingData}
                                    width="200px"
                                    height="100px"
                                    options={{ showRowNumber: true }}
                                />
                            )}
                        </div>
                    </VisualizationCard>
                </Tippy>
            </>
        );
    }
}

SingleVisualizationComponent.propTypes = {
    input: PropTypes.object,
    itemIndex: PropTypes.number,
    expandVisualization: PropTypes.func,
    propagateUpdate: PropTypes.func
};

export default SingleVisualizationComponent;
