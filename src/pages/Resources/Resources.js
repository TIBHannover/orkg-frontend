import { Component } from 'react';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons';
import { getAllResources } from 'services/backend/resources';
import { RESOURCE_TYPE_ID } from 'constants/misc';
import { ButtonGroup, Container, ListGroup, ListGroupItem } from 'reactstrap';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import HeaderSearchButton from 'components/HeaderSearchButton/HeaderSearchButton';

export default class Resources extends Component {
    constructor(props) {
        super(props);

        this.pageSize = 25;

        this.state = {
            resources: [],
            results: null,
            isNextPageLoading: false,
            hasNextPage: false,
            page: 1,
            isLastPageReached: false
        };
    }

    componentDidMount() {
        document.title = 'Resources - ORKG';

        this.loadMoreResources();
    }

    loadMoreResources = () => {
        this.setState({ isNextPageLoading: true });
        getAllResources({
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'created_at',
            desc: true
        }).then(resources => {
            if (resources.length > 0) {
                this.setState({
                    resources: [...this.state.resources, ...resources],
                    isNextPageLoading: false,
                    hasNextPage: resources.length < this.pageSize ? false : true,
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
                    <h1 className="h4 mt-4 mb-4 flex-grow-1">View all resources</h1>
                    <ButtonGroup>
                        <RequireAuthentication
                            component={Link}
                            color="darkblue"
                            size="sm"
                            className="btn btn-darkblue btn-sm flex-shrink-0"
                            to={ROUTES.ADD_RESOURCE}
                        >
                            <Icon icon={faPlus} /> Create resource
                        </RequireAuthentication>
                        <HeaderSearchButton placeholder="Search resources..." type={RESOURCE_TYPE_ID} />
                    </ButtonGroup>
                </Container>
                <Container className="p-0">
                    <ListGroup flush className="box rounded" style={{ overflow: 'hidden' }}>
                        {this.state.resources.length > 0 && (
                            <div>
                                {this.state.resources.map(resource => {
                                    return (
                                        <ShortRecord key={resource.id} header={resource.label} href={reverse(ROUTES.RESOURCE, { id: resource.id })}>
                                            {resource.id}
                                        </ShortRecord>
                                    );
                                })}
                            </div>
                        )}
                        {this.state.resources.length === 0 && !this.state.isNextPageLoading && (
                            <ListGroupItem tag="div" className="text-center">
                                No Resources
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
                                onClick={!this.state.isNextPageLoading ? this.loadMoreResources : undefined}
                            >
                                <Icon icon={faAngleDoubleDown} /> Load more resources
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
