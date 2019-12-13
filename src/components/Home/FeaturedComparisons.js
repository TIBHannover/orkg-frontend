import React, { Component } from 'react';
import { Button, Row, Carousel, CarouselItem, CarouselIndicators } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from '../../constants/routes.js';
import { getResourcesByClass, getStatementsBySubjects } from '../../network';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Dotdotdot from 'react-dotdotdot';
import styled from 'styled-components';
import ContentLoader from 'react-content-loader';

const CarouselContainer = styled.div`
    width: 100%;
    background: #f7f7f7 !important;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.125);

    & li {
        width: 10px !important;
        height: 10px !important;
        border-radius: 100% !important;
        background-color: ${props => props.theme.orkgPrimaryColor} !important;
    }
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
        let responseJson = await getResourcesByClass({
            id: process.env.REACT_APP_CLASSES_FEATURED_COMPARISON,
            sortBy: 'created_at',
            desc: false
        });

        const ids = responseJson.map(comparison => comparison.id);
        const comparisonStatements = await getStatementsBySubjects({
            ids
        });

        let comparisons = [];
        for (const comparison of responseJson) {
            let description = '';
            let icon = '';
            let url = '';
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

                    const urlStatement = comparisonStatement.statements.filter(
                        statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_URL
                    );
                    url = urlStatement.length > 0 ? urlStatement[0].object.label : '';

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
            const icon = require('@fortawesome/free-solid-svg-icons')[comparison.icon];

            return (
                <CarouselItem
                    onExiting={() => this.setState({ animating: true })}
                    onExited={() => this.setState({ animating: false })}
                    className={'pt-4 pb-1 pl-4 pr-4'}
                    key={`fp${comparison.id}`}
                >
                    <div style={{ minHeight: '120px' }} className="d-flex">
                        <div style={{ fontSize: 40, color: '#80869b' }} className="mr-4">
                            <Icon icon={icon} />
                        </div>
                        <div>
                            <h5>
                                <Link className="" to={`${ROUTES.COMPARISON}${comparison.url}`}>
                                    <Dotdotdot clamp={2}>{comparison.label}</Dotdotdot>
                                </Link>
                            </h5>
                            <div>
                                <i>{comparison.description}</i>
                            </div>
                        </div>
                    </div>
                </CarouselItem>
            );
        });
    };

    render() {
        return (
            <div className="mt-3 pl-3 pr-3">
                {this.state.loading && (
                    <div className="text-center mt-4 mb-4">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                )}

                <Row style={{ margin: '25px 0 20px' }}>
                    <CarouselContainer>
                        {!this.state.loading ? (
                            <Carousel activeIndex={this.state.activeIndex} next={this.next} previous={this.previous}>
                                {this.slides()}
                                <CarouselIndicators
                                    items={this.state.comparisons}
                                    activeIndex={this.state.activeIndex}
                                    onClickHandler={this.goToIndex}
                                />
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
                </Row>
                <div className="text-center">
                    <Link to={ROUTES.FEATURED_COMPARISONS}>
                        <Button color="darkblue" size="sm">
                            More comparisons
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }
}

export default FeaturedComparisons;
