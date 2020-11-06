import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getStatementsBySubjects } from 'services/backend/statements';
import { PREDICATES } from 'constants/graphSettings';
import styled from 'styled-components';
import ROUTES from '../../constants/routes';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight, faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons';
import ItemsCarousel from 'react-items-carousel';

const noOfCards = 6;
const autoPlayDelay = 2000;
const chevronWidth = 40;

const Wrapper = styled.div`
    padding: 0 ${chevronWidth}px;
`;

const SlideItem = styled.div`
    padding-right: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

class RelatedResourcesCard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            relatedFigures: [],
            openBox: false,
            activeItemIndex: 0
        };

        this.scrollAmount = 500;
    }

    componentDidMount() {
        this.loadFigureResources();

        this.interval = setInterval(this.tick, autoPlayDelay);
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
            activeItemIndex: (prevState.activeItemIndex + 1) % (this.state.relatedFigures.length - noOfCards + 1)
        }));

    onChange = value => this.setState({ activeItemIndex: value });

    loadFigureResources = () => {
        if (this.props.figureStatements.length === 0) {
            return;
        }
        const figuresData = [];
        for (let i = 0; i < this.props.figureStatements.length; i++) {
            if (this.props.figureStatements[i].figures !== null) {
                for (let j = 0; j < this.props.figureStatements[i].figures.length; j++) {
                    figuresData.push({ id: this.props.figureStatements[i].id, figureId: this.props.figureStatements[i].figures[j] });
                }
            }
        }
        getStatementsBySubjects({
            ids: figuresData.map(resource => resource.figureId.id)
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

                const item = [];
                _figures.map((url, index) =>
                    item.push(
                        <SlideItem key={index}>
                            <Link to={reverse(ROUTES.COMPARISON, { comparisonId: url.id }) + '#' + url.figureId}>
                                <div className="logoContainer">
                                    <img style={{ height: '100px' }} src={url.src} alt="pic" />
                                </div>
                            </Link>
                        </SlideItem>
                    )
                );

                this.setState({ relatedFigures: item });
            })
            .catch(err => {
                console.log(err);
            });
    };

    render() {
        return (
            this.props.figureStatements.length > 0 && (
                <>
                    <Wrapper>
                        <ItemsCarousel
                            //gutter={12}
                            numberOfCards={noOfCards}
                            activeItemIndex={this.state.activeItemIndex}
                            requestToChangeActive={this.onChange}
                            rightChevron={<Icon icon={faArrowCircleRight} />}
                            leftChevron={<Icon icon={faArrowCircleLeft} />}
                            chevronWidth={chevronWidth}
                            outsideChevron
                            children={this.state.relatedFigures}
                        />
                    </Wrapper>
                </>
            )
        );
    }
}

RelatedResourcesCard.propTypes = {
    figureStatements: PropTypes.array.isRequired
};

export default RelatedResourcesCard;
