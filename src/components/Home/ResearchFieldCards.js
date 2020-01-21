import React, { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components/macro';
import { getStatementsBySubject, getStatementsByObject } from '../../network';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from '../../constants/routes.js';
import classNames from 'classnames';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

/* Bootstrap card column is not working correctly working with vertical alignment,
thus used custom styling here */

const Card = styled.div`
    cursor: pointer;
    background: #e86161 !important;
    color: #fff !important;
    border: 0 !important;
    border-radius: 12px !important;
    min-height: 85px;
    flex: 0 0 calc(33% - 20px) !important;
    margin: 10px;
    transition: opacity 0.2s;
    justify-content: center;
    display: flex;
    flex: 1 1 auto;
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    word-wrap: break-word;

    &:hover {
        opacity: 0.8;
    }
    &[disabled] {
        opacity: 0.5;
        cursor: default;
        pointer-events: none;
    }
    &:active {
        top: 4px;
    }
`;

const CardTitle = styled.h5`
    color: #fff;
    font-size: 16px;
    padding: 0 5px;
`;

const BreadcrumbLink = styled.span`
    cursor: pointer;
    margin-right: 5px;

    &:hover {
        text-decoration: underline;
    }
`;

const PaperAmount = styled.div`
    opacity: 0.5;
    font-size: 80%;
    text-align: center;
`;

const AnimationContainer = styled(CSSTransition)`
    //transition: 0.3s background-color, 0.3s border-color;

    animation: scale-up-center 0.4s cubic-bezier(0.39, 0.575, 0.565, 1) both;
    @keyframes scale-up-center {
        0% {
            transform: scale(0.5);
        }
        100% {
            transform: scale(1);
        }
    }
`;

class ResearchFieldCards extends Component {
    state = {
        researchFields: [],
        breadcrumb: [],
        papers: null,
        error: ''
    };

    componentDidMount() {
        this.getFields(process.env.REACT_APP_RESEARCH_FIELD_MAIN, 'Main');
    }

    async getFields(fieldId, label, addBreadcrumb = true) {
        try {
            await getStatementsBySubject({ id: fieldId })
                .then(async res => {
                    let researchFields = [];
                    res.forEach(elm => {
                        researchFields.push({
                            label: elm.object.label,
                            id: elm.object.id
                        });
                    });

                    // sort research fields alphabetically
                    researchFields = researchFields.sort((a, b) => {
                        return a.label.localeCompare(b.label);
                    });

                    this.setState({
                        researchFields,
                        error: ''
                    });

                    if (addBreadcrumb) {
                        const breadcrumb = this.state.breadcrumb;

                        breadcrumb.push({
                            label: label,
                            id: fieldId
                        });

                        this.setState({
                            breadcrumb: breadcrumb
                        });
                    }

                    if (researchFields.length === 0) {
                        this.setState({
                            papers: null // to show loading indicator
                        });

                        let papers = await getStatementsByObject({
                            id: fieldId,
                            page: 1,
                            items: 24,
                            sortBy: 'created_at',
                            desc: true
                        });

                        papers = papers.filter(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_FIELD);

                        this.setState({
                            papers
                        });
                    }
                })
                .catch(e => {
                    this.setState({
                        error: e.message
                    });
                });
        } catch (e) {
            this.setState({
                error: e.message
            });
        }
    }

    handleClickBreadcrumb(fieldId, label) {
        const activeIndex = this.state.breadcrumb.findIndex(breadcrumb => breadcrumb.id === fieldId);
        const breadcrumb = this.state.breadcrumb.slice(0, activeIndex + 1); //remove the items after the clicked link

        this.setState({
            breadcrumb
        });

        this.getFields(fieldId, label, false);
    }

    render() {
        if (this.state.error) {
            return <div className="text-center mt-5 text-danger">{this.state.error}</div>;
        }

        const showPapers = this.state.researchFields.length === 0 && this.state.breadcrumb.length !== 0;

        return (
            <div className="mt-5">
                {this.state.breadcrumb.map((field, index) => (
                    <BreadcrumbLink key={field.id} onClick={() => this.handleClickBreadcrumb(field.id, field.label)}>
                        {field.label} {index !== this.state.breadcrumb.length - 1 && <Icon icon={faAngleDoubleRight} />}
                    </BreadcrumbLink>
                ))}

                <hr className="mt-3 mb-5" />
                <div>
                    <TransitionGroup id="research-field-cards" className="mt-2 justify-content-center d-flex flex-wrap" exit={false}>
                        {this.state.researchFields.map(field => {
                            const disabled = Math.round(Math.random());
                            return (
                                <AnimationContainer key={field.id} classNames="fadeIn" timeout={{ enter: 500, exit: 0 }}>
                                    <Card role="button" disabled={disabled} onClick={() => this.getFields(field.id, field.label)}>
                                        <CardTitle className="card-title m-0 text-center">{field.label}</CardTitle>
                                        <PaperAmount>234 papers</PaperAmount>
                                    </Card>
                                </AnimationContainer>
                            );
                        })}
                    </TransitionGroup>
                </div>
                {showPapers && (
                    <div>
                        <h2 className="h5">{this.state.breadcrumb[this.state.breadcrumb.length - 1].label} papers</h2>

                        {!this.state.papers && (
                            <div className="mt-5 text-center">
                                <Icon icon={faSpinner} spin /> Loading
                            </div>
                        )}

                        {this.state.papers && this.state.papers.length === 0 ? <div className="mt-5 text-center">No papers found</div> : null}

                        {this.state.papers && (
                            <ul className="mt-3">
                                {this.state.papers.map((paper, index) => {
                                    return (
                                        <li key={index}>
                                            <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: paper.subject.id })}>{paper.subject.label}</Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

export default ResearchFieldCards;
