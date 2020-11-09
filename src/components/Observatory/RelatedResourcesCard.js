import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getStatementsBySubjects } from 'services/backend/statements';
import { PREDICATES } from 'constants/graphSettings';
import styled from 'styled-components';
import ROUTES from 'constants/routes';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight, faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons';
import ItemsCarousel from 'react-items-carousel';

const NO_OF_CARDS = 6;
const AUTO_PLAY_DELAY = 2000;
const CHEVRON_WIDTH = 0;

const Wrapper = styled.div`
    padding: 0 ${CHEVRON_WIDTH}px;
`;

const SlideItem = styled.div`
    padding-right: 50px;
    padding-left: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
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

        this.interval = setInterval(this.tick, AUTO_PLAY_DELAY);
    }

    componentDidUpdate(prevProps) {
        if (this.props.figureStatements !== prevProps.figureStatements) {
            this.loadFigureResources();
        }
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    tick = () =>
        this.setState(prevState => ({
            activeItemIndex: (prevState.activeItemIndex + 1) % (this.state.relatedFigures.length - NO_OF_CARDS + 1)
        }));

    onChange = value => this.setState({ activeItemIndex: value });

    loadFigureResources = () => {
        this.setState({ loadingFigures: true });
        if (this.props.figureStatements.length === 0) {
            return;
        }
        const figuresData = [];
        for (let i = 0; i < this.props.figureStatements.length; i++) {
            if (this.props.figureStatements[i].figures !== null) {
                for (let j = 0; j < this.props.figureStatements[i].figures.length; j++) {
                    figuresData.push({ id: this.props.figureStatements[i].id, figure: this.props.figureStatements[i].figures[j] });
                }
            }
        }
        getStatementsBySubjects({
            ids: figuresData.map(resource => resource.figure.id)
        })
            .then(figuresStatements => {
                const _figures = figuresStatements.map((figureStatements, key) => {
                    const imageStatement = figureStatements.statements.find(statement => statement.predicate.id === PREDICATES.IMAGE);
                    return {
                        src: imageStatement ? imageStatement.object.label : '',
                        id: figuresData[key].id,
                        figureId: figureStatements.id
                    };
                });

                this.setState({ relatedFigures: _figures, loadingFigures: false });
            })
            .catch(err => {
                console.log(err);
                this.setState({ loadingFigures: false });
            });
    };

    render() {
        return !this.state.loadingFigures ? (
            this.state.relatedFigures.length > 0 ? (
                <>
                    <Wrapper>
                        <ItemsCarousel
                            //gutter={12}
                            numberOfCards={NO_OF_CARDS}
                            activeItemIndex={this.state.activeItemIndex}
                            requestToChangeActive={this.onChange}
                            rightChevron={<Icon icon={faArrowCircleRight} />}
                            leftChevron={<Icon icon={faArrowCircleLeft} />}
                            chevronWidth={CHEVRON_WIDTH}
                            outsideChevron
                            children={this.state.relatedFigures.map(url => (
                                <SlideItem key={url.figureId}>
                                    <Link to={reverse(ROUTES.COMPARISON, { comparisonId: url.id }) + '#' + url.figureId}>
                                        <div className="logoContainer">
                                            <img style={{ height: '100px' }} src={url.src} alt={`figure #${url.figureId}`} />
                                        </div>
                                    </Link>
                                </SlideItem>
                            ))}
                        />
                    </Wrapper>
                </>
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
