import { useState, useEffect } from 'react';
import { ListGroup, Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getResourcesByClass } from 'services/backend/resources';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getPaperData } from 'utils';
import { find } from 'lodash';
import PaperCard from 'components/PaperCard/PaperCard';
import { CLASSES } from 'constants/graphSettings';

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
            items: 14,
            returnContent: true
        });

        getStatementsBySubjects({
            ids: responseJson.map(p => p.id)
        })
            .then(papersStatements => {
                const papers = papersStatements.map(paperStatements => {
                    const paperSubject = find(responseJson, {
                        id: paperStatements.id
                    });
                    return getPaperData(paperSubject, paperStatements.statements);
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
        <div className="pt-2 pb-3">
            <div className="d-flex justify-content-end mb-2 mr-2">
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
                            {papers.map(paper => {
                                return (
                                    paper && (
                                        <PaperCard
                                            paper={{
                                                id: paper.id,
                                                title: paper.label,
                                                ...paper
                                            }}
                                            key={`pc${paper.id}`}
                                        />
                                    )
                                );
                            })}
                        </ListGroup>

                        <div className="text-center mt-2">
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
