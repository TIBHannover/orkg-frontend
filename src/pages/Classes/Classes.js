import React, { Component } from 'react';
import { Container, ListGroup, ListGroupItem } from 'reactstrap';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons';
import { getAllClasses } from 'services/backend/classes';
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
            page: 0,
            isLastPageReached: false,
            totalElements: 0
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
        }).then(result => {
            this.setState({
                classes: [...this.state.classes, ...result.content],
                isNextPageLoading: false,
                hasNextPage: !result.last,
                isLastPageReached: result.last,
                page: this.state.page + 1,
                totalElements: result.totalElements
            });
        });
    };

    render() {
        return (
            <>
                <Container className="d-flex mt-4 mb-4">
                    <div className="d-flex flex-grow-1">
                        <h1 className="h4">View all classes</h1>
                        <div className="text-muted ml-3 mt-1">{this.state.totalElements} Class</div>
                    </div>
                </Container>
                <Container className="p-0">
                    <ListGroup flush className="box rounded" style={{ overflow: 'hidden' }}>
                        {this.state.classes.length > 0 && (
                            <div>
                                {this.state.classes.map(classItem => {
                                    return (
                                        <ShortRecord key={classItem.id} header={classItem.label} href={reverse(ROUTES.CLASS, { id: classItem.id })}>
                                            {classItem.id}
                                        </ShortRecord>
                                    );
                                })}
                            </div>
                        )}
                        {this.state.totalElements === 0 && !this.state.isNextPageLoading && (
                            <ListGroupItem tag="div" className="text-center">
                                No Classes
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
                                className="text-center"
                                action
                                onClick={!this.state.isNextPageLoading ? this.loadMoreClasses : undefined}
                            >
                                <Icon icon={faAngleDoubleDown} /> Load more classes
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
