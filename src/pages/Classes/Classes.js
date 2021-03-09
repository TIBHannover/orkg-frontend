import { Component } from 'react';
import { Container, ListGroup, ListGroupItem, ButtonGroup } from 'reactstrap';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faAngleDoubleDown, faPlus } from '@fortawesome/free-solid-svg-icons';
import { getAllClasses } from 'services/backend/classes';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
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
                <Container className="d-flex align-items-center">
                    <h1 className="h4 mt-4 mb-4 flex-grow-1">View all classes</h1>
                    <ButtonGroup>
                        <RequireAuthentication
                            component={Link}
                            color="darkblue"
                            size="sm"
                            className="btn btn-darkblue btn-sm flex-shrink-0"
                            to={ROUTES.ADD_CLASS}
                        >
                            <Icon icon={faPlus} /> Create class
                        </RequireAuthentication>
                    </ButtonGroup>
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
                        {this.state.classes.length === 0 && !this.state.isNextPageLoading && (
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
