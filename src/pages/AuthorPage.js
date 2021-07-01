import { useState, useEffect, useCallback } from 'react';
import { Container, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Button, ListGroup } from 'reactstrap';
import { getStatementsByObject, getStatementsBySubject, getStatementsBySubjects } from 'services/backend/statements';
import PaperCard from 'components/PaperCard/PaperCard';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import VisualizationCard from 'components/VisualizationCard/VisualizationCard';
import { SubTitle, SubtitleSeparator } from 'components/styled';
import SmartReviewCard from 'components/SmartReviewCard/SmartReviewCard';
import ClassesBadgesFilter from 'components/ClassesBadgesFilter/ClassesBadgesFilter';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faOrcid, faLinkedin, faGoogle, faResearchgate } from '@fortawesome/free-brands-svg-icons';
import { faSpinner, faExternalLinkAlt, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import { getPaperData, getComparisonData, getVisualizationData } from 'utils';
import { find } from 'lodash';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import { NavLink, Link, useParams } from 'react-router-dom';
import ContentLoader from 'react-content-loader';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import { filterObjectOfStatementsByPredicateAndClass } from 'utils';

const AuthorMetaInfo = styled.div`
    border-right: 1px ${props => props.theme.secondary} solid;
    &:last-of-type {
        border-right: none;
    }
    .value {
        margin-bottom: 10px;
    }
`;

const AuthorPage = () => {
    const [loading, setLoading] = useState(true);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [author, setAuthor] = useState(null);
    const [resources, setResources] = useState([]);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const pageSize = 15;
    const params = useParams();

    const loadAuthorData = useCallback(() => {
        // Get the author data
        getStatementsBySubject({ id: params.authorId }).then(authorStatements => {
            const orcid = filterObjectOfStatementsByPredicateAndClass(authorStatements, PREDICATES.HAS_ORCID, true);
            const linkedin = filterObjectOfStatementsByPredicateAndClass(authorStatements, 'P40005', true);
            const researchgate = filterObjectOfStatementsByPredicateAndClass(authorStatements, 'P40004', true);
            const googleScholar = filterObjectOfStatementsByPredicateAndClass(authorStatements, 'P40003', true);

            if (authorStatements.length > 0) {
                setAuthor({ ...authorStatements[0].subject, orcid, linkedin, researchgate, googleScholar });
                setLoading(false);
                document.title = `${authorStatements[0].subject.label} - ORKG`;
            }
        });
    }, [params.authorId]);

    const loadMorePapers = useCallback(
        page => {
            setIsNextPageLoading(true);
            // Get the statements that contains the author as an object
            getStatementsByObject({
                id: params.authorId,
                page: page,
                items: pageSize,
                sortBy: 'created_at',
                desc: true
            }).then(result => {
                // resource
                if (result.length > 0) {
                    // Fetch the data of each paper
                    getStatementsBySubjects({
                        ids: result.filter(statement => statement.predicate.id === PREDICATES.HAS_AUTHOR).map(p => p.subject.id)
                    })
                        .then(statements => {
                            const items = statements.map(itemStatements => {
                                const itemSubject = find(result.map(p => p.subject), { id: itemStatements.id });
                                if (itemSubject?.classes?.includes(CLASSES.PAPER)) {
                                    return getPaperData(itemSubject, itemStatements.statements);
                                }
                                if (itemSubject?.classes?.includes(CLASSES.COMPARISON)) {
                                    return getComparisonData(itemSubject, itemStatements.statements);
                                }
                                if (itemSubject?.classes?.includes(CLASSES.VISUALIZATION)) {
                                    return getVisualizationData(itemSubject, itemStatements.statements);
                                }
                                if (itemSubject?.classes?.includes(CLASSES.SMART_REVIEW)) {
                                    return getPaperData(itemSubject, itemStatements.statements);
                                }
                                return undefined;
                            });
                            setPage(page + 1);
                            setIsNextPageLoading(false);
                            setResources(prevResources => [...prevResources, ...items]);
                            setHasNextPage(false);
                        })
                        .catch(error => {
                            setIsNextPageLoading(false);
                            setHasNextPage(false);
                            setIsLastPageReached(true);
                            console.log(error);
                        });
                } else {
                    setIsNextPageLoading(false);
                    setHasNextPage(false);
                    setIsLastPageReached(true);
                }
            });
        },
        [params.authorId]
    );

    const renderItem = item => {
        if (item?.classes?.includes(CLASSES.PAPER)) {
            return (
                <PaperCard
                    paper={{
                        id: item.id,
                        title: item.label,
                        ...item
                    }}
                    showBadge={true}
                    showCurationFlags={false}
                    showAddToComparison={false}
                    key={`p${item.id}`}
                />
            );
        }
        if (item?.classes?.includes(CLASSES.COMPARISON)) {
            return (
                <ComparisonCard
                    comparison={{
                        id: item.id,
                        title: item.label,
                        ...item
                    }}
                    showBadge={true}
                    showCurationFlags={false}
                    showAddToComparison={false}
                    key={`c${item.id}`}
                />
            );
        }
        if (item?.classes?.includes(CLASSES.VISUALIZATION)) {
            return (
                <VisualizationCard
                    visualization={{
                        id: item.id,
                        title: item.label,
                        ...item
                    }}
                    showBadge={true}
                    showCurationFlags={false}
                    showAddToComparison={false}
                    key={`c${item.id}`}
                />
            );
        }
        if (item?.classes?.includes(CLASSES.SMART_REVIEW)) {
            return <SmartReviewCard versions={[item]} showBadge={true} showCurationFlags={false} showAddToComparison={false} key={`c${item.id}`} />;
        }
        return null;
    };

    useEffect(() => {
        loadAuthorData();
        loadMorePapers();
    }, [loadAuthorData, loadMorePapers]);

    return (
        <>
            {loading && (
                <div className="text-center mt-4 mb-4">
                    <Icon icon={faSpinner} spin /> Loading
                </div>
            )}
            {!loading && (
                <div>
                    <Container className="d-flex align-items-center mt-4 mb-4">
                        <h1 className="h4 flex-shrink-0 mb-0">Author</h1>
                        <>
                            <SubtitleSeparator />
                            <SubTitle className="h5 mb-0"> {author.label}</SubTitle>
                        </>
                        <ButtonDropdown
                            className="flex-shrink-0"
                            style={{ marginLeft: 'auto' }}
                            isOpen={menuOpen}
                            toggle={() => setMenuOpen(v => !v)}
                            nav
                            inNavbar
                        >
                            <DropdownToggle size="sm" color="secondary" className="px-3 rounded-right" style={{ marginLeft: 2 }}>
                                <Icon icon={faEllipsisV} />
                            </DropdownToggle>
                            <DropdownMenu right>
                                <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id: params.authorId })}>
                                    View resource
                                </DropdownItem>
                            </DropdownMenu>
                        </ButtonDropdown>
                    </Container>
                    <Container className="p-0">
                        <div className="box rounded p-4 mb-3">
                            <div className="d-flex">
                                {author.orcid && (
                                    <AuthorMetaInfo className="flex-grow-1 mr-3">
                                        <div className="key">
                                            ORCID <Icon color="#A6CE39" icon={faOrcid} />
                                        </div>
                                        <div className="value">
                                            <a href={`https://orcid.org/${author.orcid.label}`} target="_blank" rel="noopener noreferrer">
                                                {author.orcid.label} <Icon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </AuthorMetaInfo>
                                )}
                                {author.googleScholar && (
                                    <AuthorMetaInfo className="flex-grow-1 mr-3">
                                        <div className="key">
                                            Google Scholar <Icon icon={faGoogle} />
                                        </div>
                                        <div className="value">
                                            <a
                                                href={`https://scholar.google.com/citations?user=${author.googleScholar.label}=en&oi=ao`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {author.googleScholar.label} <Icon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </AuthorMetaInfo>
                                )}
                                {author.researchgate && (
                                    <AuthorMetaInfo className="flex-grow-1 mr-3">
                                        <div className="key">
                                            ResearchGate <Icon icon={faResearchgate} />
                                        </div>
                                        <div className="value">
                                            <a
                                                href={`https://www.researchgate.net/profile/${author.researchgate.label}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {author.researchgate.label} <Icon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </AuthorMetaInfo>
                                )}
                                {author.linkedin && (
                                    <AuthorMetaInfo className="flex-grow-1 mr-3">
                                        <div className="key">
                                            Linkedin <Icon icon={faLinkedin} />
                                        </div>
                                        <div className="value">
                                            <a
                                                href={`https://linkedin.com/profile/${author.linkedin.label}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {author.linkedin.label} <Icon icon={faExternalLinkAlt} />
                                            </a>
                                        </div>
                                    </AuthorMetaInfo>
                                )}
                            </div>
                        </div>
                    </Container>
                    <Container className="d-flex align-items-center mt-4 mb-4">
                        <div className="d-flex flex-grow-1">
                            <h1 className="h5 flex-shrink-0 mb-0 mr-1">Works</h1>
                            <div className="flex-shrink-0" style={{ marginLeft: 'auto' }}>
                                <ClassesBadgesFilter />
                            </div>
                        </div>
                    </Container>
                    <Container className="p-0">
                        {resources.length > 0 && (
                            <ListGroup>
                                {resources.map(resource => {
                                    return resource && renderItem(resource);
                                })}
                                {!isNextPageLoading && hasNextPage && (
                                    <div
                                        style={{ cursor: 'pointer' }}
                                        className="list-group-item list-group-item-action text-center"
                                        onClick={!isNextPageLoading ? loadMorePapers : undefined}
                                        onKeyDown={e => (e.keyCode === 13 ? (!isNextPageLoading ? loadMorePapers : undefined) : undefined)}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        Load more papers
                                    </div>
                                )}
                                {!hasNextPage && isLastPageReached && page !== 1 && (
                                    <div className="text-center mt-3">You have reached the last page.</div>
                                )}
                            </ListGroup>
                        )}
                        {resources.length === 0 && !isNextPageLoading && (
                            <div>
                                <div className="p-5 text-center mt-4 mb-4">
                                    There are no papers for this research field, yet.
                                    <br />
                                    <br />
                                    <Link to={ROUTES.ADD_PAPER.GENERAL_DATA}>
                                        <Button size="sm" color="primary " className="mr-3">
                                            Add paper
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                        {isNextPageLoading && (
                            <div className={`text-center mt-4 mb-4 ${page === 0 ? 'p-5 container box rounded' : ''}`}>
                                {page !== 0 && (
                                    <>
                                        <Icon icon={faSpinner} spin /> Loading
                                    </>
                                )}
                                {page === 0 && (
                                    <div className="text-left">
                                        <ContentLoader
                                            speed={2}
                                            width={400}
                                            height={50}
                                            viewBox="0 0 400 50"
                                            style={{ width: '100% !important' }}
                                            backgroundColor="#f3f3f3"
                                            foregroundColor="#ecebeb"
                                        >
                                            <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                                            <rect x="0" y="25" rx="3" ry="3" width="300" height="20" />
                                        </ContentLoader>
                                    </div>
                                )}
                            </div>
                        )}
                    </Container>
                    <ComparisonPopup />
                </div>
            )}
        </>
    );
};

export default AuthorPage;
