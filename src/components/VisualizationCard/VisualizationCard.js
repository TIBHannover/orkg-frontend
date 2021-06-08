import { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import { getVisualization } from 'services/similarity';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
import GDCVisualizationRenderer from 'libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import moment from 'moment';

const VisualizationCardStyled = styled.div`
    a {
        cursor: pointer !important;
        &:hover {
            cursor: pointer !important;
            text-decoration: none;
        }
    }
`;

const PreviewContainer = styled.div`
    height: 100px;
    display: flex;
    align-items: center;
    border: 1px ${props => props.theme.secondary} solid;
    border-radius: 5px;
    overflow: hidden;
    transition: box-shadow 0.5s;
    color: ${props => props.theme.bodyColor};

    &:hover {
        border: 1px ${props => props.theme.primary} solid;
        box-shadow: 0px 0px 5px 0 ${props => props.theme.primary};
    }
`;

const VisualizationCard = props => {
    const [visualizationModelForGDC, setVisualizationModelForGDC] = useState(undefined);
    const [hasVisualizationModelForGDC, setHasVisualizationModelForGDC] = useState(false);
    const [isVisualizationModelForGDCLoading, setIsVisualizationModelForGDCLoading] = useState(false);

    useEffect(() => {
        setIsVisualizationModelForGDCLoading(true);
        getVisualization(props.visualization.id)
            .then(model => {
                setVisualizationModelForGDC(model);
                setHasVisualizationModelForGDC(true);
                setIsVisualizationModelForGDCLoading(false);
            })
            .catch(() => {
                setVisualizationModelForGDC(undefined);
                setHasVisualizationModelForGDC(false);
                setIsVisualizationModelForGDCLoading(false);
                // toast.error('Error loading visualization preview');
            });
    }, [props.visualization.id]);

    return (
        <VisualizationCardStyled className="list-group-item list-group-item-action ">
            <Row>
                <Col md={3}>
                    <Link
                        to={
                            props.visualization.comparisonId
                                ? reverse(ROUTES.COMPARISON, { comparisonId: props.visualization.comparisonId })
                                : reverse(ROUTES.RESOURCE, { id: props.visualization.id })
                        }
                    >
                        {hasVisualizationModelForGDC && !isVisualizationModelForGDCLoading && (
                            <PreviewContainer>
                                <GDCVisualizationRenderer height="100px" model={visualizationModelForGDC} />
                            </PreviewContainer>
                        )}
                        {!hasVisualizationModelForGDC && !isVisualizationModelForGDCLoading && (
                            <PreviewContainer className="text-center justify-content-center">No preview found!</PreviewContainer>
                        )}
                        {isVisualizationModelForGDCLoading && (
                            <PreviewContainer className="text-center justify-content-center">Loading...</PreviewContainer>
                        )}
                    </Link>
                </Col>
                <Col md={9}>
                    <Link
                        to={
                            props.visualization.comparisonId
                                ? reverse(ROUTES.COMPARISON, { comparisonId: props.visualization.comparisonId }) + '#Vis' + props.visualization.id
                                : reverse(ROUTES.RESOURCE, { id: props.visualization.id })
                        }
                    >
                        {props.visualization.label ? props.visualization.label : <em>No title</em>}
                    </Link>
                    <br />
                    <div>
                        <small>
                            {props.visualization.authors && props.visualization.authors.length > 0 && (
                                <>
                                    <Icon size="sm" icon={faUser} /> {props.visualization.authors.map(a => a.label).join(', ')}
                                </>
                            )}
                            {props.visualization.created_at && (
                                <>
                                    <Icon size="sm" icon={faCalendar} className="ml-2 mr-1" />{' '}
                                    {moment(props.visualization.created_at).format('DD-MM-YYYY')}
                                </>
                            )}
                        </small>
                    </div>
                    {props.visualization.description && (
                        <div>
                            <small className="text-muted">{props.visualization.description}</small>
                        </div>
                    )}
                </Col>
            </Row>
        </VisualizationCardStyled>
    );
};

VisualizationCard.propTypes = {
    visualization: PropTypes.shape({
        id: PropTypes.string.isRequired,
        comparisonId: PropTypes.string,
        label: PropTypes.string,
        authors: PropTypes.array,
        created_at: PropTypes.string,
        description: PropTypes.string
    }).isRequired
};

export default VisualizationCard;
