'use client';

import { faAngleDoubleDown, faEllipsisV, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import pluralize from 'pluralize';
import { useEffect, useState } from 'react';

import PaperCard from '@/components/Cards/PaperCard/PaperCard';
import { SubTitle } from '@/components/styled';
import TitleBar from '@/components/TitleBar/TitleBar';
import ButtonDropdown from '@/components/Ui/Button/ButtonDropdown';
import DropdownItem from '@/components/Ui/Dropdown/DropdownItem';
import DropdownMenu from '@/components/Ui/Dropdown/DropdownMenu';
import DropdownToggle from '@/components/Ui/Dropdown/DropdownToggle';
import ListGroup from '@/components/Ui/List/ListGroup';
import ListGroupItem from '@/components/Ui/List/ListGroupItem';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import useVenuePapers from '@/components/Venue/useVenuePapers';
import ROUTES from '@/constants/routes';
import { getResource } from '@/services/backend/resources';
import { convertPaperToNewFormat } from '@/utils';

const VenuePage = () => {
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [venue, setVenue] = useState(null);
    const { isNextPageLoading, hasNextPage, papers, page, totalElements, isLastPageReached, handleLoadMore } = useVenuePapers({
        venueId: params.venueId,
    });

    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const loadVenueData = () => {
            // Get the venue
            getResource(params.venueId).then((result) => {
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
                    <FontAwesomeIcon icon={faSpinner} spin /> Loading
                </div>
            )}
            {!loading && (
                <div>
                    <TitleBar
                        buttonGroup={
                            <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen((v) => !v)}>
                                <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                                    <FontAwesomeIcon icon={faEllipsisV} />
                                </DropdownToggle>
                                <DropdownMenu end="true">
                                    <DropdownItem tag={Link} end="true" href={`${reverse(ROUTES.RESOURCE, { id: params.venueId })}?noRedirect`}>
                                        View resource
                                    </DropdownItem>
                                </DropdownMenu>
                            </ButtonDropdown>
                        }
                        titleAddition={<SubTitle>Venue ({pluralize('paper', totalElements, true)})</SubTitle>}
                    >
                        {venue?.label}
                    </TitleBar>
                    <Container className="p-0">
                        {papers.length > 0 && (
                            <ListGroup flush className="box rounded" style={{ overflow: 'hidden' }}>
                                {papers.map((resource) => (
                                    <PaperCard paper={convertPaperToNewFormat(resource)} key={`pc${resource.id}`} />
                                ))}
                            </ListGroup>
                        )}
                        {totalElements === 0 && !isNextPageLoading && (
                            <ListGroupItem tag="div" className="text-center p-4">
                                There are no works of this author, yet
                            </ListGroupItem>
                        )}
                        {isNextPageLoading && (
                            <ListGroupItem tag="div" className="text-center">
                                <FontAwesomeIcon icon={faSpinner} spin /> Loading
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
                                <FontAwesomeIcon icon={faAngleDoubleDown} /> Load more paper
                            </ListGroupItem>
                        )}
                        {!hasNextPage && isLastPageReached && page > 1 && totalElements !== 0 && (
                            <div className="text-center mt-3">You have reached the last page</div>
                        )}
                    </Container>
                </div>
            )}
        </>
    );
};

export default VenuePage;
