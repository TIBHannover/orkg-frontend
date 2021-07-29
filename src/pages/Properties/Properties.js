import { useState, useEffect } from 'react';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons';
import { getPredicates } from 'services/backend/predicates';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { ButtonGroup, Container, ListGroup, ListGroupItem } from 'reactstrap';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import { Link } from 'react-router-dom';
import HeaderSearchButton from 'components/HeaderSearchButton/HeaderSearchButton';
import { ENTITIES } from 'constants/graphSettings';

const Properties = () => {
    const pageSize = 25;
    const [properties, setProperties] = useState([]);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        document.title = 'Properties - ORKG';
        loadMoreProperties();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadMoreProperties = () => {
        setIsNextPageLoading(true);
        getPredicates({
            page: page,
            items: pageSize,
            sortBy: 'created_at',
            desc: true
        })
            .then(result => {
                setProperties(prevProperties => [...prevProperties, ...result.content]);
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
            <Container className="d-flex align-items-center">
                <div className="d-flex flex-grow-1 mt-4 mb-4">
                    <h1 className="h4">View all properties</h1>
                    <div className="text-muted ml-3 mt-1">
                        {totalElements === 0 && isNextPageLoading ? <Icon icon={faSpinner} spin /> : totalElements} properties
                    </div>
                </div>
                <ButtonGroup>
                    <RequireAuthentication component={Link} color="secondary" size="sm" className="btn btn-secondary btn-sm" to={ROUTES.ADD_PROPERTY}>
                        <Icon icon={faPlus} /> Create property
                    </RequireAuthentication>
                    <HeaderSearchButton placeholder="Search properties..." type={ENTITIES.PREDICATE} />
                </ButtonGroup>
            </Container>

            <Container className="p-0">
                <ListGroup flush className="box rounded" style={{ overflow: 'hidden' }}>
                    {properties.length > 0 && (
                        <div>
                            {properties.map(property => {
                                return (
                                    <ShortRecord key={property.id} header={property.label} href={reverse(ROUTES.PROPERTY, { id: property.id })}>
                                        {property.id}
                                    </ShortRecord>
                                );
                            })}
                        </div>
                    )}
                    {totalElements === 0 && !isNextPageLoading && (
                        <ListGroupItem tag="div" className="text-center p-4">
                            No properties
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
                            onClick={!isNextPageLoading ? loadMoreProperties : undefined}
                        >
                            <Icon icon={faAngleDoubleDown} /> Load more properties
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

export default Properties;
