import { useEffect, useState } from 'react';
import {
    Container,
    Card,
    CardText,
    CardBody,
    CardHeader,
    ButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    ListGroupItem
} from 'reactstrap';
import { getResource } from 'services/backend/resources';
import ROUTES from 'constants/routes.js';
import PaperCard from 'components/PaperCard/PaperCard';
import { faSpinner, faAngleDoubleDown, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import useVenuePapers from 'components/Venue/useVenuePapers';
import { NavLink, useParams } from 'react-router-dom';
import { reverse } from 'named-urls';
import TitleBar from 'components/TitleBar/TitleBar';

const VenuePage = () => {
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [venue, setVenue] = useState(null);
    const { isNextPageLoading, hasNextPage, papers, page, totalElements, isLastPageReached, handleLoadMore } = useVenuePapers({
        venueId: params.venueId
    });

    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const loadVenueData = () => {
            // Get the venue
            getResource(params.venueId).then(result => {
                setVenue(result);
                setLoading(false);
                document.title = `${result.label} - ORKG`;
            });
        };
        loadVenueData();
    }, [params.venueId]);

    return (
        <>
            {loading && (
                <div className="text-center mt-4 mb-4">
                    <Icon icon={faSpinner} spin /> Loading
                </div>
            )}
            {!loading && (
                <div>
                    <TitleBar
                        buttonGroup={
                            <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)}>
                                <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                                    <Icon icon={faEllipsisV} />
                                </DropdownToggle>
                                <DropdownMenu end>
                                    <DropdownItem tag={NavLink} end to={reverse(ROUTES.RESOURCE, { id: params.venueId })}>
                                        View resource
                                    </DropdownItem>
                                </DropdownMenu>
                            </ButtonDropdown>
                        }
                    >
                        Venue
                    </TitleBar>
                    <Container className="p-0">
                        <Card>
                            <CardHeader>
                                {/* TODO: Show the total number of papers when number of items is provided with the paginated result
                                        <div className="float-end"><b>{this.state.papers.length}</b> Papers</div>
                                    */}
                                <h3 className="h4 mt-4 mb-4">{venue?.label}</h3>
                            </CardHeader>
                            <CardBody>
                                <CardText>
                                    List of papers in <i>{venue?.label}</i> venue
                                </CardText>
                            </CardBody>
                        </Card>
                    </Container>
                    <br />
                    <Container className="p-0">
                        {papers.length > 0 && (
                            <div>
                                {papers.map(resource => {
                                    return <PaperCard paper={{ title: resource.label, ...resource }} key={`pc${resource.id}`} />;
                                })}
                            </div>
                        )}
                        {totalElements === 0 && !isNextPageLoading && (
                            <ListGroupItem tag="div" className="text-center p-4">
                                There are no works of this author, yet
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
                                action
                                className="text-center"
                                tag="div"
                                onClick={!isNextPageLoading ? handleLoadMore : undefined}
                            >
                                <Icon icon={faAngleDoubleDown} /> Load more paper
                            </ListGroupItem>
                        )}
                        {!hasNextPage && isLastPageReached && page > 1 && totalElements !== 0 && (
                            <div className="text-center mt-3">You have reached the last page</div>
                        )}
                    </Container>
                    <ComparisonPopup />
                </div>
            )}
        </>
    );
};

export default VenuePage;
