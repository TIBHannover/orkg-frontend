import { faCircleInfo, faFile, faGraduationCap, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Chip, Popover, Switch } from '@heroui/react';
import dayjs from 'dayjs';
import { isString } from 'lodash';
import Link from 'next/link';
import pluralize from 'pluralize';
import { useState } from 'react';
import useSWR from 'swr';

import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
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
            <div className="flex items-center justify-between">
                {!isString(author) && (
                    <Link href={reverse(ROUTES.AUTHOR_PAGE, { authorId: author.id })} target="_blank">
                        {author.label}
                    </Link>
                )}
                {isString(author) && <span>{author}</span>}
                {isVisibleShowCitations && (
                    <div className="ml-4 flex items-center gap-1">
                        <Popover>
                            <Button isIconOnly aria-label="About citations" size="sm" variant="ghost" className="text-muted">
                                <FontAwesomeIcon icon={faCircleInfo} />
                            </Button>
                            <Popover.Content className="max-w-72">
                                <Popover.Dialog>
                                    <Popover.Arrow />
                                    <p className="text-sm">
                                        This feature is in beta, citation counts might be inaccurate or wrong. Citation data provided by{' '}
                                        <a href="https://www.semanticscholar.org/" target="_blank" rel="noreferrer">
                                            Semantic Scholar
                                        </a>
                                        .
                                    </p>
                                </Popover.Dialog>
                            </Popover.Content>
                        </Popover>
                        <Switch size="sm" isSelected={isCitationsEnabled} onChange={() => setIsCitationsEnabled((v) => !v)}>
                            <Switch.Control>
                                <Switch.Thumb />
                            </Switch.Control>
                            <Switch.Content>
                                <span className="text-sm">Show citations</span>
                            </Switch.Content>
                        </Switch>
                    </div>
                )}
            </div>
            <div className="mt-1 text-sm">
                {isVisibleGoogleScholar && (
                    <a href={GOOGLE_SCHOLAR_URL + encodeURIComponent(authorLabel)} target="_blank" rel="noreferrer" className="mr-1">
                        <Chip size="sm" variant="soft">
                            <FontAwesomeIcon icon={faGraduationCap} className="text-accent" /> <span>Google Scholar</span>
                        </Chip>
                    </a>
                )}
                {paperAmount !== undefined && <span className="ml-1 text-muted">{pluralize('paper', paperAmount, true)}</span>}
                {papers?.map((paper, index) => (
                    <Link key={index} href={reverse(ROUTES.VIEW_PAPER, { resourceId: paper.paper_id })} target="_blank">
                        <Chip size="sm" variant="soft" className="ml-1">
                            <FontAwesomeIcon icon={faFile} className="text-accent" /> {dayjs.localeData().ordinal(paper.author_index + 1)} author
                            {paper.paper_year ? ` - ${paper.paper_year}` : ''}
                        </Chip>
                    </Link>
                ))}

                {isCitationsEnabled && (
                    <ul className="my-2 flex w-full list-none flex-col divide-y divide-border overflow-hidden rounded-(--radius) border border-border bg-surface p-0">
                        {!isLoadingSemanticScholar &&
                            semanticScholarAuthors?.data?.map((result) => (
                                <li key={result.authorId} className="px-4 py-2">
                                    <a href={result.url} target="_blank" rel="noreferrer">
                                        {result.name}
                                    </a>{' '}
                                    - Citations {result.citationCount} - h-index {result.hIndex}
                                </li>
                            ))}
                        {!isLoadingSemanticScholar && semanticScholarAuthors?.data?.length === 0 && <li className="px-4 py-2">Author not found</li>}
                        {isLoadingSemanticScholar && (
                            <li className="px-4 py-2">
                                <FontAwesomeIcon icon={faSpinner} spin /> Loading
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </>
    );
};

export default AuthorCard;
