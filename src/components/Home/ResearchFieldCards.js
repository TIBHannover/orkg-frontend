import { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components/macro';
import { getStatementsBySubject, getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { getResearchFieldsStats } from 'services/backend/stats';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import { Button } from 'reactstrap';
import ROUTES from 'constants/routes.js';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { PREDICATES, MISC, CLASSES } from 'constants/graphSettings';
import { reverseWithSlug } from 'utils';

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
    min-width: 140px;
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

    @media (max-width: 400px) {
        flex: 0 0 80% !important;
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

const MAX_PAPER_AMOUNT = 24;

class ResearchFieldCards extends Component {
    state = {
        researchFields: [],
        breadcrumb: [],
        papers: null,
        error: '',
        stats: {}
    };

    componentDidMount() {
        this.getFields(MISC.RESEARCH_FIELD_MAIN, 'Main');
        this.fetchResearchFieldsStats();
    }

    fetchResearchFieldsStats = () => {
        return getResearchFieldsStats().then(results => {
            this.setState({ stats: results });
        });
    };

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

                    if (fieldId !== MISC.RESEARCH_FIELD_MAIN) {
                        this.setState({
                            papers: null // to show loading indicator
                        });

                        let papers = await getStatementsByObjectAndPredicate({
                            objectId: fieldId,
                            predicateId: PREDICATES.HAS_RESEARCH_FIELD,
                            page: 1,
                            items: MAX_PAPER_AMOUNT,
                            sortBy: 'created_at',
                            desc: true
                        });

                        papers = papers.filter(statement => statement.subject.classes.includes(CLASSES.PAPER));

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

        const showPapers = this.state.breadcrumb.length > 1;
        const currentField = this.state.breadcrumb[this.state.breadcrumb.length - 1];
        const researchFieldLink = this.state.breadcrumb.length
            ? reverseWithSlug(ROUTES.RESEARCH_FIELD, { researchFieldId: currentField.id, slug: currentField.label })
            : null;

        return (
            <div className="mt-3">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        {this.state.breadcrumb.map((field, index) => (
                            <BreadcrumbLink key={field.id} onClick={() => this.handleClickBreadcrumb(field.id, field.label)}>
                                {field.label} {index !== this.state.breadcrumb.length - 1 && <Icon icon={faAngleDoubleRight} />}
                            </BreadcrumbLink>
                        ))}
                    </div>
                    {currentField && currentField.id !== MISC.RESEARCH_FIELD_MAIN && (
                        <Button tag={Link} to={researchFieldLink} color="light" size="sm" className="flex-shrink-0">
                            Visit field page
                        </Button>
                    )}
                </div>

                <hr className="mt-3 mb-3" />
                <div>
                    <TransitionGroup id="research-field-cards" className="mt-2 justify-content-center d-flex flex-wrap" exit={false}>
                        {this.state.researchFields.map(field => {
                            return (
                                <AnimationContainer key={field.id} classNames="fadeIn" timeout={{ enter: 500, exit: 0 }}>
                                    <Card
                                        role="button"
                                        disabled={this.state.stats[field.id] === 0}
                                        onClick={() => this.getFields(field.id, field.label)}
                                    >
                                        <CardTitle className="card-title m-0 text-center">{field.label}</CardTitle>
                                        <PaperAmount>{this.state.stats[field.id]} papers</PaperAmount>
                                    </Card>
                                </AnimationContainer>
                            );
                        })}
                    </TransitionGroup>
                </div>
                {showPapers && (
                    <div className="mt-3">
                        <h2 className="h5">
                            <Link to={researchFieldLink}>{currentField.label}</Link> papers
                        </h2>

                        {!this.state.papers && (
                            <div className="mt-5 text-center">
                                <Icon icon={faSpinner} spin /> Loading
                            </div>
                        )}

                        {this.state.papers && this.state.papers.length === 0 ? <div className="mt-5 text-center">No papers found</div> : null}

                        {this.state.papers && (
                            <>
                                <ul className="mt-3">
                                    {this.state.papers.map((paper, index) => (
                                        <li key={index}>
                                            <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: paper.subject.id })}>
                                                {paper.subject.label ? paper.subject.label : <i>No title</i>}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                {this.state.papers.length >= MAX_PAPER_AMOUNT && (
                                    <div className="text-center">
                                        <Button tag={Link} to={researchFieldLink} size="sm" color="primary">
                                            View more papers
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

export default ResearchFieldCards;
