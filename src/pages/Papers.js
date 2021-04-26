import { useState, useEffect } from 'react';
import { ButtonDropdown, DropdownToggle, Container, ListGroup, ListGroupItem, DropdownItem, DropdownMenu, ButtonGroup } from 'reactstrap';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getResourcesByClass } from 'services/backend/resources';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons';
import PaperCardDynamic from 'components/PaperCard/PaperCardDynamic';
import { CLASSES } from 'constants/graphSettings';
import { useSelector } from 'react-redux';
import HeaderSearchButton from 'components/HeaderSearchButton/HeaderSearchButton';

const Papers = () => {
    const pageSize = 25;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [verified, setVerified] = useState(null);
    const [statements, setStatements] = useState([]);
    const [paperResources, setPaperResources] = useState([]);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [totalElements, setTotalElements] = useState(0);
    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        document.title = 'Papers - ORKG';
    }, []);

    const loadMorePapers = () => {
        setIsNextPageLoading(true);
        getResourcesByClass({
            id: CLASSES.PAPER,
            page: page,
            items: pageSize,
            sortBy: 'created_at',
            desc: true,
            verified: verified
        })
            .then(result => {
                // update paper resources for paperCards preview
                setPaperResources(prevPaperResources => [...prevPaperResources, ...result.content]);
                setIsNextPageLoading(false);
                setHasNextPage(!result.last);
                setPage(prevPage => prevPage + 1);
                setIsLastPageReached(result.last);
                setTotalElements(result.totalElements);
                // Fetch the data of each paper
                fetchDataForPapers(result.content);
            })
            .catch(error => {
                setIsNextPageLoading(false);
                setHasNextPage(false);
                setIsLastPageReached(false);
                console.log(error);
            });
    };

    const fetchDataForPapers = papers => {
        if (papers.length > 0) {
            // Fetch the data of each paper
            getStatementsBySubjects({ ids: papers.map(p => p.id) })
                .then(result => {
                    // prevents to update the state when component is not mounted!
                    setStatements(prevStatements => [...prevStatements, ...result]);
                    setIsNextPageLoading(false);
                })
                .catch(error => {
                    setIsLastPageReached(true);
                    setHasNextPage(false);
                    setIsNextPageLoading(false);
                    console.log(error);
                });
        } else {
            setIsLastPageReached(true);
            setHasNextPage(false);
            setIsNextPageLoading(false);
        }
    };

    useEffect(() => {
        loadMorePapers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [verified]);

    const toggle = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const changeFilter = filter => {
        setVerified(filter);
        setPage(0);
        setPaperResources([]);
        setStatements([]);
        setIsNextPageLoading(false);
        setHasNextPage(false);
        setIsLastPageReached(false);
    };

    return (
        <>
            <Container className="d-flex align-items-center">
                <div className="d-flex flex-grow-1 mt-4 mb-4">
                    <h1 className="h4">View all papers</h1>
                    <div className="text-muted ml-3 mt-1">
                        {totalElements === 0 && isNextPageLoading ? <Icon icon={faSpinner} spin /> : totalElements} papers
                    </div>
                </div>
                <ButtonGroup>
                    {!!user && user.isCurationAllowed && (
                        <ButtonDropdown size="sm" isOpen={dropdownOpen} toggle={toggle}>
                            <DropdownToggle caret color="secondary">
                                {verified === true && 'Verified'}
                                {verified === false && 'Unverified'}
                                {verified === null && 'All'}
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={e => changeFilter(null)}>All</DropdownItem>
                                <DropdownItem onClick={e => changeFilter(true)}>Verified</DropdownItem>
                                <DropdownItem onClick={e => changeFilter(false)}>Unverified</DropdownItem>
                            </DropdownMenu>
                        </ButtonDropdown>
                    )}
                    {verified === null && <HeaderSearchButton placeholder="Search papers..." type={CLASSES.PAPER} />}
                </ButtonGroup>
            </Container>
            <Container className="p-0">
                <ListGroup flush className="box rounded" style={{ overflow: 'hidden' }}>
                    {paperResources.length > 0 &&
                        paperResources.map(paper => {
                            const paperCardData = statements.find(({ id }) => id === paper.id);
                            return (
                                <PaperCardDynamic
                                    paper={{ title: paper.label, id: paper.id, paperData: paperCardData, created_by: paper.created_by }}
                                    key={`pc${paper.id}`}
                                />
                            );
                        })}
                    {totalElements === 0 && !isNextPageLoading && (
                        <ListGroupItem tag="div" className="text-center p-4">
                            No Papers
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
                            onClick={!isNextPageLoading ? loadMorePapers : undefined}
                        >
                            <Icon icon={faAngleDoubleDown} /> Load more papers
                        </ListGroupItem>
                    )}
                    {!hasNextPage && isLastPageReached && totalElements !== 0 && (
                        <ListGroupItem tag="div" className="text-center">
                            You have reached the last page.
                        </ListGroupItem>
                    )}
                </ListGroup>
            </Container>
        </>
    );
};

export default Papers;
