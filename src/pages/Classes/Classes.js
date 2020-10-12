import React, { Component } from 'react';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getAllClasses } from 'network';
import { Container } from 'reactstrap';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';

export default class Classes extends Component {
    constructor(props) {
        super(props);

        this.pageSize = 25;

        this.state = {
            classes: [],
            isNextPageLoading: false,
            hasNextPage: false,
            page: 1,
            isLastPageReached: false
        };
    }

    componentDidMount() {
        document.title = 'Classes - ORKG';

        this.loadMoreClasses();
    }

    loadMoreClasses = () => {
        this.setState({ isNextPageLoading: true });
        getAllClasses({
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'created_at',
            desc: true
        }).then(classes => {
            if (classes.length > 0) {
                this.setState({
                    classes: [...this.state.classes, ...classes],
                    isNextPageLoading: false,
                    hasNextPage: classes.length < this.pageSize ? false : true,
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
                    <h1 className="h4 mt-4 mb-4">View all classes</h1>
                </Container>
                <Container className="box rounded pt-4 pb-4 pl-5 pr-5 clearfix">
                    {this.state.classes.length > 0 && (
                        <div>
                            {this.state.classes.map(classs => {
                                return (
                                    <ShortRecord key={classs.id} header={classs.label} href={reverse(ROUTES.CLASS, { id: classs.id })}>
                                        {classs.id}
                                    </ShortRecord>
                                );
                            })}
                        </div>
                    )}
                    {this.state.classes.length === 0 && !this.state.isNextPageLoading && <div className="text-center mt-4 mb-4">No Classes</div>}
                    {this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">
                            <Icon icon={faSpinner} spin /> Loading
                        </div>
                    )}
                    {!this.state.isNextPageLoading && this.state.hasNextPage && (
                        <div
                            style={{ cursor: 'pointer' }}
                            className="list-group-item list-group-item-action text-center mt-2"
                            onClick={!this.state.isNextPageLoading ? this.loadMoreClasses : undefined}
                        >
                            Load more classes
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
