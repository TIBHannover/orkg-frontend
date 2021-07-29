import { useState, useEffect } from 'react';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons';
import { getResources } from 'services/backend/resources';
import { ButtonGroup, Container, ListGroup, ListGroupItem } from 'reactstrap';
import { RESOURCE_TYPE_ID } from 'constants/misc';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import HeaderSearchButton from 'components/HeaderSearchButton/HeaderSearchButton';
import TitleBar from 'components/TitleBar/TitleBar';

const Resources = () => {
    const pageSize = 25;
    const [resources, setResources] = useState([]);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        document.title = 'Resources - ORKG';
        loadMoreResources();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadMoreResources = () => {
        setIsNextPageLoading(true);
        getResources({
            page: page,
            items: pageSize,
            sortBy: 'created_at',
            desc: true
        })
            .then(result => {
                setResources(prevResources => [...prevResources, ...result.content]);
                setIsNextPageLoading(false);
                setHasNextPage(!result.last);
                setIsLastPageReached(result.last);
                setPage(prevPage => prevPage + 1);
                setTotalElements(result.totalElements);
            })
            .catch(error => {
                setIsNextPageLoading(false);
                setHasNextPage(false);
                setIsLastPageReached(false);
                console.log(error);
            });
    };

    return (
        <>
            <TitleBar
                titleAddition={
                    <div className="text-muted mt-1">
                        {totalElements === 0 && isNextPageLoading ? <Icon icon={faSpinner} spin /> : totalElements} resources
                    </div>
                }
                buttonGroup={
                    <>
                        <RequireAuthentication
                            component={Link}
                            color="secondary"
                            size="sm"
                            className="btn btn-secondary btn-sm flex-shrink-0"
                            to={ROUTES.ADD_RESOURCE}
                        >
                            <Icon icon={faPlus} /> Create resource
                        </RequireAuthentication>
                        <HeaderSearchButton placeholder="Search resources..." type={RESOURCE_TYPE_ID} />
                    </>
                }
            >
                View all resources
            </TitleBar>

            <Container className="p-0">
                <ListGroup flush className="box rounded" style={{ overflow: 'hidden' }}>
                    {resources.length > 0 && (
                        <div>
                            {resources.map(resource => {
                                return (
                                    <ShortRecord key={resource.id} header={resource.label} href={reverse(ROUTES.RESOURCE, { id: resource.id })}>
                                        {resource.id}
                                    </ShortRecord>
                                );
                            })}
                        </div>
                    )}
                    {totalElements === 0 && !isNextPageLoading && (
                        <ListGroupItem tag="div" className="text-center">
                            No Resources
                        </ListGroupItem>
                    )}
                    {isNextPageLoading && (
                        <ListGroupItem tag="div" className="text-center">
                            <Icon icon={faSpinner} spin /> Loading
                        </ListGroupItem>
                    )}
                    {!isNextPageLoading && hasNextPage && (
                        <ListGroupItem
                            style={{ cursor: 'pointer' }}
                            className="text-center"
                            action
                            onClick={!isNextPageLoading ? loadMoreResources : undefined}
                        >
                            <Icon icon={faAngleDoubleDown} /> Load more resources
                        </ListGroupItem>
                    )}
                    {!hasNextPage && isLastPageReached && page > 1 && totalElements !== 0 && (
                        <ListGroupItem tag="div" className="text-center">
                            You have reached the last page.
                        </ListGroupItem>
                    )}
                </ListGroup>
            </Container>
        </>
    );
};

export default Resources;
