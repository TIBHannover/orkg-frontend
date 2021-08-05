import { Component } from 'react';
import PropTypes from 'prop-types';
import { getStatementsBySubjects } from 'services/backend/statements';
import styled from 'styled-components';
import ROUTES from 'constants/routes';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight, faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { StyledSlider } from 'components/ResearchProblem/Benchmarks/styled';
import { flatMap, find } from 'lodash';
import { getRelatedFiguresData } from 'utils';

const SlideItem = styled.div`
    overflow: hidden;
    border: 1px solid #d8d8d8;
    border-radius: 5px;
    padding-left: 0px;
    margin: 0 10px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const SlideImg = styled.img`
    height: 140px;
    max-width: 100%;
    object-fit: contain;
`;

class RelatedResourcesCard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            relatedFigures: [],
            activeItemIndex: 0,
            loadingFigures: false
        };
    }

    componentDidMount() {
        this.loadFigureResources();
    }

    componentDidUpdate(prevProps) {
        if (this.props.figureStatements !== prevProps.figureStatements) {
            this.loadFigureResources();
        }
    }

    onChange = value => this.setState({ activeItemIndex: value });

    loadFigureResources = () => {
        this.setState({ loadingFigures: true });
        if (this.props.figureStatements.length === 0) {
            return;
        }
        // map on figure to get { id: comparison.id, figures: fs.figures }
        // using flatMap to get { id: comparison.id, figure: f }
        const comparisonFigureMap = flatMap(
            this.props.figureStatements.filter(fs => fs.figures !== null).map(fs => ({ id: fs.id, figures: fs.figures })),
            v => {
                return v.figures.map(f => ({ id: v.id, figure: f }));
            }
        );
        getStatementsBySubjects({
            ids: comparisonFigureMap.map(resource => resource.figure.id)
        })
            .then(resourcesStatements => {
                this.setState({
                    relatedFigures: getRelatedFiguresData(resourcesStatements).map(rf => ({
                        ...rf,
                        id: find(comparisonFigureMap, c => {
                            // use find to get the comparison id of the figure
                            return c.figure.id === rf.figureId;
                        }).id
                    })),
                    loadingFigures: false
                });
            })
            .catch(err => {
                console.log(err);
                this.setState({ loadingFigures: false });
            });
    };

    render() {
        const settings = {
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: 5,
            centerMode: false,
            slidesToScroll: 1,
            nextArrow: <Icon icon={faArrowCircleRight} />,
            prevArrow: <Icon icon={faArrowCircleLeft} />,
            rows: 1,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]
        };

        return !this.state.loadingFigures ? (
            this.state.relatedFigures.length > 0 ? (
                <div className="container">
                    <StyledSlider {...settings}>
                        {this.state.relatedFigures.map(url => (
                            <SlideItem key={url.figureId}>
                                <Link to={reverse(ROUTES.COMPARISON, { comparisonId: url.id }) + '#' + url.figureId}>
                                    <div className="logoContainer">
                                        <SlideImg src={url.src} alt={url.alt} />
                                    </div>
                                </Link>
                            </SlideItem>
                        ))}
                    </StyledSlider>
                </div>
            ) : (
                <div className="text-center mt-4 mb-4">No Figures</div>
            )
        ) : (
            <div className="text-center mt-4 mb-4">Loading figures...</div>
        );
    }
}

RelatedResourcesCard.propTypes = {
    figureStatements: PropTypes.array.isRequired
};

export default RelatedResourcesCard;
