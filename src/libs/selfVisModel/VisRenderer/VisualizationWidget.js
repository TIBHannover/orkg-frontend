import React, { Component } from 'react';
import { Button } from 'reactstrap';
import styled, { keyframes } from 'styled-components';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import PropTypes from 'prop-types';
import VisualizationSelector from './VisualizationSelector';
import AbstractRenderer from './AbstractRenderer';
import AbstractCustomizationWidget from './AbstractCustomizationWidget';
import TableInput from './tableInput';

export default class VisualizationWidget extends Component {
    constructor(props) {
        super(props);
        // create some references to the widgets
        this.refAbstractRenderer = React.createRef();
        this.refVisualizationSelector = React.createRef();
        this.refAbstractCustomizationWidget = React.createRef();

        this.state = {
            inputTableExpanded: false,
            enableAnimations: false,
        };
    }

    componentDidMount() {
        const model = new SelfVisDataModel();
        model.createGDCDataModel(); // gets the singleton ptr and creates the gdc model

        window.addEventListener('resize', this.updateDimensions);
        this.updateDimensions();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    updateDimensions = () => {
        this.setState({ windowWidth: window.innerWidth, enableAnimations: false });
    };

    propagateUpdateForTheSelector = () => {};

    selectorPropagateUpdates = () => {
        if (this.refAbstractRenderer.current) {
            this.refAbstractRenderer.current.applySelectorMethod();
        }
        if (this.refAbstractCustomizationWidget.current) {
            this.refAbstractCustomizationWidget.current.applySelectorMethod();
        }
    };

    customizerPropagateUpdates = state => {
        if (this.refAbstractRenderer.current) {
            this.refAbstractRenderer.current.setCustomizationState(state);
        }
    };

    createChartVisualization = () => {
        if (this.refAbstractRenderer.current) {
            this.refAbstractRenderer.current.createChartVisualization();
        }
    };

    ensureConnection = () => {
        if (this.refAbstractRenderer.current) {
            this.refAbstractRenderer.current.applySelectors();
        }
    };

    makeRequestAreaWidth = () => this.props.comparePropsWithActualWidth(this.props.width);

    /** component rendering entrance point * */
    render() {
        const areaWidth = this.makeRequestAreaWidth();
        const widthOffset = 400;
        return (
            <div style={{ height: `${this.props.height}px`, overflow: 'auto' }}>
                {!this.props.isLoading && (
                    <div>
                        <InputTableContainer
                            id="inputTableContainer"
                            expanded={this.state.inputTableExpanded}
                            initialRendering={this.state.enableAnimations}
                            width="400"
                            style={{
                                width: '400px',
                                // backgroundColor: 'red',
                                padding: '10px',
                                height: this.props.height,
                                float: 'left',
                                position: 'relative',
                            }}
                        >
                            {this.state.inputTableExpanded && <TableInput height={this.props.height - 5} />}
                        </InputTableContainer>

                        <ControlWidgetContainer
                            expanded={this.state.inputTableExpanded}
                            initialRendering={this.state.enableAnimations}
                            parentWidth="400"
                            totalWidth={areaWidth}
                            style={{
                                float: 'left',
                                position: 'absolute',
                                padding: '10px',
                                // backgroundColor: 'green',
                                width: this.state.inputTableExpanded ? areaWidth - widthOffset : areaWidth,
                            }}
                        >
                            <div style={{ display: 'flex' }}>
                                <SideBar style={{ height: this.props.height - 5 }}>
                                    <Button
                                        color="light"
                                        size="sm"
                                        className="ms-3 mt-3"
                                        onClick={() => {
                                            this.setState({ inputTableExpanded: !this.state.inputTableExpanded, enableAnimations: true });
                                        }}
                                    >
                                        {this.state.inputTableExpanded ? 'Hide input table' : 'Show input table'}
                                    </Button>
                                    <div>
                                        <VisualizationSelector
                                            ref={this.refVisualizationSelector}
                                            propagationFunction={this.selectorPropagateUpdates}
                                        />
                                        <div className="px-3">
                                            <AbstractCustomizationWidget
                                                ref={this.refAbstractCustomizationWidget}
                                                propagateUpdates={this.customizerPropagateUpdates}
                                                createChartVisualization={this.createChartVisualization}
                                            />
                                        </div>
                                    </div>
                                </SideBar>
                                <AbstractRenderer
                                    ref={this.refAbstractRenderer}
                                    referenceToSelector={this.refVisualizationSelector}
                                    ensureConnection={this.ensureConnection}
                                    propageUpdates={this.propagateUpdateForTheSelector}
                                    isInputTableExpanded={this.state.inputTableExpanded}
                                    visualizationWidth={this.state.inputTableExpanded ? areaWidth - 400 - 320 : areaWidth - 320}
                                    visualizationHeight={this.props.height - 5}
                                />
                            </div>
                        </ControlWidgetContainer>
                    </div>
                )}
            </div>
        );
    }
}

VisualizationWidget.propTypes = {
    isLoading: PropTypes.bool,
    height: PropTypes.number,
    width: PropTypes.number,
    comparePropsWithActualWidth: PropTypes.func,
};

const expandAndHideContentContainerAnimation = ({ expanded, width, initialRendering }) => {
    if (initialRendering) {
        return keyframes`
  from {
    left: ${expanded ? -width : 0}px;
  
  }
  to {
    left: ${expanded ? 0 : -width}px;

  
  }
`;
    }
    // this is the static rendering on load
    return keyframes`
  from {
    left: ${expanded ? 0 : -width}px;
    
  }
  to {
    left: ${expanded ? 0 : -width}px;
    
  
  }
`;
};

const expandContainerAnimation = ({ expanded, parentWidth, totalWidth, initialRendering }) => {
    if (initialRendering) {
        return keyframes`
  from {
    left: ${expanded ? 0 : parentWidth}px;
    width: ${expanded ? totalWidth : totalWidth - parentWidth}px;
  }
  to {
    left: ${expanded ? parentWidth : 0}px;
    width: ${expanded ? totalWidth - parentWidth : totalWidth}px;
  }
`;
    }
    // this is the static rendering on load
    return keyframes`
  from {
    left: ${expanded ? parentWidth : 0}px;
    width: ${expanded ? totalWidth - parentWidth : totalWidth}px;
  }
  to {
    left: ${expanded ? parentWidth : 0}px;
    width: ${expanded ? totalWidth - parentWidth : totalWidth}px;
  }
`;
};
const InputTableContainer = styled.div`
    animation-name: ${expandAndHideContentContainerAnimation};
    animation-duration: 400ms;
    left: ${props => (props.expanded ? 0 : -props.width)}px;
`;

const ControlWidgetContainer = styled.div`
    animation-name: ${expandContainerAnimation};
    animation-duration: 400ms;
    left: ${props => (props.expanded ? props.parentWidth : 0)}px;
    width: ${props => (props.expanded ? props.totalWidth - props.parentWidth : props.totalWidth)}px;
`;

const SideBar = styled.div`
    width: 320px;
    min-width: 320px;
    overflow: auto;
    background-color: ${props => props.theme.lightLighter} !important;
    border: 1px solid ${props => props.theme.lightDarker} !important;
    border-radius: ${props => props.theme.borderRadius};
`;
