import { faFile, faGraduationCap, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { isString } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import pluralize from 'pluralize';
import { useState } from 'react';
import useSWR from 'swr';

import Tooltip from '@/components/FloatingUI/Tooltip';
import Badge from '@/components/Ui/Badge/Badge';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import ListGroup from '@/components/Ui/List/ListGroup';
import ListGroupItem from '@/components/Ui/List/ListGroupItem';
import ROUTES from '@/constants/routes';
import { Resource } from '@/services/backend/types';
import { getAuthorsByLabel, semanticScholarUrl } from '@/services/semanticScholar';

const GOOGLE_SCHOLAR_URL = 'https://scholar.google.com/scholar?q=';

const SEMANTIC_SCHOLAR_AUTHORS_LIMIT = 3;

type AuthorCardProps = {
    author: string | Resource;
    paperAmount?: number;
    papers?: { paper_id: string; paper_year: number; author_index: number }[];
    isVisibleGoogleScholar?: boolean;
    isVisibleShowCitations?: boolean;
};

const AuthorCard = ({ author, paperAmount, papers, isVisibleGoogleScholar = false, isVisibleShowCitations = false }: AuthorCardProps) => {
    const [isCitationsEnabled, setIsCitationsEnabled] = useState(false);
    const authorLabel = isString(author) ? author : author?.label;

    const { data: semanticScholarAuthors, isLoading: isLoadingSemanticScholar } = useSWR(
        isCitationsEnabled && authorLabel
            ? [{ label: authorLabel, limit: SEMANTIC_SCHOLAR_AUTHORS_LIMIT }, semanticScholarUrl, 'getAuthorsByLabel']
            : null,
        ([_params]) => getAuthorsByLabel(_params),
    );

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
                {paperAmount !== undefined && <span className="text-muted ms-1">{pluralize('paper', paperAmount, true)}</span>}
                {papers &&
                    papers?.map((paper, index) => (
                        <Link key={index} href={reverse(ROUTES.VIEW_PAPER, { resourceId: paper.paper_id })} target="_blank">
                            <Badge color="light" size="sm" className="ms-1">
                                <FontAwesomeIcon icon={faFile} className="text-primary" /> {dayjs.localeData().ordinal(paper.author_index + 1)} author
                                {paper.paper_year ? ` - ${paper.paper_year}` : ''}
                            </Badge>
                        </Link>
                    ))}

                {isCitationsEnabled && (
                    <ListGroup className="my-2">
                        {!isLoadingSemanticScholar &&
                            semanticScholarAuthors?.data &&
                            semanticScholarAuthors?.data?.map((result) => (
                                <ListGroupItem key={result.authorId}>
                                    <a href={result.url} target="_blank" rel="noreferrer">
                                        {result.name}
                                    </a>{' '}
                                    - Citations {result.citationCount} - h-index {result.hIndex}
                                </ListGroupItem>
                            ))}
                        {!isLoadingSemanticScholar && semanticScholarAuthors?.data?.length === 0 && <ListGroupItem>Author not found</ListGroupItem>}
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
};

export default AuthorCard;
