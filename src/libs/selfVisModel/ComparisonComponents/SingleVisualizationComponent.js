import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Chart } from 'react-google-charts';
import styled from 'styled-components';

export default class SingleVisualizationComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isHovering: false
        };
    }
    componentDidMount() {
        //console.log('Graph View Modal is mounted');
        window.addEventListener('resize', this.updateDimensions);
        this.updateDimensions();
    }
    componentDidUpdate = prevProps => {
        // always make sure that you have the pointer to the data;
        // this.selfVisModel = new SelfVisDataMode(); // this access the instance of the data (its a singleton)
    };
    componentWillUnmount() {
        //console.log('View modal un mounting');
        window.removeEventListener('resize', this.updateDimensions);
    }
    updateDimensions = () => {
        // test
        this.setState({ windowHeight: 0.5 * window.innerHeight, windowWidth: 0.5 * window.innerWidth });
    };

    handleMouseEnter = () => {
        // get window dimensions to set the fullWidget into the center of the screen.
        this.setState({ isHovering: true, windowHeight: 0.5 * window.innerHeight, windowWidth: 0.5 * window.innerWidth });
    };
    handleMouseLeave = () => {
        this.setState({ isHovering: false });
    };

    /** component rendering entrance point **/
    render() {
        return (
            <>
                <VisualizationCard
                    onClick={() => {
                        this.props.propagateClick(this.props.itemIndex, this.props.input);
                    }}
                    onMouseEnter={this.handleMouseEnter}
                    onMouseLeave={this.handleMouseLeave}
                    isHovered={this.state.isHovering}
                >
                    <div style={{ padding: '5px', pointerEvents: 'none' }}>
                        <Chart
                            chartType={this.props.input.visMethod}
                            data={this.props.input.renderingData}
                            width="200px"
                            height="100px"
                            options={{ showRowNumber: true }}
                        />
                    </div>
                </VisualizationCard>

                {this.state.isHovering && (
                    <VisualizationCardFULL
                        index={this.props.itemIndex}
                        dimensions={{ width: this.state.windowWidth, height: this.state.windowHeight }}
                    >
                        <DescriptionHeader>
                            Description: Here could be a description for the visualization and we could have a very very long one
                        </DescriptionHeader>

                        <Chart
                            chartType={this.props.input.visMethod}
                            data={this.props.input.renderingData}
                            width={this.state.windowWidth - 20 + 'px'}
                            height={this.state.windowHeight - 15 - 0.1 * this.state.windowHeight + 'px'}
                            options={{
                                showRowNumber: true,
                                width: '100%'
                            }}
                        />
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
    border: ${props => (props.isHovered ? '1px solid red' : '1px solid grey')};
    border-radius: 5px;
`;
export const DescriptionHeader = styled.div`
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    color: white;
    background: ${props => props.theme.primary};
    margin-left: -10px;
    margin-right: -10px;
    margin-top: -10px;
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
    border: 1px solid grey;
    box-shadow: 0px 0px 30px grey;
    border-radius: 5px;
    padding: 10px;
    white-space: nowrap;
    margin-left: ${props => 0.5 * props.dimensions.width + 'px'};
    margin-top: 118px;
`;
