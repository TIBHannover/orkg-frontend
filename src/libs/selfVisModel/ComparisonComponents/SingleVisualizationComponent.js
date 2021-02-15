import React, { useState, useEffect } from 'react';
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

const SingleVisualizationComponent = props => {
    const getAvailableWidth = () => {
        const item = document.getElementById('PreviewCarouselContainer');
        return item?.clientWidth;
    };

    // get window dimensions to set the fullWidget into the center of the screen.
    const width = getAvailableWidth();

    const [isHovering, setIsHovering] = useState(false);
    const [renderingData, setRenderingData] = useState(undefined);
    const [windowHeight, setWindowHeight] = useState(0.5 * window.innerHeight);
    const [windowWidth, setWindowWidth] = useState(0.8 * width);
    const [selfVisModel] = useState(new SelfVisDataModel());

    /** hover over a preview card handler -- currently disabled **/
    const handleMouseEnter = () => {
        // get window dimensions to set the fullWidget into the center of the screen.
        const width = getAvailableWidth();
        setIsHovering(true);
        setWindowHeight(0.4 * window.innerHeight);
        setWindowWidth(0.8 * width);
    };
    const handleMouseLeave = () => {
        setIsHovering(false);
    };

    const visMethod = props.input.reconstructionModel.data.visMethod;
    const customizationState = props.input.reconstructionModel.data.reconstructionData.customizationState;
    // console.log(customizationState);
    // console.log('costmization State: ', customizationState.xAxisLabel, customizationState.yAxisLabel);
    useEffect(() => {
        // we need to check if the data input for this component has changed iff then apply reconstructionModel)
        const renderingData = selfVisModel.applyReconstructionModel(props.input.reconstructionModel);
        setRenderingData(renderingData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.input.reconstructionModel.orkgOrigin]);

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return (
        <Tippy
            onShow={handleMouseEnter}
            onHide={handleMouseLeave}
            interactive={true}
            placement="bottom"
            theme="visualizationPreview"
            maxWidth={windowWidth}
            content={
                <div
                    index={props.itemIndex}
                    style={{
                        overflow: 'hidden',
                        borderRadius: '4px',
                        width: windowWidth + 'px'
                        // height: windowHeight + 100 + 'px'
                    }}
                >
                    <DescriptionHeader>
                        {/*{props.input.label.length > 0 ? 'Title: ' + props.input.label + ' | ' : ''}*/}
                        {/*{props.input.description.length > 0 ? 'Description: ' + props.input.description : ''}*/}
                        {props.input.label.length > 0 ? 'Title: ' + props.input.label : ''}
                        {props.input.description.length === 0 && props.input.label.length === 0 && 'No title and no description available'}
                    </DescriptionHeader>
                    {isHovering && (
                        <Chart
                            chartType={visMethod}
                            data={renderingData}
                            width={windowWidth - 20 + 'px'}
                            height={windowHeight - 50 + 'px'}
                            options={{
                                showRowNumber: true,
                                width: '100%',
                                hAxis: {
                                    title: customizationState.xAxisLabel
                                },
                                vAxis: {
                                    title: customizationState.yAxisLabel
                                }
                            }}
                        />
                    )}
                    <hr className="m-1" />

                    <div className="d-flex pl-2 pr-2">
                        <div style={{ width: '50%', borderRight: '2px solid #ddd', paddingRight: '5px' }}>
                            <b>Description:</b> <br /> <span>{props.input.description}</span>{' '}
                        </div>
                        <div className="ml-2" style={{ width: '47%' }}>
                            <b>Meta Information:</b> <br />{' '}
                            <span>Created on: {new Date(props.input.created_at).toLocaleDateString(undefined, options)}</span>
                            {props.input.authorNames && props.input.authorNames.length > 0 && (
                                <div>
                                    Created by:{' '}
                                    {props.input.authorNames.map((item, index) => {
                                        if (index === props.input.authorNames.length - 1) {
                                            return <>{item.label} </>;
                                        } else {
                                            return <>{item.label}, </>;
                                        }
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    {!isHovering && <div style={{ width: windowWidth - 20 + 'px', height: windowHeight - 50 + 'px' }} />}
                </div>
            }
        >
            <VisualizationCard
                onClick={() => {
                    selfVisModel.applyReconstructionModel(props.input.reconstructionModel);
                    props.expandVisualization(true);
                }}
                isHovered={isHovering}
                id={`#Vis${props.input.reconstructionModel.orkgOrigin}`}
            >
                <div style={{ padding: '5px', pointerEvents: 'none', minWidth: '200px', minHeight: '100px' }}>
                    {renderingData && (
                        <Chart
                            chartType={visMethod}
                            data={renderingData}
                            width="200px"
                            height="100px"
                            options={{
                                width: '100%',
                                chartArea: { height: '50%' },
                                showRowNumber: true,
                                hAxis: {
                                    title: customizationState.xAxisLabel
                                },
                                vAxis: {
                                    title: customizationState.yAxisLabel
                                }
                            }}
                        />
                    )}
                </div>
            </VisualizationCard>
        </Tippy>
    );
};

SingleVisualizationComponent.propTypes = {
    input: PropTypes.object,
    itemIndex: PropTypes.number,
    expandVisualization: PropTypes.func
};

export default SingleVisualizationComponent;
