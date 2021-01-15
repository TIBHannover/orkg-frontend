import { Component } from 'react';
import ShortRecord from '../../components/ShortRecord/ShortRecord';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons';
import { getAllPredicates } from 'services/backend/predicates';
import { ButtonGroup, Container, ListGroup, ListGroupItem } from 'reactstrap';
import { PREDICATE_TYPE_ID } from 'constants/misc';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import HeaderSearchButton from 'components/HeaderSearchButton/HeaderSearchButton';

export default class Predicates extends Component {
    constructor(props) {
        super(props);

        this.pageSize = 25;

        this.state = {
            predicates: [],
            isNextPageLoading: false,
            hasNextPage: false,
            page: 1,
            isLastPageReached: false
        };
    }

    componentDidMount() {
        document.title = 'Properties - ORKG';

        this.loadMorePredicates();
    }

    loadMorePredicates = () => {
        this.setState({ isNextPageLoading: true });
        getAllPredicates({
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'created_at',
            desc: true
        }).then(predicates => {
            if (predicates.length > 0) {
                this.setState({
                    predicates: [...this.state.predicates, ...predicates],
                    isNextPageLoading: false,
                    hasNextPage: predicates.length < this.pageSize ? false : true,
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
                    <h1 className="h4 mt-4 mb-4 flex-grow-1">View all properties</h1>
                    <ButtonGroup>
                        <HeaderSearchButton placeholder="Search properties..." type={PREDICATE_TYPE_ID} />
                    </ButtonGroup>
                </Container>

                <Container className="p-0">
                    <ListGroup flush className="box rounded" style={{ overflow: 'hidden' }}>
                        {this.state.predicates.length > 0 && (
                            <div>
                                {this.state.predicates.map(predicate => {
                                    return (
                                        <ShortRecord
                                            key={predicate.id}
                                            header={predicate.label}
                                            href={reverse(ROUTES.PREDICATE, { id: predicate.id })}
                                        >
                                            {predicate.id}
                                        </ShortRecord>
                                    );
                                })}
                            </div>
                        )}
                        {this.state.predicates.length === 0 && !this.state.isNextPageLoading && (
                            <ListGroupItem tag="div" className="text-center">
                                No properties
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
                                onClick={!this.state.isNextPageLoading ? this.loadMorePredicates : undefined}
                            >
                                <Icon icon={faAngleDoubleDown} /> Load more properties
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
