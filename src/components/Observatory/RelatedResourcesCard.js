import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getStatementsBySubjects } from 'services/backend/statements';
import { PREDICATES } from 'constants/graphSettings';
import styled from 'styled-components';
import { Button } from 'reactstrap';
import ROUTES from 'constants/routes';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight, faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons';
import ItemsCarousel from 'react-items-carousel';

const NO_OF_CARDS = 5;
const CHEVRON_WIDTH = 40;

const Wrapper = styled.div`
    padding: 0 ${CHEVRON_WIDTH}px;
`;

const SlideItem = styled.div`
    overflow: hidden;
    border: 1px solid #d8d8d8;
    border-radius: 5px;
    padding-left: 0px;
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
                    const alt = figureStatements.statements.length ? figureStatements.statements[0]?.subject?.label : null;

                    return {
                        src: imageStatement ? imageStatement.object.label : '',
                        id: figuresData[key].id,
                        figureId: figureStatements.id,
                        alt
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
                <Wrapper>
                    <ItemsCarousel
                        gutter={12}
                        numberOfCards={NO_OF_CARDS}
                        activeItemIndex={this.state.activeItemIndex}
                        requestToChangeActive={this.onChange}
                        rightChevron={
                            <Button color="link" className="p-0">
                                <Icon icon={faArrowCircleRight} className="text-darkblue h3 m-0" />
                            </Button>
                        }
                        leftChevron={
                            <Button color="link" className="p-0">
                                <Icon icon={faArrowCircleLeft} className="text-darkblue h3 m-0" />
                            </Button>
                        }
                        chevronWidth={CHEVRON_WIDTH}
                        outsideChevron
                        children={this.state.relatedFigures.map(url => (
                            <SlideItem key={url.figureId}>
                                <Link to={reverse(ROUTES.COMPARISON, { comparisonId: url.id }) + '#' + url.figureId}>
                                    <div className="logoContainer">
                                        <SlideImg src={url.src} alt={url.alt} />
                                    </div>
                                </Link>
                            </SlideItem>
                        ))}
                    />
                </Wrapper>
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
