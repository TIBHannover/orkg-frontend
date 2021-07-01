import { useState, useEffect } from 'react';
import { Badge } from 'reactstrap';
import { Chart } from 'react-google-charts';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar, faUser, faLink } from '@fortawesome/free-solid-svg-icons';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import MarkFeaturedUnlistedContainer from 'components/Comparison/MarkFeaturedUnlistedContainer';
import moment from 'moment';
import Tippy from '@tippyjs/react';
import { RESOURCE_TYPE_ID } from 'constants/misc';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
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
    &::selection,
    &::-moz-selection {
        color: ${props => props.theme.secondary};
        background: ${props => props.theme.light} !important;
    }
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
    useEffect(() => {
        // we need to check if the data input for this component has changed iff then apply reconstructionModel)
        const renderingData = selfVisModel.applyReconstructionModel(props.input.reconstructionModel);
        setRenderingData(renderingData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.input.reconstructionModel.orkgOrigin]);

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
                        {props.input.label.length > 0 ? 'Title: ' + props.input.label : 'No Title'}
                        <Tippy content="Go to resource page">
                            <Link className="ml-2 resourceLink" to={reverse(ROUTES.RESOURCE, { id: props.input.id })}>
                                <Icon icon={faLink} color="#fff" />
                            </Link>
                        </Tippy>
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
                                    title: visMethod === 'BarChart' ? customizationState.yAxisLabel : customizationState.xAxisLabel
                                },
                                vAxis: {
                                    title: visMethod === 'BarChart' ? customizationState.xAxisLabel : customizationState.yAxisLabel
                                }
                            }}
                        />
                    )}
                    <hr className="m-1" />

                    <div className="d-flex">
                        <div className="col-6 p-2 mb-2" style={{ borderRight: '2px solid #ddd' }}>
                            <b>Description:</b> <br /> <span>{props.input.description ? props.input.description : 'No Description'}</span>{' '}
                        </div>
                        <div className="col-6 p-2 mb-2">
                            <b>Meta Information:</b>{' '}
                            <MarkFeaturedUnlistedContainer
                                size="1x"
                                id={props.input.id}
                                featured={props.input?.featured}
                                unlisted={props.input?.unlisted}
                            />
                            <div className="mt-2 mb-2">
                                <i>Created on: </i>
                                <span className="badge badge-light mr-2">
                                    <Icon icon={faCalendar} className="text-primary" />{' '}
                                    {props.input.created_at ? moment(props.input.created_at).format('dddd, MMMM Do YYYY') : ''}
                                </span>
                            </div>
                            {props.input.authors && props.input.authors.length > 0 && (
                                <div className="mb-2">
                                    <i>Created by: </i>
                                    {props.input.authors.map(author => {
                                        if (author && author.class === RESOURCE_TYPE_ID) {
                                            return (
                                                <Link
                                                    className="d-inline-block mr-2 mb-2"
                                                    to={reverse(ROUTES.AUTHOR_PAGE, { authorId: author.id })}
                                                    key={`author${author.id}`}
                                                >
                                                    <Badge color="light">
                                                        <Icon icon={faUser} className="text-primary" /> {author.label}
                                                    </Badge>
                                                </Link>
                                            );
                                        } else {
                                            return (
                                                <Badge key={`author${author.id}`} color="light" className="mr-2 mb-2">
                                                    <Icon icon={faUser} /> {author.label}
                                                </Badge>
                                            );
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
                                    title: visMethod === 'BarChart' ? customizationState.yAxisLabel : customizationState.xAxisLabel
                                },
                                vAxis: {
                                    title: visMethod === 'BarChart' ? customizationState.xAxisLabel : customizationState.yAxisLabel
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
