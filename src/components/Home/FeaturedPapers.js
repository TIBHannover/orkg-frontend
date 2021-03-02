import { useState, useEffect } from 'react';
import { ListGroup, ListGroupItem, Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { getResourcesByClass } from 'services/backend/resources';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import { getPaperData } from 'utils';
import { CLASSES, PREDICATES } from 'constants/graphSettings';

export default function FeaturedPapers() {
    const [papers, setPapers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState('featured');
    const [dropdownOpen, setOpen] = useState(false);

    const toggle = () => setOpen(!dropdownOpen);

    const loadPapers = async paperFilter => {
        setIsLoading(true);
        const responseJson = await getResourcesByClass({
            id: paperFilter === 'featured' ? CLASSES.FEATURED_PAPER : CLASSES.PAPER,
            sortBy: 'created_at',
            desc: true,
            items: 10,
            returnContent: true
        });

        const ids = responseJson.map(paper => getStatementsBySubjectAndPredicate({ subjectId: paper.id, predicateId: PREDICATES.HAS_AUTHOR }));

        Promise.all(ids)
            .then(papersStatements => {
                const papers = papersStatements.map((paperStatements, index) => {
                    const resourceSubject = responseJson[index];
                    return getPaperData(resourceSubject, paperStatements);
                });

                setPapers(papers);
                setIsLoading(false);
            })
            .catch(() => {
                setPapers([]);
                setIsLoading(false);
            });
    };

    useEffect(() => {
        loadPapers(filter);
    }, [filter]);

    return (
        <div className="pl-3 pr-3 pt-2 pb-3">
            <div className="d-flex justify-content-end mb-2">
                <ButtonDropdown size="sm" isOpen={dropdownOpen} toggle={toggle}>
                    <DropdownToggle caret color="lightblue">
                        {filter === 'featured' && 'Featured'}
                        {filter === 'latest' && 'Latest'}
                    </DropdownToggle>
                    <DropdownMenu right>
                        <DropdownItem onClick={() => setFilter('featured')}>Featured</DropdownItem>
                        <DropdownItem onClick={() => setFilter('latest')}>Latest</DropdownItem>
                    </DropdownMenu>
                </ButtonDropdown>
            </div>
            {!isLoading ? (
                papers.length > 0 ? (
                    <>
                        <ListGroup>
                            {papers.map((paper, index) => (
                                <ListGroupItem key={index} className="p-0 m-0 mb-4" style={{ border: 0 }}>
                                    <h5 className="h6">
                                        <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: paper.id })} style={{ color: 'inherit' }}>
                                            {paper.label ? paper.label : <em>No title</em>}
                                        </Link>
                                    </h5>
                                    {paper.authorNames && paper.authorNames.length > 0 && (
                                        <span className="badge badge-lightblue"> {paper.authorNames[0].label}</span>
                                    )}
                                </ListGroupItem>
                            ))}
                        </ListGroup>

                        <div className="text-center">
                            <Link to={ROUTES.PAPERS}>
                                <Button color="primary" className="mr-3" size="sm">
                                    View more
                                </Button>
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="text-center">{filter === 'featured' ? 'No featured paper found' : 'No paper found'}</div>
                )
            ) : (
                <div className="text-center">
                    <Icon icon={faSpinner} spin /> Loading
                </div>
            )}
        </div>
    );
}
