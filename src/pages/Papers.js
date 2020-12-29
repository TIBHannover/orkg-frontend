import React, { Component } from 'react';
import { ButtonDropdown, DropdownToggle, Container, ListGroup, ListGroupItem, DropdownItem, DropdownMenu } from 'reactstrap';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getResourcesByClass } from 'services/backend/resources';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons';
import PaperCardDynamic from 'components/PaperCard/PaperCardDynamic';
import { CLASSES } from 'constants/graphSettings';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class Papers extends Component {
    constructor(props) {
        super(props);

        this.pageSize = 25;
        this.componentIsMounted = false;

        this.state = {
            dropdownOpen: false,
            verified: null,
            statements: [],
            paperResources: [],
            isNextPageLoading: false,
            hasNextPage: false,
            page: 0,
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
            id: CLASSES.PAPER,
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'created_at',
            desc: true,
            verified: this.state.verified,
            returnContent: true
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

    setVerifiedFilter = value => {
        this.setState(
            { verified: value, page: 1, statements: [], paperResources: [], isNextPageLoading: false, hasNextPage: false, isLastPageReached: false },
            () => {
                this.loadMorePapers();
            }
        );
    };

    toggle = () => {
        this.setState({ dropdownOpen: !this.state.dropdownOpen });
    };

    render() {
        return (
            <>
                <Container className="d-flex align-items-center">
                    <h1 className="h4 mt-4 mb-4 flex-grow-1">View all papers</h1>
                    {!!this.props.user && this.props.user.isCurationAllowed && (
                        <div className="flex-shrink-0">
                            <ButtonDropdown size="sm" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                                <DropdownToggle caret color="darkblue">
                                    {this.state.verified === true && 'Verified'}
                                    {this.state.verified === false && 'Unverified'}
                                    {this.state.verified === null && 'All'}
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={e => this.setVerifiedFilter(null)}>All</DropdownItem>
                                    <DropdownItem onClick={e => this.setVerifiedFilter(true)}>Verified</DropdownItem>
                                    <DropdownItem onClick={e => this.setVerifiedFilter(false)}>Unverified</DropdownItem>
                                </DropdownMenu>
                            </ButtonDropdown>
                        </div>
                    )}
                </Container>
                <Container className="p-0">
                    <ListGroup flush className="box rounded" style={{ overflow: 'hidden' }}>
                        {this.state.paperResources.length > 0 && this.renderPaperCards()}
                        {this.state.paperResources.length === 0 && !this.state.isNextPageLoading && (
                            <ListGroupItem tag="div" className="text-center">
                                No Papers
                            </ListGroupItem>
                        )}
                        {this.state.isNextPageLoading && (
                            <ListGroupItem tag="div" className="text-center">
                                <Icon icon={faSpinner} spin /> Loading
                            </ListGroupItem>
                        )}
                        {!this.state.isNextPageLoading && this.state.hasNextPage && (
                            <ListGroupItem
                                style={{ cursor: 'pointer' }}
                                action
                                className="text-center"
                                tag="div"
                                onClick={!this.state.isNextPageLoading ? this.loadMorePapers : undefined}
                            >
                                <Icon icon={faAngleDoubleDown} /> Load more papers
                            </ListGroupItem>
                        )}
                        {!this.state.hasNextPage && this.state.isLastPageReached && (
                            <ListGroupItem tag="div" className="text-center">
                                You have reached the last page.
                            </ListGroupItem>
                        )}
                    </ListGroup>
                </Container>
            </>
        );
    }
}

const mapStateToProps = state => ({
    user: state.auth.user
});

Papers.propTypes = {
    user: PropTypes.oneOfType([PropTypes.object, PropTypes.number])
};

export default connect(mapStateToProps)(Papers);
