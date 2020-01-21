import React, { Component } from 'react';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { getResourcesByClass } from 'network';
import { Container } from 'reactstrap';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';

export default class ContributionTemplates extends Component {
    constructor(props) {
        super(props);

        this.pageSize = 25;

        this.state = {
            contributionTemplates: [],
            isNextPageLoading: false,
            hasNextPage: false,
            page: 1,
            isLastPageReached: false
        };
    }

    componentDidMount() {
        document.title = 'Contribution Templates - ORKG';

        this.loadMoreContributionTemplates();
    }

    loadMoreContributionTemplates = () => {
        this.setState({ isNextPageLoading: true });
        getResourcesByClass({
            id: process.env.REACT_APP_CLASSES_CONTRIBUTION_TEMPLATE,
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'created_at',
            desc: true
        }).then(contributionTemplates => {
            if (contributionTemplates.length > 0) {
                this.setState({
                    contributionTemplates: [...this.state.contributionTemplates, ...contributionTemplates],
                    isNextPageLoading: false,
                    hasNextPage: contributionTemplates.length < this.pageSize ? false : true,
                    page: this.state.page + 1
                });
            } else {
                this.setState({
                    isNextPageLoading: false,
                    hasNextPage: false,
                    isLastPageReached: true
                });
            }
        });
    };

    render() {
        return (
            <>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">View all contribution templates</h1>
                </Container>
                <Container className={'box pt-4 pb-4 pl-5 pr-5 clearfix'}>
                    <div className="clearfix">
                        <Link className="float-right mb-2 mt-2 clearfix" to={reverse(ROUTES.CONTRIBUTION_TEMPLATE)}>
                            <span className="fa fa-plus" /> Create new template
                        </Link>
                    </div>
                    {this.state.contributionTemplates.length > 0 && (
                        <div>
                            {this.state.contributionTemplates.map(contributionTemplate => {
                                return (
                                    <ShortRecord
                                        key={contributionTemplate.id}
                                        header={contributionTemplate.id}
                                        href={reverse(ROUTES.CONTRIBUTION_TEMPLATE, { id: contributionTemplate.id })}
                                    >
                                        {contributionTemplate.label}
                                    </ShortRecord>
                                );
                            })}
                        </div>
                    )}
                    {this.state.contributionTemplates.length === 0 && !this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">No contribution templates</div>
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
                            onClick={!this.state.isNextPageLoading ? this.loadMoreContributionTemplates : undefined}
                        >
                            Load more contribution templates
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
