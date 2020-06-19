import React, { Component } from 'react';
import { getResourcesByClass, getStatementsBySubjects } from '../network';
import { Container } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import PaperCardDynamic from './../components/PaperCard/PaperCardDynamic';

export default class Papers extends Component {
    constructor(props) {
        super(props);

        this.pageSize = 25;
        this.componentIsMounted = false;

        this.state = {
            statements: [],
            paperResources: [],
            isNextPageLoading: false,
            hasNextPage: false,
            page: 1,
            isLastPageReached: false
        };
    }

    componentDidMount() {
        document.title = 'Papers - ORKG';
        this.componentIsMounted = true;

        this.loadMorePapers();
    }
    componentWillUnmount() {
        this.componentIsMounted = false;
    }

    loadMorePapers = () => {
        this.setState({ isNextPageLoading: true });
        getResourcesByClass({
            id: process.env.REACT_APP_CLASSES_PAPER,
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'created_at',
            desc: true
        }).then(papers => {
            if (papers.length > 0) {
                // update paper resources for paperCards preview
                this.setState({
                    paperResources: [...this.state.paperResources, ...papers],
                    isNextPageLoading: false,
                    page: this.state.page + 1,
                    hasNextPage: papers.length < this.pageSize ? false : true
                });

                // Fetch the data of each paper
                this.fetchDataForPapers(papers);
            }
        });
    };

    fetchDataForPapers = papers => {
        if (papers.length > 0) {
            // Fetch the data of each paper
            getStatementsBySubjects({ ids: papers.map(p => p.id) })
                .then(papersStatements => {
                    if (this.componentIsMounted) {
                        // prevents to update the state when component is not mounted!
                        this.setState({
                            statements: [...this.state.statements, ...papersStatements],
                            isNextPageLoading: false
                        });
                    }
                })
                .catch(error => {
                    this.setState({
                        isNextPageLoading: false,
                        hasNextPage: false,
                        isLastPageReached: true
                    });
                    console.log(error);
                });
        } else {
            this.setState({
                isNextPageLoading: false,
                hasNextPage: false,
                isLastPageReached: true
            });
        }
    };

    renderPaperCards = () => {
        return this.state.paperResources.map((paper, index) => {
            const paperCardData = this.state.statements.find(({ id }) => id === paper.id);
            return this.getPaperCard(paper, paperCardData);
        });
    };

    getPaperCard = (paper, paperData) => {
        return <PaperCardDynamic paper={{ title: paper.label, id: paper.id, paperData: paperData }} key={`pc${paper.id}`} />;
    };

    render() {
        return (
            <>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">View all papers</h1>
                </Container>
                <Container className="p-0">
                    {this.state.paperResources.length > 0 && <div>{this.renderPaperCards()}</div>}
                    {this.state.paperResources.length === 0 && !this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">No Papers</div>
                    )}
                    {this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">
                            <Icon icon={faSpinner} spin /> Loading
                        </div>
                    )}
                    {!this.state.isNextPageLoading && this.state.hasNextPage && (
                        <div
                            style={{ cursor: 'pointer' }}
                            className="list-group-item list-group-item-action text-center mt-2"
                            onClick={!this.state.isNextPageLoading ? this.loadMorePapers : undefined}
                        >
                            Load more papers
                        </div>
                    )}
                    {!this.state.hasNextPage && this.state.isLastPageReached && (
                        <div className="text-center mt-3">You have reached the last page.</div>
                    )}
                </Container>
            </>
        );
    }
}
