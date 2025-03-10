import { faFile, faGraduationCap, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from 'components/FloatingUI/Tooltip';
import ROUTES from 'constants/routes';
import { isString } from 'lodash';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Badge, FormGroup, Input, Label, ListGroup, ListGroupItem } from 'reactstrap';
import { getAuthorsByLabel } from 'services/semanticScholar';

const GOOGLE_SCHOLAR_URL = 'https://scholar.google.com/scholar?q=';

const SEMANTIC_SCHOLAR_AUTHORS_LIMIT = 3;
function AuthorCard({ author, paperAmount = null, papers = null, isVisibleGoogleScholar = false, isVisibleShowCitations = false }) {
    const [isCitationsEnabled, setIsCitationsEnabled] = useState(false);
    const [semanticScholarAuthors, setSemanticScholarAuthors] = useState([]);
    const [isLoadingSemanticScholar, setIsLoadingSemanticScholar] = useState(false);
    const [isLoadedSemanticScholar, setIsLoadedSemanticScholar] = useState(false);
    const authorLabel = isString(author) ? author : author?.label;

    useEffect(() => {
        (async () => {
            if (!isCitationsEnabled || !authorLabel || isLoadedSemanticScholar) {
                return;
            }

            try {
                setIsLoadingSemanticScholar(true);
                setSemanticScholarAuthors((await getAuthorsByLabel({ label: authorLabel, limit: SEMANTIC_SCHOLAR_AUTHORS_LIMIT }))?.data ?? []);
                setIsLoadingSemanticScholar(false);
                setIsLoadedSemanticScholar(true);
            } catch (e) {
                toast.error('Error while loading Semantic Scholar citation data. Please try it again in a few minutes.');
                console.error(e);
            }
        })();
    }, [authorLabel, isCitationsEnabled, isLoadedSemanticScholar, semanticScholarAuthors]);

    return (
        <>
            <div className="d-flex justify-content-between">
                {!isString(author) && (
                    <Link href={reverse(ROUTES.AUTHOR_PAGE, { authorId: author.id })} target="_blank">
                        {author.label}
                    </Link>
                )}
                {isString(author) && <span>{author}</span>}
                {isVisibleShowCitations && (
                    <small>
                        <FormGroup switch className="d-inline-block ms-3">
                            <Label check>
                                <Input type="switch" role="switch" checked={isCitationsEnabled} onChange={() => setIsCitationsEnabled((v) => !v)} />
                                <Tooltip
                                    content={
                                        <>
                                            This feature is in beta, citation counts might be inaccurate or wrong. Citation data provided by{' '}
                                            <a href="https://www.semanticscholar.org/" target="_blank" rel="noreferrer">
                                                Semantic Scholar
                                            </a>
                                            .
                                        </>
                                    }
                                >
                                    <span>Show citations</span>
                                </Tooltip>
                            </Label>
                        </FormGroup>
                    </small>
                )}
            </div>
            <small>
                {isVisibleGoogleScholar && (
                    <a href={GOOGLE_SCHOLAR_URL + encodeURIComponent(authorLabel)} target="_blank" rel="noreferrer" className="me-1">
                        <Badge color="light" size="sm">
                            <FontAwesomeIcon icon={faGraduationCap} className="text-primary" /> <span>Google Scholar</span>
                        </Badge>
                    </a>
                )}
                {paperAmount && <span className="text-muted ms-1">{paperAmount}</span>}
                {papers &&
                    papers.map((paper, index) => (
                        <Link key={index} href={reverse(ROUTES.VIEW_PAPER, { resourceId: paper.paper_id })} target="_blank">
                            <Badge color="light" size="sm" className="ms-1">
                                <FontAwesomeIcon icon={faFile} className="text-primary" /> {dayjs.localeData().ordinal(paper.author_index + 1)} author
                                {paper.paper_year ? ` - ${paper.paper_year}` : ''}
                            </Badge>
                        </Link>
                    ))}

                {isCitationsEnabled && (
                    <ListGroup className="my-2">
                        {semanticScholarAuthors.length > 0 &&
                            semanticScholarAuthors.map((result) => (
                                <ListGroupItem key={result.authorId}>
                                    <a href={result.url} target="_blank" rel="noreferrer">
                                        {result.name}
                                    </a>{' '}
                                    - Citations {result.citationCount} - h-index {result.hIndex}
                                </ListGroupItem>
                            ))}
                        {isLoadedSemanticScholar && semanticScholarAuthors.length === 0 && <ListGroupItem>Author not found</ListGroupItem>}
                        {isLoadingSemanticScholar && (
                            <ListGroupItem>
                                <FontAwesomeIcon icon={faSpinner} spin /> Loading
                            </ListGroupItem>
                        )}
                    </ListGroup>
                )}
            </small>
        </>
    );
}

AuthorCard.propTypes = {
    author: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    paperAmount: PropTypes.string,
    papers: PropTypes.array,
    semanticScholarAuthors: PropTypes.array,
    isVisibleGoogleScholar: PropTypes.bool,
    isVisibleShowCitations: PropTypes.bool,
};

export default AuthorCard;
