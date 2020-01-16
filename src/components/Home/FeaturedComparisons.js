import React, { Component } from 'react';
import { Carousel, CarouselItem, CarouselIndicators } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { getResourcesByClass, getStatementsBySubjects } from 'network';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import Dotdotdot from 'react-dotdotdot';
import styled from 'styled-components';
import { reverse } from 'named-urls';
import ContentLoader from 'react-content-loader';

const CarouselContainer = styled.div`
    width: 100%;

    & li {
        width: 10px !important;
        height: 10px !important;
        border-radius: 100% !important;
        background-color: ${props => props.theme.orkgPrimaryColor} !important;
    }
`;

const CarouselItemStyled = styled(CarouselItem)`
    border-left: 4px solid ${props => props.theme.orkgPrimaryColor};
`;

const DescriptionPreview = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-style: italic;
`;

class FeaturedComparisons extends Component {
    state = {
        loading: false,
        comparisons: [],
        activeIndex: 0,
        animating: false
    };
    componentDidMount = () => {
        document.title = 'Featured comparisons - ORKG';

        this.getFeaturedComparisons();
    };

    getFeaturedComparisons = async () => {
        this.setState({
            loading: true
        });

        const responseJson = await getResourcesByClass({
            id: process.env.REACT_APP_CLASSES_FEATURED_COMPARISON,
            sortBy: 'created_at',
            desc: false
        });

        const ids = responseJson.map(comparison => comparison.id);
        const comparisonStatements = await getStatementsBySubjects({
            ids
        });

        const comparisons = [];
        for (const comparison of responseJson) {
            let description = '';
            let icon = '';
            const url = '';
            let type = '';
            let onHomepage = false;

            for (const comparisonStatement of comparisonStatements) {
                if (comparisonStatement.id === comparison.id) {
                    const onHomepageStatement = comparisonStatement.statements.filter(
                        statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_ON_HOMEPAGE
                    );
                    onHomepage = onHomepageStatement.length > 0 ? true : false;

                    const descriptionStatement = comparisonStatement.statements.filter(
                        statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_DESCRIPTION
                    );
                    description = descriptionStatement.length > 0 ? descriptionStatement[0].object.label : '';

                    const iconStatement = comparisonStatement.statements.filter(
                        statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_ICON
                    );
                    icon = iconStatement.length > 0 ? iconStatement[0].object.label : '';

                    const typeStatement = comparisonStatement.statements.filter(
                        statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_TYPE
                    );
                    type = typeStatement.length > 0 ? typeStatement[0].object.id : '';
                }
            }

            if (!onHomepage) {
                continue;
            }

            comparisons.push({
                label: comparison.label,
                id: comparison.id,
                description,
                url,
                icon,
                type
            });
        }

        this.setState({
            comparisons,
            loading: false
        });
    };

    next = () => {
        if (this.state.animating) {
            return;
        }
        const nextIndex = this.state.activeIndex === this.state.comparisons.length - 1 ? 0 : this.state.activeIndex + 1;
        this.setState({ activeIndex: nextIndex });
    };

    previous = () => {
        if (this.state.animating) {
            return;
        }
        const nextIndex = this.state.activeIndex === 0 ? this.state.comparisons.length - 1 : this.state.activeIndex - 1;
        this.setState({ activeIndex: nextIndex });
    };

    goToIndex = newIndex => {
        this.setState({ activeIndex: newIndex });
    };

    slides = () => {
        return this.state.comparisons.map((comparison, index) => {
            return (
                <CarouselItemStyled
                    onExiting={() => this.setState({ animating: true })}
                    onExited={() => this.setState({ animating: false })}
                    className={'pt-4 pb-1 pl-4 pr-4'}
                    key={`fp${comparison.id}`}
                >
                    <div style={{ minHeight: '120px' }} className="d-flex">
                        <div>
                            <h5>
                                <Link className="" to={reverse(ROUTES.COMPARISON, { comparisonId: comparison.id })}>
                                    <Dotdotdot clamp={2}>{comparison.label}</Dotdotdot>
                                </Link>
                            </h5>
                            <DescriptionPreview>{comparison.description}</DescriptionPreview>
                        </div>
                    </div>
                </CarouselItemStyled>
            );
        });
    };

    render() {
        return (
            <div className="mr-4 box rounded-lg" style={{ overflow: 'hidden' }}>
                <h2
                    className="h5"
                    style={{
                        marginBottom: 0,
                        padding: '15px'
                    }}
                >
                    <Icon icon={faStar} className="text-primary" /> Featured paper comparisons
                    <Link to={ROUTES.FEATURED_COMPARISONS}>
                        <span style={{ fontSize: '0.9rem', float: 'right', marginTop: 2 }}>More comparisons</span>
                    </Link>
                </h2>

                <CarouselContainer>
                    {!this.state.loading ? (
                        <Carousel activeIndex={this.state.activeIndex} next={this.next} previous={this.previous}>
                            {this.slides()}
                            <CarouselIndicators items={this.state.comparisons} activeIndex={this.state.activeIndex} onClickHandler={this.goToIndex} />
                        </Carousel>
                    ) : (
                        <div style={{ height: '130px' }} className={'pt-4 pb-1 pl-4 pr-4'}>
                            <ContentLoader speed={2} primaryColor="#f3f3f3" secondaryColor="#ecebeb" ariaLabel={false}>
                                <rect x="1" y="0" rx="4" ry="4" width="300" height="20" />
                                <rect x="1" y="25" rx="3" ry="3" width="250" height="20" />
                            </ContentLoader>
                        </div>
                    )}
                </CarouselContainer>
            </div>
        );
    }
}

export default FeaturedComparisons;
