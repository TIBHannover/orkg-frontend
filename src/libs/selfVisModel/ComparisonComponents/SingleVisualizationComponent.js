import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Chart } from 'react-google-charts';
import styled from 'styled-components';
import SelfVisDataModel from '../SelfVisDataModel';

export default class SingleVisualizationComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isHovering: false,
            renderingData: undefined
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
    };

    getAvailableWidth = () => {
        const item = document.getElementById('PreviewCarouselContainer');
        return item.clientWidth;
    };

    /** hover over a preview card handler -- currently disabled **/
    handleMouseEnter = () => {
        // get window dimensions to set the fullWidget into the center of the screen.
        const width = this.getAvailableWidth();
        this.setState({ isHovering: true, windowHeight: 0.5 * window.innerHeight, windowWidth: 0.8 * width });
    };
    handleMouseLeave = () => {
        this.setState({ isHovering: false });
    };

    /** component rendering entrance point **/
    render() {
        const visMethod = this.props.input.reconstructionModel.data.visMethod;

        return (
            <>
                <VisualizationCard
                    onClick={() => {
                        this.selfVisModel.applyReconstructionModel(this.props.input.reconstructionModel);
                        this.props.propagateClick(true);
                    }}
                    onMouseEnter={this.handleMouseEnter}
                    onMouseLeave={this.handleMouseLeave}
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

                {this.state.isHovering && (
                    <VisualizationCardFULL
                        index={this.props.itemIndex}
                        dimensions={{ width: this.state.windowWidth, height: this.state.windowHeight }}
                    >
                        <DescriptionHeader>
                            {this.props.input.title.length > 0 ? 'Title: ' + this.props.input.title + ' | ' : ''}
                            {this.props.input.description.length > 0 ? 'Description: ' + this.props.input.description : ''}
                            {this.props.input.description.length === 0 &&
                                this.props.input.title.length === 0 &&
                                'No title and no description available'}
                        </DescriptionHeader>
                        <div
                            style={{
                                // border: '1px solid rgb(219,221,229)',
                                // borderTop: '0px',
                                width: '100%',
                                height: this.state.windowHeight + 'px'
                            }}
                        >
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
                        </div>
                    </VisualizationCardFULL>
                )}
            </>
        );
    }
}

SingleVisualizationComponent.propTypes = {
    input: PropTypes.object,
    itemIndex: PropTypes.number,
    propagateClick: PropTypes.func
};

export const VisualizationCard = styled.div`
    margin: 0 2px;
    cursor: pointer;
    border: ${props => (!props.isHovered ? '1px solid rgb(219,221,229)' : '1px solid #e8616169')};
    border-radius: 5px;
    width: 220px;
`;
export const DescriptionHeader = styled.div`
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    color: white;
    background: ${props => props.theme.primary};
    margin-top: -32px;
    padding: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 32px;
`;

export const VisualizationCardFULL = styled.div`
    position: absolute;
    z-index: 100;
    width: ${props => props.dimensions.width + 'px'};
    height: ${props => props.dimensions.height + 'px'};
    background-color: white;
    margin: 0 2px;
    cursor: pointer;
    box-shadow: 0px 0px 30px grey;

    padding: 0;
    white-space: nowrap;
    margin-left: ${props => 0.1 * props.dimensions.width + 'px'};
    margin-top: 150px;
`;
